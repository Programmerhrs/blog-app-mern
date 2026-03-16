const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");

// SEND MESSAGE (PROTECTED)
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ message: "Receiver and text are required" });
    }

    if (receiverId === req.user.userId) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    const message = new Message({
      sender: req.user.userId,
      receiver: receiverId,
      text
    });

    await message.save();

    res.status(201).json({
      message: "Message sent successfully",
      data: message
    });

  } catch (error) {
    res.status(500).json({
      message: "Error sending message",
      error: error.message
    });
  }
});

// GET CONVERSATION BETWEEN TWO USERS (PROTECTED)
router.get("/conversation/:userId", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate("sender", "name")
    .populate("receiver", "name");

    // Mark messages as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.userId, read: false },
      { read: true }
    );

    res.json(messages);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching conversation",
      error: error.message
    });
  }
});

// GET ALL CONVERSATIONS (INBOX) (PROTECTED)
router.get("/inbox", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId },
        { receiver: req.user.userId }
      ]
    })
    .sort({ createdAt: -1 })
    .populate("sender", "name")
    .populate("receiver", "name");

    const conversations = {};
    messages.forEach((msg) => {
      const otherUser =
        msg.sender._id.toString() === req.user.userId
          ? msg.receiver
          : msg.sender;

      if (!conversations[otherUser._id]) {
        conversations[otherUser._id] = {
          user: otherUser,
          lastMessage: msg.text,
          lastTime: msg.createdAt,
          unread: 0
        };
      }

      if (
        msg.receiver._id.toString() === req.user.userId &&
        !msg.read
      ) {
        conversations[otherUser._id].unread++;
      }
    });

    res.json(Object.values(conversations));

  } catch (error) {
    res.status(500).json({
      message: "Error fetching inbox",
      error: error.message
    });
  }
});

// GET UNREAD COUNT (PROTECTED)
router.get("/unread", verifyToken, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.userId,
      read: false
    });

    res.json({ unread: count });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching unread count",
      error: error.message
    });
  }
});

// DELETE MESSAGE (PROTECTED)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete
    if (message.sender.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({ message: "Message deleted successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting message",
      error: error.message
    });
  }
});

module.exports = router;