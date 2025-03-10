const express = require(`express`);
const userController = require(`../Controllers/user`);
const router = express.Router();


router.post('/sign-in', userController.loginUser);

router.post('/sign-up', userController.createUser);

router.get('/premium-user/:userId', userController.checkPremiumUser);

module.exports = router;