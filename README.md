# 📚 Library Book Tracker

![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

A full-stack, responsive web application built for the **Full Stack Web Development Lab Quiz (Q1)**. The application allows users to manage a personal or academic book catalog with real-time persistent data storage, dynamic filtering, validation, and a dark minimalist UI.

---

## ✨ Features

- **🎨 Modern Dark Minimalist UI:** Styled with deep obsidian tones (`#0b0f19`), glassmorphic cards, glowing category badges, and **Plus Jakarta Sans** typography.
- **📱 Fully Responsive:** Powered by Bootstrap 5 with a responsive navigation bar, mobile-first layouts, and smooth card grid system.
- **📖 Complete CRUD Functionality:**
  - **Create:** Add new books with Title, Author, Category, and Publication Year.
  - **Read:** Fetch catalog asynchronously from the backend and render dynamically.
  - **Filter:** Instant category filtering using JavaScript `Array.prototype.filter()`.
  - **Delete:** Delete book entries via event delegation and REST API deletion.
- **🛡️ Robust Input Validation:** Prevents empty inputs, whitespace-only entries, and out-of-range publication years on both client and server sides.
- **💾 Persistent JSON Storage:** Data is stored in a structured `books.json` file on the server and persists across restarts.
- **🧪 Automated Test Suite:** 15 unit/integration assertions covering all REST endpoints, validation errors, and file persistence.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Bootstrap 5.3 | Semantic structure, custom dark theme, glassmorphism, responsive grid |
| **Icons & Fonts** | Bootstrap Icons, Plus Jakarta Sans | Vector iconography and minimalist typography |
| **Client Scripting** | Vanilla JavaScript (ES6+) | `fetch()`, `async/await`, DOM events, array `map()` & `filter()` |
| **Backend Runtime** | Node.js | Asynchronous JavaScript runtime environment |
| **Web Framework** | Express.js | RESTful routing, static file hosting, JSON body parsing |
| **Storage Engine** | JSON (`fs` module) | Server-side file persistence (`books.json`) |

---

## 📁 Project Structure

```text
library-book-tracker/
├── .gitignore             # Excludes node_modules, logs, and environment files
├── package.json           # Dependencies and project metadata
├── server.js              # Express.js server & REST API endpoints
├── books.json             # Persistent JSON storage file
├── test-api.js            # Automated test suite (15/15 tests)
├── README.md              # Project documentation
└── public/
    ├── index.html         # Responsive semantic HTML5 markup
    ├── style.css          # Dark minimalist design system & glassmorphism
    └── script.js          # Client-side logic, API calls, and DOM manipulation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)

### 1. Clone & Navigate
```bash
git clone <your-repository-url>
cd library-book-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch the Server
```bash
npm start
# or: node server.js
```

### 4. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)** in any modern web browser.

---

## 📡 REST API Documentation

The backend exposes a clean RESTful interface:

### 1. Retrieve All Books
- **Endpoint:** `GET /books`
- **Query Params (Optional):** `?category=Technology` (filters by category)
- **Response:** `200 OK`
```json
[
  {
    "id": "1",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "category": "Technology",
    "year": 2008
  }
]
```

### 2. Add a New Book
- **Endpoint:** `POST /books`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "title": "Introduction to Algorithms",
  "author": "Thomas H. Cormen",
  "category": "Technology",
  "year": 2009
}
```
- **Responses:**
  - `201 Created`: Book saved successfully.
  - `400 Bad Request`: Missing fields or invalid year.

### 3. Delete a Book
- **Endpoint:** `DELETE /books/:id`
- **Responses:**
  - `200 OK`: Book removed from storage.
  - `404 Not Found`: ID does not match any existing book.

---

## 🧪 Automated Testing

A dedicated test runner (`test-api.js`) is included to verify all endpoints, validation logic, and storage persistence:

```bash
node test-api.js
```

### Test Coverage Summary:
- ✅ `GET /books` returns 200 OK and JSON array.
- ✅ `POST /books` rejects missing fields with 400 Bad Request.
- ✅ `POST /books` creates valid book and assigns unique ID.
- ✅ Storage verification: Book is written directly to `books.json`.
- ✅ Category query filter returns matching subset.
- ✅ `DELETE /books/:id` removes book and updates `books.json`.
- ✅ `DELETE /books/:id` with invalid ID returns 404 Not Found.

---

## 💡 Code Highlights (Viva Reference)

### 1. Array `map()` for Dynamic DOM Rendering
```javascript
// public/script.js
const cardsHtmlArray = booksToRender.map((book) => {
  const badgeClass = getCategoryBadgeClass(book.category);
  return `
    <div class="col" id="book-card-${book.id}">
      <div class="card h-100 book-card">
        <!-- Card Content -->
      </div>
    </div>
  `;
});
booksContainer.innerHTML = cardsHtmlArray.join('');
```

### 2. Array `filter()` for Category Sorting
```javascript
// public/script.js
const filteredBooks = selectedCategory === 'All'
  ? allBooks
  : allBooks.filter((book) => book.category === selectedCategory);
```

### 3. Event Delegation for Deletion
```javascript
// Attaching a single event listener to the parent container
booksContainer.addEventListener('click', handleDeleteBook);

const handleDeleteBook = async (e) => {
  const deleteBtn = e.target.closest('.btn-delete');
  if (!deleteBtn) return;
  const bookId = deleteBtn.getAttribute('data-id');
  // Send DELETE request via fetch
};
```

### 4. File-Based Persistence
```javascript
// server.js
const writeBooksToFile = (books) => {
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), 'utf-8');
};
```

---

## 👨‍💻 Author

- **Student:** Full Stack Web Development Lab Student
- **Course:** Full Stack Web Development (CS / SE)
- **Task:** Lab Quiz – Question 1 (Library Book Tracker)
