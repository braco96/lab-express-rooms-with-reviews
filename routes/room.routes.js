// Routes for creating, reading, updating and deleting rooms.
// Only logged in users can create rooms; only owners can edit/delete their rooms.

const express = require('express');
const Room = require('../models/Room');

const router = express.Router();

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.session.currentUser) return next();
  res.redirect('/login');
}

// GET /rooms - list all rooms
router.get('/', async (req, res, next) => {
  try {
    const rooms = await Room.find()
      .populate('owner')
      .populate({ path: 'reviews', populate: { path: 'user' } });
    res.render('rooms/list', { rooms, user: req.session.currentUser });
  } catch (error) {
    next(error);
  }
});

// GET /rooms/create - form to create a room (only for logged users)
router.get('/create', isLoggedIn, (req, res) => {
  res.render('rooms/create', { user: req.session.currentUser });
});

// POST /rooms/create - create the room
router.post('/create', isLoggedIn, async (req, res, next) => {
  try {
    const { name, description, imageUrl } = req.body;
    await Room.create({ name, description, imageUrl, owner: req.session.currentUser._id });
    res.redirect('/rooms');
  } catch (error) {
    next(error);
  }
});

// GET /rooms/:id/edit - render edit form
router.get('/:id/edit', isLoggedIn, async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room.owner.equals(req.session.currentUser._id)) {
      return res.redirect('/rooms');
    }
    res.render('rooms/edit', { room, user: req.session.currentUser });
  } catch (error) {
    next(error);
  }
});

// POST /rooms/:id/edit - update the room
router.post('/:id/edit', isLoggedIn, async (req, res, next) => {
  try {
    const { name, description, imageUrl } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room.owner.equals(req.session.currentUser._id)) {
      return res.redirect('/rooms');
    }
    await Room.findByIdAndUpdate(req.params.id, { name, description, imageUrl });
    res.redirect('/rooms');
  } catch (error) {
    next(error);
  }
});

// POST /rooms/:id/delete - delete room if owner
router.post('/:id/delete', isLoggedIn, async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room.owner.equals(req.session.currentUser._id)) {
      return res.redirect('/rooms');
    }
    await Room.findByIdAndDelete(req.params.id);
    res.redirect('/rooms');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
