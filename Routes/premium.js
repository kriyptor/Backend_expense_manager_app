const express = require(`express`);
const premiumController = require(`../Controllers/premium`);

const router = express.Router();


router.get('/leaderboard', premiumController.getLeaderboardData);

router.post('/make-user-premium', premiumController.makeUserPremium);


module.exports = router;