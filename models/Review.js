// Review model - stores user comments for rooms.
// Each review references the user that wrote it and the comment text.

const { Schema, model } = require('mongoose');

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the user that created the review
      required: true
    },
    comment: {
      type: String,
      maxlength: 200 // Limit the comment length to keep data tidy
    }
  },
  {
    timestamps: true
  }
);

module.exports = model('Review', reviewSchema);
