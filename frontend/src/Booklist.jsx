import { useState, useEffect } from "react";

function Booklist() {
  const [books, setBooks] = useState([]);            
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);   
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");



  useEffect(() => {
    fetch("/api/books")
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();                              
      })
      .then((data) => setBooks(data))                   
      .catch(() =>
        setError("Could not load books. Check that the backend is running.")
      )
      .finally(() => setIsLoading(false));
  }, []);

  
  function openDetails(bookId) {
    fetch(`/api/books/${bookId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Server error");
        return res.json();
      })
      .then((data) => setSelectedBook(data))
      .catch(() => setError("Could not load that book's details."));
  }






  const filteredBooks = books.filter((book) => {
    const search = searchTerm.toLowerCase();
    return (
      (book.book_title || "").toLowerCase().includes(search) ||
      (book.author || "").toLowerCase().includes(search) ||
      (book.book_genre || "").toLowerCase().includes(search)
    );
  });



  return (

    <div>
      <header className="book-header" id="home">
        <h1>Online Bookstore</h1>

        <nav className="book-nav" aria-label="Main navigation">
          <a href="#home" onClick={() => setSelectedBook(null)}>Home</a>
          <a href="#books" onClick={() => setSelectedBook(null)}>Books</a>
          <a href="#reviews">Reviews</a>
        </nav>
      </header>

      {error && <p className="no-results">{error}</p>}

      {selectedBook ? (

        <div className="book-details">
          {selectedBook.book_isbn && (
            <img
              src={`https://covers.openlibrary.org/b/isbn/${selectedBook.book_isbn}-L.jpg`}
              alt={`Cover of ${selectedBook.book_title}`}
              width="200"
            />
          )}
          <h2>{selectedBook.book_title}</h2>
          <p>Author: {selectedBook.author || "Unknown author"}</p>
          <p>Genre: {selectedBook.book_genre || "Uncategorized"}</p>
          <p>Published: {selectedBook.publication_date || "Unknown"}</p>
          <p>ISBN: {selectedBook.book_isbn || "Not available"}</p>
          <p>{selectedBook.book_description || "No description provided."}</p>
          <button type="button" onClick={() => setSelectedBook(null)}>
            Back to books
          </button>
        </div>
      ) : (

        <>
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

          {isLoading && <p className="no-results">Loading books...</p>}

          <div className="book-list">
            {!isLoading && !error && filteredBooks.length === 0 && (
              <p className="no-results">
                No books found. Please try a different search.
              </p>
            )}
            {filteredBooks.map((book) => (
              <div className="book-card" key={book.book_id}>
                {book.book_isbn ? (
                  <img
                    src={`https://covers.openlibrary.org/b/isbn/${book.book_isbn}-L.jpg`}
                    alt={`Cover of ${book.book_title}`}
                    width="150"
                  />
                ) : (
                  <div className="book-cover-placeholder">No cover available</div>
                )}
                <h3>{book.book_title}</h3>
                <p>Author: {book.author || "Unknown author"}</p>
                <p>Genre: {book.book_genre || "Uncategorized"}</p>
                <button type="button" onClick={() => openDetails(book.book_id)}>
                  View Details
                </button>
              </div>
            ))}
          </div>


        </>
      )}
    </div>
  );
}

export default Booklist;