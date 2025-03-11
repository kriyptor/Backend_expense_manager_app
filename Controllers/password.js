const Sequelize  = require("sequelize");
const bcrypt = require(`bcrypt`);
const PasswordResetReq = require(`../Models/passwordReset`);
const Users = require(`../Models/users`);
const db = require('../utils/database');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require("nodemailer");
require('dotenv').config();


exports.forgotPassword = async (req, res) =>{
    try {
        const { emailId } = req.body;
        
        const reqId = uuidv4();

        const userId = await Users.findOne({ attributes: [`id`], where : { email : emailId } });

        if (!userId) {
            return res.status(404).json({
              success: false,
              message: "User not found",
            });
          }

        const generatedReq = await PasswordResetReq.create({ id : reqId, userId : userId.id });

        const resetLink = `http://${process.env.PUBLIC_IP}/password/reset-password-link?token=${reqId}`;

        const transporter = nodemailer.createTransport({
            service: process.env.NODE_MAILER_SERVICE,
            auth: {
                user: process.env.NODE_MAILER_USER, // Your Gmail email address
                pass: process.env.NODE_MAILER_PASSWORD, // App Password (NOT your actual Gmail password)
            },
        });

        const mailOptions = {
            from: process.env.NODE_MAILER_USER, // Sender address
            to: emailId, // Recipient address
            subject: "Password Reset Request", // Subject line
            html: `
                <p>You have requested a password reset.</p>
                <p>Please click the following link to reset your password:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>If you did not request a password reset, please ignore this email.</p>
            `
        };

          const info = await transporter.sendMail(mailOptions);
          console.log('Email sent:', info.messageId);

        res.status(201).json({
            success: true,
            link : resetLink,
            data: generatedReq
        })

    } catch (error) {
        console.log(error);

        res.status(500).json({ 
            success: false,
            error : error.message
        });
    }
}


exports.resetPasswordGet = async (req, res) =>{

    const { token } = req.query; // Extract the token from the query string

    if (!token) {
      return res.status(400).send("Invalid reset link.");
    }

    res.render("reset-password", { token }); // Pass the token to the template
}

exports.resetPasswordPost = async (req, res) =>{
    
    const transaction = await db.transaction(); 

    try {
       
        const { reqId, password } = req.body;

        console.log(reqId, password)
        
        const { isActive, userId } = await PasswordResetReq.findOne({
          attributes: [`userId`, `isActive`],
          where: { id: reqId },
          raw: true,
        });


        console.log(isActive, userId)

        if(isActive === 0){
            
            res.status(400).json({ 
                success: false,
                message : "Not Valid Link"
            });

            return;
        }

        const salt = 10;
        const hashedPassword = await bcrypt.hash(password, salt);

        await Users.update({ password : hashedPassword }, { where : { id : userId } }, transaction);

        await PasswordResetReq.update({ isActive : false }, { where : { id : reqId } }, transaction);

        await transaction.commit(); // Commit the transaction

        res.status(200).json({
            success: true,
            message : "Password updated"
        })

    } catch (error) {

        await transaction.rollback(); // rollback the transaction

        console.log(error);

        res.status(500).json({ 
            success: false,
            message : "Password reset link is expired!",
            error : error.message
        });
    }
}