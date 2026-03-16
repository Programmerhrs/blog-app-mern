const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");

// FOLLOW / UNFOLLOW USER (PROTECTED)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.userId);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFollowing = currentUser.following.includes(req.params.id);

    if (alreadyFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        (id) => id.toString() !== req.user.userId
      );
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user.userId);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      message: alreadyFollowing ? "Unfollowed successfully" : "Followed successfully",
      following: !alreadyFollowing,
      followersCount: userToFollow.followers.length
    });

  } catch (error) {
    res.status(500).json({
      message: "Error following user",
      error: error.message
    });
  }
});

// GET USER PROFILE (PUBLIC)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching user",
      error: error.message
    });
  }
});

module.exports = router;