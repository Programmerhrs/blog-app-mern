const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
}, { timestamps: true });

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    content: {
      type: String,
      required: true,
      trim: true
    },

    image: {
      type: String,
      default: ""
    },

    video: {
      type: String,
      default: ""
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    comments: [commentSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Post", postSchema);