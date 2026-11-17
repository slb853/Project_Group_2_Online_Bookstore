require('dotenv').config();                     
const { Pool } = require('pg');



const pool = new Pool({
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

// below settings are changeable depending on how many books you want to add, all of it you can change
const topics = ['fantasy']; 
const BOOKS_PER_TOPIC = 25;                                
const REQUIRE_ISBN = true;                                 
const FETCH_DESCRIPTIONS = true;                           





const HEADERS = { 'User-Agent': 'OnlineBookstoreClassProject (student project)' };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));   


function clean(text, max) {
  if (!text) return null;
  return String(text).slice(0, max);
}




function pickIsbn13(isbns) {
  return (isbns || []).find((isbn) => /^\d{13}$/.test(isbn)) || null;
}

async function getDescription(workKey) {
  try {
    const response = await fetch(`https://openlibrary.org${workKey}.json`, { headers: HEADERS });
    if (!response.ok) return null;
    const work = await response.json();
    const d = work.description;
    
    return typeof d === 'string' ? d : d && d.value ? d.value : null;
  } catch {
    return null;
  }
}

async function seed() {
  let added = 0;
  try {
    for (const topic of topics) {
      const url =
        'https://openlibrary.org/search.json' +
        `?q=${encodeURIComponent(`subject:"${topic}"`)}` +
        `&limit=${BOOKS_PER_TOPIC}&fields=key,title,author_name,first_publish_year,isbn`;

      const response = await fetch(url, { headers: HEADERS });   

      if (!response.ok) {
        console.log(`Skipping "${topic}" (API said ${response.status})`);
        continue;                                                
      }

      const data = await response.json();

      for (const doc of data.docs || []) {                             

        const isbn = pickIsbn13(doc.isbn);
        if (REQUIRE_ISBN && !isbn) continue;                 

        const title = clean(doc.title, 200);

      
        const exists = await pool.query(
          'SELECT 1 FROM book_library WHERE book_title = $1',
          [title]
        );
        if (exists.rows.length > 0) continue;

        let description = null;
        if (FETCH_DESCRIPTIONS) {
          description = await getDescription(doc.key);
                                 
        }

        await pool.query(
          `INSERT INTO book_library
             (book_title, author, book_genre, publication_date, book_description, book_isbn)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            title,
            clean((doc.author_name || []).join(', '), 200),
            clean(topic.charAt(0).toUpperCase() + topic.slice(1), 50),
            doc.first_publish_year ? String(doc.first_publish_year) : null,
            clean(description, 800),
            isbn,
          ]
        );
        added++;
        console.log(`Added: ${title}`);
      }
              
      
      
    }






    console.log(`Done. Added ${added} new book(s).`);
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await pool.end();                                            
  }
}

seed();