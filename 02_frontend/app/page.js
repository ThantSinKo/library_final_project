"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedBook, setSelectedBook] = useState(null);
  const [reviews, setReviews] = useState([]);

  const genres = ["all", "Fiction", "Dystopian", "Romance", "Fantasy", "Adventure", "Political Fiction"];

  useEffect(() => {
    async function fetchData() {
      try {
        const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3001";
        
        // Fetch books
        const booksRes = await fetch(`${apiHost}/api/books`, { cache: "no-store" });
        if (!booksRes.ok) throw new Error("Failed to fetch books");
        const booksData = await booksRes.json();
        setBooks(booksData);
        setFilteredBooks(booksData);

        // Fetch stats
        const statsRes = await fetch(`${apiHost}/api/stats`, { cache: "no-store" });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = books;

    // Filter by genre
    if (selectedGenre !== "all") {
      filtered = filtered.filter((book) => book.genre === selectedGenre);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBooks(filtered);
  }, [searchQuery, selectedGenre, books]);

  async function handleBookClick(book) {
    setSelectedBook(book);
    
    // Fetch reviews for the selected book
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3001";
      const res = await fetch(`${apiHost}/api/reviews/book/${book.id}`);
      if (res.ok) {
        const reviewsData = await res.json();
        setReviews(reviewsData);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  }

  function closeModal() {
    setSelectedBook(null);
    setReviews([]);
  }

  if (loading) {
    return (
      <main className="container">
        <div className="empty">
          <div className="spinner"></div>
          <p>Loading library...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <div className="empty error">
          <span className="icon">⚠️</span>
          <p>Error: {error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="header">
        <h1 className="title">📚 Book Library</h1>
        <p className="subtitle">Discover your next great read</p>
        
        {stats && (
          <div className="stats-bar">
            <div className="stat">
              <span className="stat-value">{stats.total_books}</span>
              <span className="stat-label">Books</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.total_users}</span>
              <span className="stat-label">Members</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.active_borrowings}</span>
              <span className="stat-label">On Loan</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.total_reviews}</span>
              <span className="stat-label">Reviews</span>
            </div>
          </div>
        )}
      </header>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search books by title, author, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            aria-label="Search books"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="clear-btn"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="genre-filters">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`genre-btn ${selectedGenre === genre ? "active" : ""}`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {!filteredBooks || filteredBooks.length === 0 ? (
        <div className="empty">
          <span className="icon">📖</span>
          <p>No books found matching your criteria.</p>
          {(searchQuery || selectedGenre !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedGenre("all");
              }}
              className="reset-btn"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="results-info">
            Showing {filteredBooks.length} {filteredBooks.length === 1 ? "book" : "books"}
          </div>
          <section className="grid" aria-live="polite">
            {filteredBooks.map((book) => (
              <article
                key={book.id}
                className="card book-card"
                tabIndex={0}
                onClick={() => handleBookClick(book)}
                onKeyDown={(e) => e.key === "Enter" && handleBookClick(book)}
                role="button"
                aria-label={`View details for ${book.title}`}
              >
                {book.cover_image && (
                  <div className="media">
                    <img
                      src={book.cover_image}
                      alt={`Cover of ${book.title}`}
                      className="img book-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="availability-badge">
                      {book.available_copies > 0 ? (
                        <span className="badge available">
                          ✓ {book.available_copies} Available
                        </span>
                      ) : (
                        <span className="badge unavailable">✗ On Loan</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="body">
                  <h3 className="card-title">{book.title}</h3>
                  <p className="author">by {book.author}</p>
                  
                  {book.description && (
                    <p className="detail">{book.description.substring(0, 120)}...</p>
                  )}

                  <div className="meta">
                    <span className="badge-genre">{book.genre}</span>
                    <small className="year">{book.published_year}</small>
                  </div>

                  {book.pages && (
                    <div className="pages">
                      <small>{book.pages} pages</small>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} aria-label="Close modal">
              ✕
            </button>

            <div className="modal-content">
              <div className="modal-header">
                {selectedBook.cover_image && (
                  <img
                    src={selectedBook.cover_image}
                    alt={`Cover of ${selectedBook.title}`}
                    className="modal-cover"
                  />
                )}
                <div className="modal-info">
                  <h2>{selectedBook.title}</h2>
                  <p className="modal-author">by {selectedBook.author}</p>
                  <div className="modal-meta">
                    <span className="badge-genre">{selectedBook.genre}</span>
                    <span className="year">{selectedBook.published_year}</span>
                  </div>
                  {selectedBook.publisher && (
                    <p className="publisher">Publisher: {selectedBook.publisher}</p>
                  )}
                  {selectedBook.isbn && (
                    <p className="isbn">ISBN: {selectedBook.isbn}</p>
                  )}
                  {selectedBook.pages && (
                    <p className="pages">{selectedBook.pages} pages</p>
                  )}
                  <div className="availability">
                    <strong>Availability:</strong>{" "}
                    {selectedBook.available_copies > 0 ? (
                      <span className="available-text">
                        {selectedBook.available_copies} of {selectedBook.total_copies} available
                      </span>
                    ) : (
                      <span className="unavailable-text">All copies on loan</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedBook.description && (
                <div className="modal-description">
                  <h3>Description</h3>
                  <p>{selectedBook.description}</p>
                </div>
              )}

              {reviews.length > 0 && (
                <div className="modal-reviews">
                  <h3>Reviews ({reviews.length})</h3>
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review.id} className="review">
                        <div className="review-header">
                          <strong>{review.full_name || review.username}</strong>
                          <div className="rating">
                            {"⭐".repeat(review.rating)}
                            <span className="rating-text">({review.rating}/5)</span>
                          </div>
                        </div>
                        {review.comment && <p className="review-comment">{review.comment}</p>}
                        <small className="review-date">{review.review_date}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}