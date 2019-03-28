// Room model - describes a room created by a user.
// Each room has a name, description, image, owner and reviews.

const { Schema, model } = require('mongoose');

const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: true // A room must have a name
    },
    description: String, // Short text describing the room
    imageUrl: String,    // URL to the room image
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',       // Reference to the User that created the room
      required: true
    },
    // We keep an array of review references; actual review docs are stored in Review collection
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }]
  },
  {
    timestamps: true
  }
);

module.exports = model('Room', roomSchema);
