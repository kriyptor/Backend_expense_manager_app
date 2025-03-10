const db = require('../utils/database');
const { Cashfree } = require("cashfree-pg");
const Users = require(`../Models/users`);
const Payments = require(`../Models/payments`);
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();

Cashfree.XClientId = process.env.CLIENT_ID;
Cashfree.XClientSecret = process.env.CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;


exports.createOrder = async (req, res) => {
    try {
        const { userId }  = req.body;

        console.log(userId)

        // Validate userId
        if (!userId) {
            return res.status(400).json({ success: false, error: "Missing userId" });
        }

        // Check if user exists
        const user = await Users.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        const expiryDate = new Date(Date.now() + 60 * 60 * 1000); //1hr from now
        const formattedExpiryDate = expiryDate.toISOString();

        const paymentUserId = `user_${uuidv4()}`; // Generate a unique customer ID

        const request = {
            "order_amount": 27.00,
            "order_currency": "INR",
            "order_id": uuidv4(),
            "customer_details": {
                "customer_id": paymentUserId,
                "customer_phone": "8474090589"
            },
            "order_meta": {
                "return_url": "http://localhost:5173/",
                "payment_methods": "cc,dc,upi"
            },
            "order_expiry_time": formattedExpiryDate
        };

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);

        const orderId = response.data.order_id;

        // Create payment entry
        await Payments.create({ id: orderId, userId: userId });

        res.status(200).json({
            success: true,
            message: "Payment Initiated",
            result: response.data
        });

    } catch (error) {
        console.error("Error Creating order", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


exports.verifyPayment = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { orderId, userId } = req.body;

        // Input validation
        if (!orderId || !userId) {
            return res.status(400).json({ success: false, error: "Missing credentials" });
        }

        const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);

        const getOrderResponse = response.data;

        let orderStatus = "Failure"; // Default to failure
        if (
            getOrderResponse.filter(
                (transaction) => transaction.payment_status === "SUCCESS"
            ).length > 0
        ) {
            orderStatus = "Success";
        } else if (
            getOrderResponse.filter(
                (transaction) => transaction.payment_status === "PENDING"
            ).length > 0
        ) {
            orderStatus = "Pending";
        }

        if (orderStatus === "Success") {
            // Update payment status
            const [updatePayment] = await Payments.update(
                { paymentStatus: true },
                { where: { id: orderId, userId: userId } },
                { transaction }
            );

            if (updatePayment === 0) {
                await transaction.rollback();
                return res.status(400).json({ success: false, error: "Failed to update payment" });
            }

            // Update user to premium
            const [updatedUser] = await Users.update(
                { premiumUser: true },
                { where: { id: userId } },
                { transaction }
            );

            if (updatedUser === 0) {
                await transaction.rollback();
                return res.status(400).json({ success: false, error: "Failed to update user" });
            }
        }

        await transaction.commit(); // Commit the transaction

        res.status(200).json({ success: true, message: `Payment ${orderStatus}` });

    } catch (error) {
        await transaction.rollback(); // rollback the transaction
        console.error("Payment verification error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};