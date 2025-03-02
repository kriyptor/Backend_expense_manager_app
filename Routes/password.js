const express = require(`express`);
const passwordController = require(`../Controllers/password`);
const router = express.Router();


router.post('/forgot-password', passwordController.forgotPassword);

router.post('/reset-password/:id', passwordController.resetPassword);


module.exports = router;