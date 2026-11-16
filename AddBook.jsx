import { useState } from "react";

const emptyBook = {
  book_title: "",
  author: "",
  book_genre: "",
  publication_date: "",
  book_description: "",
  book_isbn: "",
};

async function readResponse(response) {
  const text = await response.text();
  let result;

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Could not reach the book service. Check that the backend is running.");
  }

  if (!response.ok) {
    throw new Error(result.error || "Could not save this book.");
  }

  return result;
}

function AddBook({ onCancel, onBookCreated }) {
  const [book, setBook] = useState(emptyBook);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setBook((currentBook) => ({ ...currentBook, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...book,
          author: book.author.trim() || null,
          book_genre: book.book_genre.trim() || null,
          publication_date: book.publication_date || null,
          book_description: book.book_description.trim() || null,
          book_isbn: book.book_isbn.trim() || null,
        }),
      });
      const createdBook = await readResponse(response);

      onBookCreated(createdBook);
      setBook(emptyBook);
      setSuccess(`“${createdBook.book_title}” was added to the database.`);
    } catch (requestError) {
      setError(requestError.message || "Could not save this book.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="add-book-page">
      <button className="add-book-back" type="button" onClick={onCancel}>
        &larr; Back to books
      </button>

      <section className="add-book-panel" aria-labelledby="add-book-title">
        <h2 id="add-book-title">Add a new book</h2>
        <p>Enter the book’s details. Books already in the database will be rejected.</p>

        <form className="add-book-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              name="book_title"
              value={book.book_title}
              onChange={handleChange}
              maxLength="200"
              required
            />
          </label>

          <label>
            Author (optional)
            <input
              name="author"
              value={book.author}
              onChange={handleChange}
              maxLength="200"
            />
          </label>

          <label>
            Genre (optional)
            <input
              name="book_genre"
              value={book.book_genre}
              onChange={handleChange}
              maxLength="50"
            />
          </label>

          <label>
            Publication date (optional)
            <input
              name="publication_date"
              type="date"
              value={book.publication_date}
              onChange={handleChange}
            />
          </label>

          <label>
            ISBN (optional)
            <input
              name="book_isbn"
              value={book.book_isbn}
              onChange={handleChange}
              maxLength="30"
            />
          </label>

          <label className="add-book-description">
            Description (optional)
            <textarea
              name="book_description"
              value={book.book_description}
              onChange={handleChange}
              maxLength="800"
              rows="4"
            />
          </label>

          <div className="add-book-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save book"}
            </button>
            <button className="add-book-cancel" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>

        {error && <p className="add-book-message error" role="alert">{error}</p>}
        {success && <p className="add-book-message success" role="status">{success}</p>}
      </section>
    </main>
  );
}

export default AddBook;
