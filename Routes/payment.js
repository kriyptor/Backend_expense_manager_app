const express = require(`express`);
const paymentController = require(`../Controllers/payment`);

const router = express.Router();


router.post('/session', paymentController.createOrder);

router.post('/verify', paymentController.verifyPayment);


module.exports = router;