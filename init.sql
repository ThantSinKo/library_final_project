-- ============================================
-- Books Table
-- ============================================
CREATE TABLE `books` (
  `id` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isbn` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `publisher` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published_year` int(4) NOT NULL,
  `genre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cover_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pages` int(5) DEFAULT NULL,
  `available_copies` int(5) DEFAULT 1,
  `total_copies` int(5) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `books` (`id`, `title`, `author`, `isbn`, `publisher`, `published_year`, `genre`, `description`, `cover_image`, `pages`, `available_copies`, `total_copies`) VALUES
(1, 'To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 'J. B. Lippincott & Co.', 1960, 'Fiction', 'A gripping tale of racial injustice and childhood innocence in the American South during the 1930s. The story follows young Scout Finch and her father, lawyer Atticus Finch.', 'https://covers.openlibrary.org/b/id/8228691-L.jpg', 324, 3, 5),
(2, '1984', 'George Orwell', '978-0-452-28423-4', 'Secker & Warburg', 1949, 'Dystopian', 'A dystopian social science fiction novel that follows the life of Winston Smith, a low-ranking member of the Party in the nation of Oceania, where the Party exercises total control.', 'https://covers.openlibrary.org/b/id/7222246-L.jpg', 328, 2, 4),
(3, 'Pride and Prejudice', 'Jane Austen', '978-0-14-143951-8', 'T. Egerton', 1813, 'Romance', 'A romantic novel following the emotional development of Elizabeth Bennet, who learns about the repercussions of hasty judgments and comes to appreciate the difference between superficial goodness and actual goodness.', 'https://covers.openlibrary.org/b/id/8234385-L.jpg', 432, 4, 4),
(4, 'The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 'Charles Scribners Sons', 1925, 'Fiction', 'Set in the Jazz Age on Long Island, the novel depicts narrator Nick Carraways interactions with mysterious millionaire Jay Gatsby and Gatsbys obsession with his former lover, Daisy Buchanan.', 'https://covers.openlibrary.org/b/id/7222339-L.jpg', 180, 1, 3),
(5, 'Harry Potter and the Philosophers Stone', 'J.K. Rowling', '978-0-7475-3269-9', 'Bloomsbury', 1997, 'Fantasy', 'The first novel in the Harry Potter series follows Harry Potter, a young wizard who discovers his magical heritage on his eleventh birthday when he receives a letter of acceptance to Hogwarts.', 'https://covers.openlibrary.org/b/id/10521270-L.jpg', 223, 5, 6),
(6, 'The Hobbit', 'J.R.R. Tolkien', '978-0-547-92822-7', 'George Allen & Unwin', 1937, 'Fantasy', 'A fantasy novel that follows the quest of home-loving Bilbo Baggins, the hobbit, to win a share of the treasure guarded by Smaug the dragon.', 'https://covers.openlibrary.org/b/id/8261551-L.jpg', 310, 3, 3),
(7, 'The Catcher in the Rye', 'J.D. Salinger', '978-0-316-76948-0', 'Little, Brown and Company', 1951, 'Fiction', 'The story of teenage rebellion and angst, told through the eyes of Holden Caulfield, a teenager from New York City who is expelled from his prep school.', 'https://covers.openlibrary.org/b/id/8222417-L.jpg', 277, 2, 3),
(8, 'The Lord of the Rings', 'J.R.R. Tolkien', '978-0-618-64561-5', 'George Allen & Unwin', 1954, 'Fantasy', 'An epic high-fantasy novel following the quest to destroy the One Ring and ensure the destruction of its maker, the Dark Lord Sauron.', 'https://covers.openlibrary.org/b/id/8455451-L.jpg', 1178, 2, 4),
(9, 'Animal Farm', 'George Orwell', '978-0-452-28424-1', 'Secker & Warburg', 1945, 'Political Fiction', 'An allegorical novella reflecting events leading up to the Russian Revolution of 1917 and then on into the Stalinist era of the Soviet Union.', 'https://covers.openlibrary.org/b/id/8233701-L.jpg', 112, 4, 5),
(10, 'Brave New World', 'Aldous Huxley', '978-0-06-085052-4', 'Chatto & Windus', 1932, 'Dystopian', 'A dystopian novel set in a futuristic World State, whose citizens are environmentally engineered into an intelligence-based social hierarchy.', 'https://covers.openlibrary.org/b/id/8235657-L.jpg', 268, 3, 3),
(11, 'The Chronicles of Narnia', 'C.S. Lewis', '978-0-06-076489-0', 'Geoffrey Bles', 1950, 'Fantasy', 'A series of seven fantasy novels set in the magical land of Narnia, a place where animals talk, magic is common, and good battles evil.', 'https://covers.openlibrary.org/b/id/8244321-L.jpg', 767, 2, 2),
(12, 'Moby-Dick', 'Herman Melville', '978-0-14-243724-7', 'Harper & Brothers', 1851, 'Adventure', 'The narrative of Captain Ahabs obsessive quest for revenge against Moby Dick, the giant white sperm whale that bit off his leg on the ships previous voyage.', 'https://covers.openlibrary.org/b/id/8239988-L.jpg', 635, 1, 2);

ALTER TABLE `books`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `isbn` (`isbn`);

ALTER TABLE `books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;


-- ============================================
-- Users Table
-- ============================================
CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_since` date NOT NULL,
  `status` enum('active','suspended','inactive') COLLATE utf8mb4_unicode_ci DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `username`, `email`, `full_name`, `member_since`, `status`) VALUES
(1, 'john_doe', 'john.doe@email.com', 'John Doe', '2023-01-15', 'active'),
(2, 'sarah_smith', 'sarah.smith@email.com', 'Sarah Smith', '2023-03-22', 'active'),
(3, 'mike_wilson', 'mike.wilson@email.com', 'Michael Wilson', '2023-06-10', 'active'),
(4, 'emma_brown', 'emma.brown@email.com', 'Emma Brown', '2023-08-05', 'active'),
(5, 'david_jones', 'david.jones@email.com', 'David Jones', '2024-01-20', 'active'),
(6, 'lisa_taylor', 'lisa.taylor@email.com', 'Lisa Taylor', '2024-03-12', 'suspended');

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;


-- ============================================
-- Borrowings Table
-- ============================================
CREATE TABLE `borrowings` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `borrowed_date` date NOT NULL,
  `due_date` date NOT NULL,
  `returned_date` date DEFAULT NULL,
  `status` enum('borrowed','returned','overdue') COLLATE utf8mb4_unicode_ci DEFAULT 'borrowed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `borrowings` (`id`, `book_id`, `user_id`, `borrowed_date`, `due_date`, `returned_date`, `status`) VALUES
(1, 1, 1, '2024-10-01', '2024-10-15', '2024-10-14', 'returned'),
(2, 5, 2, '2024-10-05', '2024-10-19', '2024-10-18', 'returned'),
(3, 3, 3, '2024-10-10', '2024-10-24', NULL, 'borrowed'),
(4, 7, 4, '2024-10-12', '2024-10-26', NULL, 'borrowed'),
(5, 2, 1, '2024-10-15', '2024-10-29', NULL, 'borrowed'),
(6, 8, 5, '2024-09-20', '2024-10-04', NULL, 'overdue'),
(7, 4, 2, '2024-10-18', '2024-11-01', NULL, 'borrowed'),
(8, 6, 3, '2024-10-20', '2024-11-03', NULL, 'borrowed');

ALTER TABLE `borrowings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `user_id` (`user_id`);

ALTER TABLE `borrowings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `borrowings`
  ADD CONSTRAINT `borrowings_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `borrowings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;


-- ============================================
-- Reviews Table
-- ============================================
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(1) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `review_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `reviews` (`id`, `book_id`, `user_id`, `rating`, `comment`, `review_date`) VALUES
(1, 1, 1, 5, 'An absolute masterpiece! The storytelling is incredible and the themes are timeless.', '2024-10-15'),
(2, 5, 2, 5, 'Magical and enchanting! Perfect for both children and adults. Could not put it down.', '2024-10-19'),
(3, 2, 3, 4, 'Chilling and thought-provoking. Very relevant even today.', '2024-10-08'),
(4, 3, 4, 5, 'Beautiful romance with witty dialogue. Jane Austen is a genius!', '2024-10-11'),
(5, 7, 1, 3, 'Interesting perspective but felt a bit slow at times.', '2024-09-25'),
(6, 6, 5, 5, 'An adventure like no other! Tolkien created such a rich world.', '2024-09-30'),
(7, 4, 2, 4, 'Great portrayal of the American Dream. Beautifully written.', '2024-10-05'),
(8, 9, 4, 5, 'Simple yet powerful allegory. Everyone should read this.', '2024-10-13');

ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `user_id` (`user_id`);

ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;