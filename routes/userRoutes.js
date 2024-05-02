const express = require('express');
const router = express.Router();
const { registerUser, loginUser,logoutUser, loadUser} = require('../controllers/user.js');
const { bookmarkStory, getAllBookmarks } = require('../controllers/bookmark.js');
const {auth} = require('../middlewares/auth.js');

//Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Routes
router.post('/logout',logoutUser)
router.get('/load/:username',auth,loadUser)
router.post('/bookmark/:id', auth , bookmarkStory);
router.get('/bookmarks/:userId', auth , getAllBookmarks);

module.exports = router;

