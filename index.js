import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import cors from "cors";
import { User } from "./model/User.js";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
// connect to db
const PORT = process.env.PORT;
const DB = process.env.MONGO_URI;
connectDB(DB)
  .then(() => {
    console.log("Connected to the database");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

app.post("/api/users/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check for existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If no existing user, proceed to save the new user with hashed password
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("User creation error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// get all data from db
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// delete user
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Check for existing user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("User deletion error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Handling unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
