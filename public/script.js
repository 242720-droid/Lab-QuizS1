// =============================================================================
// Library Book Tracker - Vanilla JavaScript Frontend
// =============================================================================

// In-memory array holding all books retrieved from the backend
let allBooks = [];

// DOM Element References
const addBookForm = document.getElementById('addBookForm');
const bookTitleInput = document.getElementById('bookTitle');
const bookAuthorInput = document.getElementById('bookAuthor');
const bookCategoryInput = document.getElementById('bookCategory');
const bookYearInput = document.getElementById('bookYear');
const submitBtn = document.getElementById('submitBtn');

const categoryFilter = document.getElementById('categoryFilter');
const booksContainer = document.getElementById('booksContainer');
const emptyState = document.getElementById('emptyState');
const emptyStateText = document.getElementById('emptyStateText');
const loadingSpinner = document.getElementById('loadingSpinner');
const totalBooksBadge = document.getElementById('totalBooksBadge');
const filteredCount = document.getElementById('filteredCount');
const alertBox = document.getElementById('alertBox');
const alertMessage = document.getElementById('alertMessage');

// =============================================================================
// Helper Functions: UI & Alert Feedback
// =============================================================================

/**
 * Displays an alert message banner with Bootstrap styling.
 * @param {string} message - Message text to display.
 * @param {string} type - 'success', 'danger', or 'warning'.
 */
const showAlert = (message, type = 'success') => {
  alertBox.className = `alert alert-${type} alert-dismissible fade show shadow-sm`;
  alertMessage.innerHTML = `<i class="bi ${
    type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'
  } me-2"></i>${message}`;
  alertBox.classList.remove('d-none');

  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    hideAlert();
  }, 4000);
};

/**
 * Hides the alert message banner.
 */
const hideAlert = () => {
  alertBox.classList.add('d-none');
};

/**
 * Returns a CSS class name for badges based on book category.
 * Demonstrates clean mapping of categories to visual badges.
 * @param {string} category 
 * @returns {string} CSS class
 */
const getCategoryBadgeClass = (category) => {
  const normalized = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const supported = [
    'fiction',
    'non-fiction',
    'science',
    'technology',
    'history',
    'philosophy',
    'biography'
  ];
  return supported.includes(normalized) ? `category-${normalized}` : 'category-default';
};

// =============================================================================
// Core Feature 1: Fetch Books from Backend API (async/await)
// =============================================================================

/**
 * Fetches the list of books from the backend GET /books endpoint using async/await.
 */
const fetchBooks = async () => {
  try {
    loadingSpinner.classList.remove('d-none');
    booksContainer.innerHTML = '';
    emptyState.classList.add('d-none');

    const response = await fetch('/books');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const books = await response.json();
    allBooks = books;

    // Update UI counters and display cards
    updateTotalCounter();
    applyCategoryFilter();
  } catch (error) {
    console.error('Error fetching books:', error);
    showAlert('Could not load books from server. Please verify backend is running.', 'danger');
  } finally {
    loadingSpinner.classList.add('d-none');
  }
};

// =============================================================================
// Core Feature 2: Display Books Using Bootstrap Cards & Array map()
// =============================================================================

/**
 * Renders an array of books into Bootstrap cards using Array.prototype.map().
 * Uses DOM manipulation to populate the booksContainer.
 * @param {Array} booksToRender 
 */
