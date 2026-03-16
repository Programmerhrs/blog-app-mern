const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/authMiddleware");

// CREATE POST (PROTECTED)
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { title, content, image, video } = req.body;

    const newPost = new Post({
      title,
      content,
      image,
      video,
      author: req.user.userId
    });

    const savedPost = await newPost.save();

    res.status(201).json({
      message: "Post created successfully",
      post: savedPost
    });

  } catch (error) {
    res.status(500).json({
      message: "Error creating post",
      error: error.message
    });
  }
});

// GET ALL POSTS
router.get("/all", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching posts",
      error: error.message
    });
  }
});

// SEARCH POSTS
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } }
      ]
    })
    .populate("author", "name email")
    .sort({ createdAt: -1 });

    res.json(posts);

  } catch (error) {
    res.status(500).json({
      message: "Error searching posts",
      error: error.message
    });
  }
});

// GET MY POSTS (PROTECTED)
router.get("/myposts", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.userId })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching your posts",
      error: error.message
    });
  }
});

// LIKE / UNLIKE POST (PROTECTED)
router.put("/like/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(req.user.userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== req.user.userId
      );
    } else {
      post.likes.push(req.user.userId);

      if (post.author.toString() !== req.user.userId) {
        await Notification.create({
          recipient: post.author,
          sender: req.user.userId,
          type: "like",
          post: post._id,
          message: "liked your post"
        });
      }
    }

    await post.save();

    res.json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likes: post.likes.length,
      liked: !alreadyLiked
    });

  } catch (error) {
    res.status(500).json({
      message: "Error liking post",
      error: error.message
    });
  }
});

// ADD COMMENT (PROTECTED)
router.post("/comment/:id", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      user: req.user.userId,
      name: req.body.name,
      text
    };

    post.comments.push(comment);
    await post.save();

    if (post.author.toString() !== req.user.userId) {
      await Notification.create({
        recipient: post.author,
        sender: req.user.userId,
        type: "comment",
        post: post._id,
        message: "commented on your post"
      });
    }

    res.status(201).json({
      message: "Comment added",
      comments: post.comments
    });

  } catch (error) {
    res.status(500).json({
      message: "Error adding comment",
      error: error.message
    });
  }
});

// EDIT POST (PROTECTED)
router.put("/edit/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    const { title, content, image, video } = req.body;

    post.title = title || post.title;
    post.content = content || post.content;
    post.image = image !== undefined ? image : post.image;
    post.video = video !== undefined ? video : post.video;

    const updatedPost = await post.save();

    res.json({
      message: "Post updated successfully",
      post: updatedPost
    });

  } catch (error) {
    res.status(500).json({
      message: "Error updating post",
      error: error.message
    });
  }
});

// DELETE POST (PROTECTED)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "Post deleted successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting post",
      error: error.message
    });
  }
});

// GET SINGLE POST
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching post",
      error: error.message
    });
  }
});

module.exports = router;