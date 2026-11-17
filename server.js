require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();

const cors = require('cors');
app.use(cors());



const PORT = Number(process.env.PORT || 3001);
const pool = new Pool({
  host: process.env.PGHOST || process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.PGPORT || process.env.MYSQL_PORT || 5432),
  user: process.env.PGUSER || process.env.MYSQL_USER,
  password: process.env.PGPASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.PGDATABASE || process.env.MYSQL_DATABASE,
  max: 10,
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", __dirname);

async function bookAlreadyExists(isbn, title, author) {
  const query = isbn
    ? "SELECT 1 FROM book_library WHERE UPPER(REGEXP_REPLACE(COALESCE(book_isbn, ''), '[^[:alnum:]]', '', 'g')) = $1 LIMIT 1"
    : "SELECT 1 FROM book_library WHERE LOWER(BTRIM(book_title)) = LOWER($1) AND LOWER(BTRIM(COALESCE(author, ''))) = LOWER($2) LIMIT 1";
  const values = isbn ? [isbn] : [title, author || ""];
  const { rows } = await pool.query(query, values);
  return rows.length > 0;
}

      //add book_id and make primary search now since using isbn caused issues
app.get("/api/books", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT  book_id, book_title, author, book_genre, publication_date, book_description, book_isbn FROM book_library ORDER BY book_title"
    );
    res.json(rows);
  } catch (error) {
    console.error("Could not retrieve books from book_library:", error);
    res.status(500).json({ error: "Could not retrieve books from the database." });
  }
});


app.get("/api/books/:id", async (req, res) => {

  try {
    const id = Number(req.params.id);          
    if (Number.isNaN(id)) {                    
      return res.status(400).json({ error: "Book id must be a number." });
    }

    const { rows } = await pool.query(
      "SELECT book_id, book_title, author, book_genre, publication_date, book_description, book_isbn FROM book_library WHERE book_id = $1",
      [id]                                     //will replce $1 just placeholder
    );

    if (rows.length === 0) {                   
      return res.status(404).json({ error: "Book not found." });
    }
    res.json(rows[0]);                        
  } catch (error) {
    console.error("Could not retrieve book from book_library:", error);
    res.status(500).json({ error: "Could not retrieve the book from the database." });
  }
});




app.post("/api/books", async (req, res) => {
  const body =
    req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const title = typeof body.book_title === "string" ? body.book_title.trim() : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";
  const genre = typeof body.book_genre === "string" ? body.book_genre.trim() : "";
  const publicationDate =
    typeof body.publication_date === "string" ? body.publication_date.trim() : "";
  const description =
    typeof body.book_description === "string" ? body.book_description.trim() : "";
  const rawIsbn = typeof body.book_isbn === "string" ? body.book_isbn.trim() : "";
  const normalizedIsbn = rawIsbn.replace(/[^a-z0-9]/gi, "").toUpperCase();
  const isbn = normalizedIsbn || null;

  if (
    !title ||
    title.length > 200 ||
    author.length > 200 ||
    genre.length > 50 ||
    publicationDate.length > 10 ||
    description.length > 800 ||
    (isbn && isbn.length > 15) ||
    (publicationDate && !/^\d{4}-\d{2}-\d{2}$/.test(publicationDate))
  ) {
    return res.status(400).json({ error: "Enter valid book details and try again." });
  }

  try {
    if (await bookAlreadyExists(isbn, title, author)) {
      return res.status(409).json({
        error: isbn
          ? "A book with this ISBN already exists."
          : "A book with this title and author already exists.",
      });
    }

    const { rows } = await pool.query(
      "INSERT INTO book_library (book_title, author, book_genre, publication_date, book_description, book_isbn) VALUES ($1, $2, $3, $4, $5, $6) RETURNING book_title, author, book_genre, publication_date, book_description, book_isbn",
      [
        title,
        author || null,
        genre || null,
        publicationDate || null,
        description || null,
        isbn,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Could not save book:", error);
    res.status(500).json({ error: "Could not save the book to the database." });
  }
});

app.get("/", (req, res) => {
  res.redirect("/books");
});

app.get("/books", async (req, res) => {
  try {
    const { rows: books } = await pool.query(
      "SELECT book_title AS title, author, book_genre AS genre, publication_date, book_description AS description, book_isbn AS isbn FROM book_library ORDER BY book_title"
    );
    res.render("express", { books });
  } catch (error) {
    console.error("Could not retrieve books:", error);
    res.status(500).send("Could not retrieve books. Check the server logs.");
  }
});

app.post("/books", async (req, res) => {
  const body =
    req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const title = typeof body.book_title === "string" ? body.book_title.trim() : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";
  const genre = typeof body.book_genre === "string" ? body.book_genre.trim() : "";
  const publicationDate =
    typeof body.publication_date === "string" ? body.publication_date.trim() : "";
  const description =
    typeof body.book_description === "string" ? body.book_description.trim() : "";
  const rawIsbn = typeof body.book_isbn === "string" ? body.book_isbn.trim() : "";
  const isbn = rawIsbn.replace(/[^a-z0-9]/gi, "").toUpperCase() || null;

  if (!title) {
    return res.status(400).send("A book title is required.");
  }

  try {
    if (await bookAlreadyExists(isbn, title, author)) {
      return res.status(409).send("That book is already in the database.");
    }

    await pool.query(
      "INSERT INTO book_library (book_title, author, book_genre, publication_date, book_description, book_isbn) VALUES ($1, $2, $3, $4, $5, $6)",
      [title, author || null, genre || null, publicationDate || null, description || null, isbn]
    );
    res.redirect("/books");
  } catch (error) {
    console.error("Could not save book:", error);
    res.status(500).send("Could not save the book. Check the server logs.");
  }
});

async function startServer() {
  try {
    const connection = await pool.connect();
    connection.release();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not connect to PostgreSQL. Check your .env settings:", error);
    process.exitCode = 1;
  }
}

startServer();