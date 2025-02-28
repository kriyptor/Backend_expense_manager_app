const express = require(`express`);
const premiumController = require(`../Controllers/premium`);

const router = express.Router();

/* 

router.post('/sign-up', userController.createUser); */

router.get('/leaderboard', premiumController.getLeaderboardData);


module.exports = router;