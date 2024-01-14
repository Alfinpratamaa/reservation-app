import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";
import cors from "cors";
import { User } from "./model/User.js";
import bodyParser from "body-parser";
dotenv.config();

const app = express();
const port = 2509;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
// connect to db

connectDB(
  "mongodb+srv://alfin:1234@cluster0.nijnvg6.mongodb.net/?retryWrites=true&w=majority"
)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    console.log("done");
  });

app.get("/", (req, res) => {
  res.json({ msg: "Hello World" });
});

app.post("/api/users", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  // Check for existing user
  const user = await User.findOne({ email }).then((user) => {
    if (user) return res.status(400).json({ msg: "User already exists" });
  });

  const newUser = new User({
    name,
    email,
    password,
  });

  newUser.save().then((user) => {
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
