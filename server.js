// =============================================================================
// Library Book Tracker - Backend Server (Express.js)
// =============================================================================

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BOOKS_FILE = path.join(__dirname, 'books.json');

// -----------------------------------------------------------------------------
// Middleware Configuration
// -----------------------------------------------------------------------------
// Parse incoming JSON request bodies (req.body)
app.use(express.json());

// Serve static frontend files (HTML, CSS, JS) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// -----------------------------------------------------------------------------
// Helper Functions for Data Storage (books.json)
// -----------------------------------------------------------------------------

/**
 * Reads all books from books.json file.
 * If the file does not exist, it creates an empty file with an empty array [].
 * Handles file reading errors gracefully.
 */
const readBooksFromFile = () => {
  try {
    if (!fs.existsSync(BOOKS_FILE)) {
      fs.writeFileSync(BOOKS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const fileData = fs.readFileSync(BOOKS_FILE, 'utf-8');
    // If file is empty, return empty array
    if (!fileData.trim()) {
      return [];
    }
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading books.json:', error.message);
    return [];
  }
};

/**
 * Writes the books array to books.json file with 2-space indentation.
 */
const writeBooksToFile = (books) => {
  try {
    fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to books.json:', error.message);
    return false;
  }
};

// -----------------------------------------------------------------------------
// REST API Routes
// -----------------------------------------------------------------------------

/**
 * 1. GET /books
 * Description: Retrieve all books from books.json.
 * Optional Query Param: ?category=Science (filters by category if provided)
 * Response: 200 OK with array of books.
 */
app.get('/books', (req, res) => {
  try {
    const books = readBooksFromFile();
    const { category } = req.query;

    // Optional query parameter filtering
    if (category && category !== 'All') {
      const filtered = books.filter(
        (b) => b.category.toLowerCase() === category.toLowerCase()
      );
      return res.status(200).json(filtered);
    }

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve books from server' });
  }
});

/**
 * 2. POST /books
 * Description: Add a new book to books.json.
 * Request Body: { title, author, category, year }
 * Response: 201 Created with newly added book, or 400 Bad Request if invalid.
 */
app.post('/books', (req, res) => {
  try {
    const { title, author, category, year } = req.body;

    // Field Validation: check for missing or empty fields
    if (!title || !author || !category || !year) {
      return res.status(400).json({
        error: 'Validation failed: title, author, category, and year are all required.'
      });
    }

    const trimmedTitle = String(title).trim();
    const trimmedAuthor = String(author).trim();
    const trimmedCategory = String(category).trim();
    const parsedYear = parseInt(year, 10);

    if (!trimmedTitle || !trimmedAuthor || !trimmedCategory) {
      return res.status(400).json({
        error: 'Validation failed: Fields cannot be empty or contain only whitespace.'
      });
    }

    const currentYear = new Date().getFullYear();
    if (isNaN(parsedYear) || parsedYear < 1000 || parsedYear > currentYear + 1) {
      return res.status(400).json({
        error: `Validation failed: Publication year must be a valid year between 1000 and ${currentYear + 1}.`
      });
    }

    // Load existing books
    const books = readBooksFromFile();

    // Generate unique ID using timestamp
    const newBook = {
      id: Date.now().toString(),
      title: trimmedTitle,
      author: trimmedAuthor,
      category: trimmedCategory,
      year: parsedYear
    };

    // Append and save to books.json
    books.push(newBook);
    const saveSuccess = writeBooksToFile(books);

    if (!saveSuccess) {
      return res.status(500).json({ error: 'Failed to persist book to storage' });
    }

    // Return 201 Created status
    res.status(201).json({
      message: 'Book added successfully',
      book: newBook
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error while adding book' });
  }
});

/**
 * 3. DELETE /books/:id
 * Description: Delete a book by its unique ID.
 * Response: 200 OK with success message, or 404 Not Found if id does not exist.
 */
app.delete('/books/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    const books = readBooksFromFile();
    const bookIndex = books.findIndex((b) => String(b.id) === String(id));

    if (bookIndex === -1) {
      return res.status(404).json({ error: `Book with id "${id}" not found.` });
    }

    // Remove the book from the array
    const deletedBook = books.splice(bookIndex, 1)[0];
    const saveSuccess = writeBooksToFile(books);

    if (!saveSuccess) {
      return res.status(500).json({ error: 'Failed to update books storage after deletion' });
    }

    res.status(200).json({
      message: 'Book deleted successfully',
      deletedBook
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error while deleting book' });
  }
});

// -----------------------------------------------------------------------------
// Start Server
// -----------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`📚 Library Book Tracker Server running!`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📁 Data Storage: ${BOOKS_FILE}`);
  console.log(`====================================================`);
});
