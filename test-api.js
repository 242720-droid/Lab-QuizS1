// =============================================================================
// Automated Test Suite for Library Book Tracker API
// Tests GET, POST, DELETE, Validation, and Storage Persistence
// =============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');

// Import the app from server.js
// If server.js listens directly, we can run against it or spawn it
const { spawn } = require('child_process');

const PORT = 3001; // use separate port for test runner
const BASE_URL = `http://localhost:${PORT}`;

const runTests = async () => {
  console.log('🧪 Starting Automated API Tests...\n');

  // Start the server on port 3001
  const serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    env: { ...process.env, PORT: PORT }
  });

  serverProcess.stdout.on('data', (d) => {
    // console.log(`[Server]: ${d}`);
  });
  serverProcess.stderr.on('data', (d) => {
    console.error(`[Server Error]: ${d}`);
  });

  // Wait 1.5 seconds for server to boot
  await new Promise((resolve) => setTimeout(resolve, 1500));

  let passedTests = 0;
  let totalTests = 0;

  const assert = (condition, message) => {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  };

  try {
    // Test 1: GET /books (Initial load)
    console.log('--- Test Suite 1: GET /books ---');
    const getRes = await fetch(`${BASE_URL}/books`);
    const initialBooks = await getRes.json();
    assert(getRes.status === 200, 'GET /books returns HTTP status 200');
    assert(Array.isArray(initialBooks), 'GET /books returns an array of books');
    assert(initialBooks.length >= 1, `Found ${initialBooks.length} existing books in storage`);

    // Test 2: POST /books - Validation (Missing fields)
    console.log('\n--- Test Suite 2: POST /books Validation (Empty Fields) ---');
    const invalidPostRes = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '', author: '', category: '', year: '' })
    });
    const invalidJson = await invalidPostRes.json();
    assert(invalidPostRes.status === 400, 'POST /books with empty fields returns HTTP 400 Bad Request');
    assert(Boolean(invalidJson.error), `Error message returned: "${invalidJson.error}"`);

    // Test 3: POST /books - Valid Book Creation
    console.log('\n--- Test Suite 3: POST /books (Create Book) ---');
    const testBookPayload = {
      title: 'Automated Test Book',
      author: 'Test Suite Author',
      category: 'Technology',
      year: 2024
    };
    const validPostRes = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testBookPayload)
    });
    const createdData = await validPostRes.json();
    assert(validPostRes.status === 201, 'POST /books with valid data returns HTTP 201 Created');
    assert(createdData.book && createdData.book.id, `Created book assigned unique ID: ${createdData.book?.id}`);
    assert(createdData.book.title === testBookPayload.title, 'Created book title matches payload');

    const createdId = createdData.book.id;

    // Test 4: Verification of Data Persistence in books.json
    console.log('\n--- Test Suite 4: Storage Persistence Verification ---');
    const booksFileContent = JSON.parse(fs.readFileSync(path.join(__dirname, 'books.json'), 'utf-8'));
    const persistedBook = booksFileContent.find((b) => String(b.id) === String(createdId));
    assert(Boolean(persistedBook), `Book with ID ${createdId} was persisted directly to books.json`);

    // Test 5: Category Query Filter GET /books?category=Technology
    console.log('\n--- Test Suite 5: Filter Books ---');
    const filterRes = await fetch(`${BASE_URL}/books?category=Technology`);
    const techBooks = await filterRes.json();
    assert(filterRes.status === 200, 'GET /books?category=Technology returns HTTP 200');
    assert(techBooks.every((b) => b.category.toLowerCase() === 'technology'), 'All returned books match filtered category');

    // Test 6: DELETE /books/:id (Valid ID)
    console.log('\n--- Test Suite 6: DELETE /books/:id ---');
    const deleteRes = await fetch(`${BASE_URL}/books/${createdId}`, {
      method: 'DELETE'
    });
    const deleteJson = await deleteRes.json();
    assert(deleteRes.status === 200, `DELETE /books/${createdId} returns HTTP 200 OK`);
    assert(deleteJson.message.includes('successfully'), 'Delete response contains success message');

    // Test 7: Verify Deletion in books.json
    const updatedBooksFile = JSON.parse(fs.readFileSync(path.join(__dirname, 'books.json'), 'utf-8'));
    const deletedCheck = updatedBooksFile.find((b) => String(b.id) === String(createdId));
    assert(!deletedCheck, `Verified book ID ${createdId} was removed from books.json`);

    // Test 8: DELETE /books/:id with Non-Existent ID
    console.log('\n--- Test Suite 7: DELETE with Non-Existent ID ---');
    const invalidDeleteRes = await fetch(`${BASE_URL}/books/non-existent-id-99999`, {
      method: 'DELETE'
    });
    assert(invalidDeleteRes.status === 404, 'DELETE with non-existent ID returns HTTP 404 Not Found');

    console.log(`\n====================================================`);
    console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} Tests Passed successfully!`);
    console.log(`====================================================\n`);
  } catch (err) {
    console.error('Test execution failed with error:', err);
  } finally {
    // Terminate the background server process
    serverProcess.kill('SIGTERM');
  }
};

runTests();
