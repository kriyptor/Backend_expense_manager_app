const Sequelize  = require("sequelize");
const bcrypt = require(`bcrypt`);
const PasswordResetReq = require(`../Models/passwordReset`);
const Users = require(`../Models/users`);
const db = require('../utils/database');
const { v4: uuidv4 } = require('uuid');


//
exports.forgotPassword = async (req, res) =>{
    try {
        const { emailId } = req.body;
        
        const reqId = uuidv4();

        const userId = await Users.findOne({ attributes: [`id`], where : { email : emailId } });

        const generatedReq = await PasswordResetReq.create({ id : reqId, userId : userId.id });

        const resetLink = `http://localhost:4000/password/reset-password/${reqId}`;

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


exports.resetPassword = async (req, res) =>{
    const transaction = await db.transaction(); 

    try {
        const reqId = req.params.id;

        const { password } = req.body;
        
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
            error : error.message
        });
    }
}