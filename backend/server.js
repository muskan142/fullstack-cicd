
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB error:", err.message));

// Student Schema
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  rollNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  course: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Student Model
const Student = mongoose.model("Student", studentSchema);

// Backend Home Route
app.get("/api", (req, res) => {
  res.json({
    message: "Backend Running Successfully in CICD",
  });
});

// Health Check Route
app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.json({
    status: "ok",
    database: connected ? "Connected" : "Disconnected",
  });
});

// Get All Students
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({
      createdAt: -1,
    });

    res.json(students);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// Add a New Student
app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);

    res.json({
      saved: true,
      data: student,
    });
  } catch (err) {
    const msg =
      err.code === 11000
        ? "Roll number already exists"
        : err.message;

    res.status(400).json({
      saved: false,
      error: msg,
    });
  }
});

// Update Student Details
app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      saved: true,
      data: student,
    });
  } catch (err) {
    const msg =
      err.code === 11000
        ? "Roll number already exists"
        : err.message;

    res.status(400).json({
      saved: false,
      error: msg,
    });
  }
});

// Delete a Student
app.delete("/api/students/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);

    res.json({
      deleted: true,
    });
  } catch (err) {
    res.status(500).json({
      deleted: false,
      error: err.message,
    });
  }
});

// Start Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
