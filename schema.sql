CREATE TABLE IF NOT EXISTS book_library (
    book_title VARCHAR(200) NOT NULL,
    author VARCHAR(200),
    book_genre VARCHAR(50),
    publication_date VARCHAR(10),
    book_description VARCHAR(800),
    book_isbn VARCHAR(15)
);
