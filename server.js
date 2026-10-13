
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());

// ---------- BOOK FILE FUNCTIONS ----------

const booksFile = path.join(__dirname, "books.json");

function readBooks() {
    return JSON.parse(fs.readFileSync(booksFile, "utf8"));
}

function saveBooks(books) {
    fs.writeFileSync(
        booksFile,
        JSON.stringify(books, null, 2),
        "utf8"
    );
}

function validBook(data) {
    return data &&
        typeof data.title === "string" &&
        data.title.trim() !== "" &&
        typeof data.author === "string" &&
        data.author.trim() !== "" &&
        data.price !== "" &&
        data.price !== null &&
        data.price !== undefined &&
        Number.isFinite(Number(data.price)) &&
        Number(data.price) >= 0;
}

// ---------- STUDENT DATA ----------

let students = [
    { id: 1, name: "Ali", department: "BSCS" },
    { id: 2, name: "Sara", department: "BSIT" },
    { id: 3, name: "Ahmed", department: "BSCS" }
];

// GET all students
app.get("/students", (req, res) => {
    res.json(students);
});

// Task 3: Filter by department
app.get("/students/department/:department", (req, res) => {
    const department = req.params.department.toUpperCase();

    const result = students.filter(
        student => student.department === department
    );

    res.json(result);
});

// Task 4: POST student validation
app.post("/students", (req, res) => {
    const { name, department } = req.body;

    if (
        typeof name !== "string" || !name.trim() ||
        typeof department !== "string" || !department.trim()
    ) {
        return res.status(400).json({
            message: "Name and department are required"
        });
    }

    const student = {
        id: students.length
            ? Math.max(...students.map(s => s.id)) + 1
            : 1,
        name: name.trim(),
        department: department.trim().toUpperCase()
    };

    students.push(student);
    res.status(201).json(student);
});

// Task 4: PUT student validation
app.put("/students/:id", (req, res) => {
    const student = students.find(
        s => s.id === Number(req.params.id)
    );

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    const { name, department } = req.body;

    if (
        typeof name !== "string" || !name.trim() ||
        typeof department !== "string" || !department.trim()
    ) {
        return res.status(400).json({
            message: "Name and department are required"
        });
    }

    student.name = name.trim();
    student.department = department.trim().toUpperCase();

    res.json(student);
});

// ---------- BOOK API ----------

// GET all books
app.get("/books", (req, res) => {
    res.json(readBooks());
});

// GET one book
app.get("/books/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid book ID"
        });
    }

    const book = readBooks().find(b => b.id === id);

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.json(book);
});

// POST: Create a book
app.post("/books", (req, res) => {
    if (!validBook(req.body)) {
        return res.status(400).json({
            message: "Valid title, author and price are required"
        });
    }

    const books = readBooks();

    const book = {
        id: books.length
            ? Math.max(...books.map(b => b.id)) + 1
            : 1,
        title: req.body.title.trim(),
        author: req.body.author.trim(),
        price: Number(req.body.price)
    };

    books.push(book);
    saveBooks(books);

    res.status(201).json(book);
});

// PUT: Update a book
app.put("/books/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid book ID"
        });
    }

    const books = readBooks();
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (!validBook(req.body)) {
        return res.status(400).json({
            message: "Valid title, author and price are required"
        });
    }

    books[index] = {
        id: books[index].id,
        title: req.body.title.trim(),
        author: req.body.author.trim(),
        price: Number(req.body.price)
    };

    saveBooks(books);
    res.json(books[index]);
});

// DELETE a book
app.delete("/books/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid book ID"
        });
    }

    const books = readBooks();
    const updatedBooks = books.filter(b => b.id !== id);

    if (updatedBooks.length === books.length) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    saveBooks(updatedBooks);

    res.json({
        message: "Book deleted successfully"
    });
});

// ---------- START SERVER ----------

app.listen(PORT, () => {
    console.log("Server running at http://localhost:" + PORT);
});
