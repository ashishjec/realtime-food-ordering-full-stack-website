// In your login route handler (e.g., in routes/auth.js)

const express = require('express');
const router = express.Router();
const passport = require('passport');

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
}), (req, res) => {
    res.redirect('/'); // Redirect to the home page after successful login
});

module.exports = router;
