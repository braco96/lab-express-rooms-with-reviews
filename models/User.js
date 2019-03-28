// User model - represents the users of the application.
// We store the email, encrypted password, and optional OAuth IDs.

const { Schema, model } = require('mongoose');

// Define the schema structure for the user.
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true // Each email should be unique in the database
    },
    password: {
      type: String,
      required: true // The hashed password is necessary for authentication
    },
    fullName: String, // Display name of the user
    slackID: String,  // Optional field for Slack OAuth login
    googleID: String  // Optional field for Google OAuth login
  },
  {
    timestamps: true // Automatically add createdAt and updatedAt fields
  }
);

module.exports = model('User', userSchema);