const renderBooks = (booksToRender) => {
  // Update the filtered count display
  filteredCount.textContent = booksToRender.length;

  if (booksToRender.length === 0) {
    booksContainer.innerHTML = '';
    emptyState.classList.remove('d-none');
    const selected = categoryFilter.value;
    emptyStateText.textContent =
      selected === 'All'
        ? 'Your library is currently empty. Use the form on the left to add a book!'
        : `No books found under category "${selected}".`;
    return;
  }

  emptyState.classList.add('d-none');

  // Use Array map() to transform each book object into an HTML string card
  const cardsHtmlArray = booksToRender.map((book) => {
    const badgeClass = getCategoryBadgeClass(book.category);
    return `
      <div class="col" id="book-card-${book.id}">
        <div class="card h-100 shadow-sm book-card border-0">
          <div class="card-body d-flex flex-column p-4">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge badge-category ${badgeClass}">
                <i class="bi bi-tag-fill me-1"></i>${escapeHtml(book.category)}
              </span>
              <span class="text-muted small">
                <i class="bi bi-calendar3 me-1"></i>${book.year}
              </span>
            </div>

            <h5 class="card-title fw-bold text-dark mb-1 text-truncate" title="${escapeHtml(book.title)}">
              ${escapeHtml(book.title)}
            </h5>

            <p class="card-text text-muted small mb-3">
              <i class="bi bi-person-fill text-secondary me-1"></i>by 
              <strong>${escapeHtml(book.author)}</strong>
            </p>

            <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
              <small class="text-muted">ID: #${escapeHtml(String(book.id).slice(-4))}</small>
              <button
                class="btn btn-outline-danger btn-sm btn-delete"
                data-id="${book.id}"
                data-title="${escapeHtml(book.title)}"
                title="Delete this book"
              >
                <i class="bi bi-trash3-fill me-1"></i>Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  // DOM manipulation: Inject cards into container
  booksContainer.innerHTML = cardsHtmlArray.join('');
};

/**
 * Escapes HTML characters to prevent XSS.
 * @param {string} str 
 * @returns {string}
 */
const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Updates the total books counter badge in the navbar.
 */
const updateTotalCounter = () => {
  totalBooksBadge.textContent = allBooks.length;
};

// =============================================================================
// Core Feature 3: Category Filter Using Array filter()
// =============================================================================

/**
 * Filters the in-memory allBooks array using Array.prototype.filter().
 * Arrow function used as required.
 */
const applyCategoryFilter = () => {
  const selectedCategory = categoryFilter.value;

  // Use array filter() to filter books based on selected dropdown value
  const filteredBooks =
    selectedCategory === 'All'
      ? allBooks
      : allBooks.filter((book) => book.category === selectedCategory);

  renderBooks(filteredBooks);
};

/**
 * Resets category filter to 'All'.
 */
const resetFilter = () => {
  categoryFilter.value = 'All';
  applyCategoryFilter();
};

// =============================================================================
// Core Feature 4: Form Validation & Adding Books (POST /books)
// =============================================================================

/**
 * Validates all form input fields.
 * Ensures no empty or whitespace-only inputs and verifies valid year.
 * @returns {boolean} isValid
 */
const validateForm = () => {
  let isValid = true;
  const currentYear = new Date().getFullYear();

  // Validate Title
  if (!bookTitleInput.value.trim()) {
    bookTitleInput.classList.add('is-invalid');
    isValid = false;
  } else {
    bookTitleInput.classList.remove('is-invalid');
  }

  // Validate Author
  if (!bookAuthorInput.value.trim()) {
    bookAuthorInput.classList.add('is-invalid');
    isValid = false;
  } else {
    bookAuthorInput.classList.remove('is-invalid');
  }

  // Validate Category
  if (!bookCategoryInput.value) {
    bookCategoryInput.classList.add('is-invalid');
    isValid = false;
  } else {
    bookCategoryInput.classList.remove('is-invalid');
  }

  // Validate Publication Year
  const yearVal = parseInt(bookYearInput.value, 10);
  if (isNaN(yearVal) || yearVal < 1000 || yearVal > currentYear + 1) {
    bookYearInput.classList.add('is-invalid');
    isValid = false;
  } else {
    bookYearInput.classList.remove('is-invalid');
  }

  return isValid;
};

/**
 * Handles adding a new book via POST /books using async/await.
 * @param {Event} e 
 */
const handleAddBook = async (e) => {
  e.preventDefault();

  // Validate all fields
  if (!validateForm()) {
    showAlert('Please fill in all required fields with valid values.', 'danger');
    return;
  }

  const newBookData = {
    title: bookTitleInput.value.trim(),
    author: bookAuthorInput.value.trim(),
    category: bookCategoryInput.value,
    year: parseInt(bookYearInput.value, 10)
  };

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Adding...';

    // Send POST request to backend API
    const response = await fetch('/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newBookData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to add book');
    }

    // Success feedback
    showAlert(`"${newBookData.title}" was successfully added!`, 'success');

    // Reset the form and clear validation styles
    addBookForm.reset();
    [bookTitleInput, bookAuthorInput, bookCategoryInput, bookYearInput].forEach((input) => {
      input.classList.remove('is-invalid');
    });

    // Re-fetch books to ensure persistent sync with backend
    await fetchBooks();
  } catch (error) {
    console.error('Error adding book:', error);
    showAlert(error.message || 'Error occurred while saving book.', 'danger');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-bookmark-plus me-1"></i> Add Book';
  }
};

// =============================================================================
// Core Feature 5: Deleting Books (DELETE /books/:id) with Event Delegation
// =============================================================================

/**
 * Handles deleting a book using DOM manipulation and backend DELETE API.
 * Uses event delegation attached to the books container.
 * @param {Event} e 
 */
const handleDeleteBook = async (e) => {
  // Check if click target is a delete button or inside one
  const deleteBtn = e.target.closest('.btn-delete');
  if (!deleteBtn) return;

  const bookId = deleteBtn.getAttribute('data-id');
  const bookTitle = deleteBtn.getAttribute('data-title');

  // Confirmation dialog
  const confirmed = window.confirm(`Are you sure you want to delete "${bookTitle}"?`);
  if (!confirmed) return;

  try {
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Deleting...';

    // Send DELETE request to backend API
    const response = await fetch(`/books/${bookId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete book');
    }

    showAlert(`"${bookTitle}" was deleted successfully.`, 'success');

    // DOM Manipulation: Smooth removal of the card from the UI
    const cardElement = document.getElementById(`book-card-${bookId}`);
    if (cardElement) {
      cardElement.remove();
    }

    // Update in-memory array using filter()
    allBooks = allBooks.filter((book) => String(book.id) !== String(bookId));

    // Update counters & UI
    updateTotalCounter();
    applyCategoryFilter();
  } catch (error) {
    console.error('Error deleting book:', error);
    showAlert(error.message || 'Error deleting book from server.', 'danger');
    deleteBtn.disabled = false;
    deleteBtn.innerHTML = '<i class="bi bi-trash3-fill me-1"></i>Delete';
  }
};

// =============================================================================
// Event Listeners Initialization
// =============================================================================

// Form submit event for adding books
addBookForm.addEventListener('submit', handleAddBook);

// Live validation removal on input change
[bookTitleInput, bookAuthorInput, bookCategoryInput, bookYearInput].forEach((input) => {
  input.addEventListener('input', () => {
    if (input.value.trim()) {
      input.classList.remove('is-invalid');
    }
  });
});

// Category filter change event
categoryFilter.addEventListener('change', applyCategoryFilter);

// Event delegation for delete buttons on books container
booksContainer.addEventListener('click', handleDeleteBook);

// Load books on initial page load
document.addEventListener('DOMContentLoaded', () => {
  fetchBooks();
});
