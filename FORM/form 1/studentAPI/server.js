const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/students")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const StudentSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const Student = mongoose.model("Student", StudentSchema);

app.get("/", (req, res) => {
  res.send("Backend is Working");
});

app.post("/api/students", async (req, res) => {
  try {
    console.log(req.body);

    const student = new Student(req.body);
    await student.save();

    res.status(201).json({
      message: "Student Saved Successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

app.listen(5001, () => {
  console.log("Server running on port 5001");
});