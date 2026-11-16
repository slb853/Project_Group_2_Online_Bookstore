function BookDetails({ book, onBack }) {
  return (
    <main className="book-details">
      <button className="book-details-back" type="button" onClick={onBack}>
        &larr; Back to books
      </button>

      <article className="book-details-card">
        <img
          className="book-details-cover"
          src={book.cover}
          alt={`Cover of ${book.title}`}
        />

        <div className="book-details-content">
          <p className="book-details-genre">{book.genre}</p>
          <h2>{book.title}</h2>
          <p className="book-details-author">By {book.author}</p>
          <p className="book-details-description">{book.description}</p>

          <dl className="book-details-meta">
            <div>
              <dt>Genre</dt>
              <dd>{book.genre}</dd>
            </div>
            <div>
              <dt>ISBN</dt>
              <dd>{book.isbn}</dd>
            </div>
          </dl>
        </div>
      </article>
    </main>
  );
}

export default BookDetails;
