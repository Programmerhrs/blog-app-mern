require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const followRoutes = require("./routes/followRoutes");

const app = express();

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(cors());
app.use(express.json());

// Serve uploads folder as static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", followRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});