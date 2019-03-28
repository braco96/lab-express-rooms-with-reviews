// Routes for adding reviews to rooms.
// Users can create reviews for rooms they do not own.

const express = require('express');
const Review = require('../models/Review');
const Room = require('../models/Room');

const router = express.Router();

// Middleware to ensure the user is logged in
function isLoggedIn(req, res, next) {
  if (req.session.currentUser) return next();
  res.redirect('/login');
}

// POST /reviews/create/:roomId - create a review for the given room
router.post('/create/:roomId', isLoggedIn, async (req, res, next) => {
  try {
    const { comment } = req.body;
    const room = await Room.findById(req.params.roomId);

    // Users should not be able to review their own rooms
    if (room.owner.equals(req.session.currentUser._id)) {
      return res.redirect('/rooms');
    }

    // Create the review and push it to the room's reviews array
    const review = await Review.create({ comment, user: req.session.currentUser._id });
    room.reviews.push(review._id);
    await room.save();

    res.redirect('/rooms');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
