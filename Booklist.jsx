import { useEffect, useState } from "react";
import AddBook from "./AddBook";
import BookDetails from "./BookDetails";

function toBook(book, index) {
  const isbn = book.book_isbn || "";

  return {
    id: book.book_id ?? (isbn || `${book.book_title}-${book.author || "unknown"}-${index}`),
    title: book.book_title,
    author: book.author || "Unknown author",
    genre: book.book_genre || "Uncategorized",
    description: book.book_description || "No description provided.",
    publicationDate: book.publication_date || "",
    isbn,
    cover: isbn
      ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
      : "",
  };
}

async function readBooksResponse(response) {
  const text = await response.text();
  let result;

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Could not reach the book API. Check that the backend is running.");
  }

  if (!response.ok) {
    throw new Error(result.error || "Could not load books from the database.");
  }

  return result;
}

function BookList() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadBooks() {
      try {
        const response = await fetch("/api/books");
        const result = await readBooksResponse(response);
        if (!Array.isArray(result)) {
          throw new Error("The book API returned an invalid response.");
        }
        if (isMounted) {
          setBooks(result.map(toBook));
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error.message || "Could not load books from the database.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBooks();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBooks = books.filter((book) => {
    const search = searchTerm.toLowerCase();
    return [book.title, book.author, book.genre, book.isbn].some((value) =>
      value.toLowerCase().includes(search)
    );
  });

  return (
    <div>
      <header className="book-header" id="home">
        <h1>Online Bookstore</h1>
        <nav className="book-nav" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#books" onClick={() => setIsAddingBook(false)}>
            Books
          </a>
          <button
            className="book-nav-add"
            type="button"
            onClick={() => {
              setSelectedBook(null);
              setIsAddingBook(true);
            }}
          >
            Add a book
          </button>
        </nav>
      </header>

      {isAddingBook ? (
        <AddBook
          onCancel={() => setIsAddingBook(false)}
          onBookCreated={(createdBook) => {
            setBooks((currentBooks) =>
              [...currentBooks, toBook(createdBook, currentBooks.length)].sort(
                (a, b) => a.title.localeCompare(b.title)
              )
            );
          }}
        />
      ) : selectedBook ? (
        <BookDetails book={selectedBook} onBack={() => setSelectedBook(null)} />
      ) : (
        <main>
          <div className="book-search">
            <input
              type="search"
              placeholder="Search books by title, author, or genre..."
              aria-label="Search books"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <h2 id="books">Browse Books</h2>

          {loadError && (
            <p className="add-book-message error" role="alert">
              {loadError}
            </p>
          )}

          {!loadError &&
            (isLoading ? (
              <p className="no-results">Loading books...</p>
            ) : (
              <div className="book-list">
                {filteredBooks.length === 0 ? (
                  <p className="no-results">No books are in the database yet.</p>
                ) : (
                  filteredBooks.map((book) => (
                    <article className="book-card" key={book.id}>
                      {book.cover ? (
                        <img
                          src={book.cover}
                          alt={`Cover of ${book.title}`}
                          width="150"
                        />
                      ) : (
                        <div className="book-cover-placeholder">No cover available</div>
                      )}
                      <h3>{book.title}</h3>
                      <p>Author: {book.author}</p>
                      <p>Genre: {book.genre}</p>
                      <button type="button" onClick={() => setSelectedBook(book)}>
                        View Details
                      </button>
                    </article>
                  ))
                )}
              </div>
            ))}
        </main>
      )}
    </div>
  );
}

export default BookList;
