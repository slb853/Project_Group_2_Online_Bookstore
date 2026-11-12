
import { useState } from "react";

const sampleBooks = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Classic Fiction",
    cover: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg"
  },
  {
    id: 2,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    cover: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg"
  },
  {
    id: 3,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Classic Fiction",
    cover: "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg"
  }
];


function BookList() {
  const [searchTerm, setSearchTerm] = useState("");

const filteredBooks = sampleBooks.filter((book) => {
  const search = searchTerm.toLowerCase();

  return (
    book.title.toLowerCase().includes(search) ||
    book.author.toLowerCase().includes(search) ||
    book.genre.toLowerCase().includes(search)
  );
});


  return (
    <div>
     
<header className="book-header" id="home">
  <h1>Online Bookstore</h1>

  <nav className="book-nav" aria-label="Main navigation">
    <a href="#home">Home</a>
    <a href="#books">Books</a>
    <a href="#reviews">Reviews</a>
  </nav>
</header>

<div className="book-search">
  <input
    type="text"
    placeholder="Search books by title, author, or genre..."
    aria-label="Search books"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  <button type="button">Search</button>
</div>


        <h2 id="books">Browse Books</h2>


      <div className="book-list">

    {filteredBooks.length === 0 && (
        <p className="no-results">
        No books found. Please try a different search.
        </p>
    )}

        {filteredBooks.map((book) => (

          <div className="book-card" key={book.id}>
            <img
              src={book.cover}
              alt={`Cover of ${book.title}`}
              width="150"
            />
            <h3>{book.title}</h3>
            <p>Author: {book.author}</p>
            <p>Genre: {book.genre}</p>
            <button type="button">View Details</button>
          </div>
        ))}
      </div>


    <section className="popular-books">
        <h2>Most Popular Books</h2>
        <p>Explore some of our featured books!</p>
    </section>
<div className="popular-list">
  <p>1. The Great Gatsby — F. Scott Fitzgerald</p>
  <p>2. Pride and Prejudice — Jane Austen</p>
  <p>3. To Kill a Mockingbird — Harper Lee</p>
</div>


    </div>
  );
}

export default BookList;
