// routes/userRoutes.js
const express = require('express');
const { createUser, getAllUsers, getUserById, searchUsersByName, updateUser, deleteUser, archiveUser, unarchiveUser } = require('../services/userService');

const router = express.Router();

router.post('/register', createUser); // Register a new user
router.get('/', getAllUsers); // Get all users
router.get('/:userID', getUserById); // Get a user by userID
router.get('/search/:name', searchUsersByName); // Search users by name
router.patch('/:userID', updateUser); // Update user information by userID
router.delete('/:userID', deleteUser); // Delete a user by userID
router.patch('/:userID/archive', archiveUser); // Archive a user
router.patch('/:userID/unarchive', unarchiveUser); // Unarchive a user

module.exports = router;
