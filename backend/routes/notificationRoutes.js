const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/authMiddleware");

// GET ALL NOTIFICATIONS (PROTECTED)
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.userId
    })
    .populate("sender", "name")
    .populate("post", "title")
    .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message
    });
  }
});

// GET UNREAD COUNT (PROTECTED)
router.get("/unread", verifyToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.userId,
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

// MARK ALL AS READ (PROTECTED)
router.put("/markread", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.userId, read: false },
      { read: true }
    );

    res.json({ message: "All notifications marked as read" });

  } catch (error) {
    res.status(500).json({
      message: "Error marking notifications as read",
      error: error.message
    });
  }
});

// DELETE ALL NOTIFICATIONS (PROTECTED)
router.delete("/clear", verifyToken, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.userId });
    res.json({ message: "Notifications cleared" });

  } catch (error) {
    res.status(500).json({
      message: "Error clearing notifications",
      error: error.message
    });
  }
});

module.exports = router;