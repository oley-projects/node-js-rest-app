const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put('/signup', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid Email.')
    .custom((value, { req }) => {
      return User.findOne({email: value})
        .then(userDoc => {
          if (userDoc) {
            return Promise.reject('Email address already exists!')
          }
        });
    })
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({min: 5, max: 30}),
  body('name')
    .trim()
    .isLength({min: 1, max: 30})
    .notEmpty()
],
authController.signup);

router.post('/login', authController.login);

router.get('/status', isAuth, authController.getStatus);

router.patch('/status', isAuth, [
  body('status')
    .trim()
    .isLength({min: 1, max: 40})
    .notEmpty()
], authController.updateStatus)

module.exports = router;