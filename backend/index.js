const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Backend working with MongoDB");
});

const Roles = {
  STUDENT: "Student",
  INSTRUCTOR: "Instructor",
  ADMIN: "Admin"
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: Object.values(Roles), 
    default: Roles.STUDENT 
  },
});

const User = mongoose.model("User", userSchema, "user");

// Middleware to authorize roles
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (!userRole) return res.status(401).send("Authentication required");
    
    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      res.status(403).send("Access Denied: You do not have the required permissions");
    }
  };
};

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password and role are required" });
    }

    if (!Object.values(Roles).includes(role)) {
      return res.status(400).json({ message: "Role must be Student, Instructor, or Admin" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      id: user._id,
      name: user.name,
      role: user.role,
      email: user.email
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: "Not registered or invalid credentials" });
    }
    res.json({ 
      id: user._id,
      name: user.name, 
      role: user.role, 
      email: user.email 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




app.get("/student-dashboard", authorize([Roles.STUDENT, Roles.ADMIN]), (req, res) => {
  res.send("Welcome to the Student Portal: Access your courses and grades here.");
});


app.get("/instructor-dashboard", authorize([Roles.INSTRUCTOR, Roles.ADMIN]), (req, res) => {
  res.send("Welcome to the Instructor Portal: Manage your content and students here.");
});


app.get("/admin-dashboard", authorize([Roles.ADMIN]), (req, res) => {
  res.send("Welcome to the Admin Dashboard: System-wide settings and user management.");
});

app.put("/users/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(user);
});

app.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.send("User deleted");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});