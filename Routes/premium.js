const express = require(`express`);
const premiumController = require(`../Controllers/premium`);

const router = express.Router();


router.get('/leaderboard', premiumController.getLeaderboardData);


module.exports = router;