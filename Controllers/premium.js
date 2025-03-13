const Sequelize  = require("sequelize");
const Expenses = require(`../Models/expenses`);
const Users = require(`../Models/users`)
const db = require('../utils/database');

exports.getLeaderboardData = async (req, res) => {
    try {

        /* const leaders = await Expenses.findAll({
            //SELECT Expenses.userId, Users.name, SUM(Expenses.amount) as totalExpenses FROM Expenses
            attributes : [`userId`, [Sequelize.fn(`SUM`, Sequelize.col(`Expenses.amount`)), `totalExpenses`]],

            //LEFT OUTER JOIN Users ON Expenses.userId = Users.id
            include : [{
                model : Users,
                attributes : [`name`]
            }],

            //GROUP BY Expenses.userId
            group : [`Expenses.userId`],

            //ORDER BY totalExpenses DESC
            order: [[`totalExpenses`, `DESC`]]
        }); */

        /* const leaders = await Users.findAll({
            //SELECT Users.id, Users.name, SUM(Expenses.amount) as totalExpenses FROM Users
            attributes : [`id`, `name`, [Sequelize.fn(`SUM`, Sequelize.col(`Expenses.amount`)), `totalExpenses`]],

            //LEFT OUTER JOIN Expenses ON Expenses.userId = Users.id
            include : [{
                model : Expenses,
                attributes : []
            }],

            //GROUP BY Users.id`
            group : [`Users.id`],

            //ORDER BY totalExpenses DESC
            order: [[`totalExpenses`, `DESC`]]
        }); */

        const leaders = await Users.findAll({
            attributes : [`id`, `name`, `totalExpense`],
            order: [[`totalExpense`, `DESC`]]
        })


        res.status(200).json({
            success: true,
            data : leaders
        })
        
    } catch (error) {
        console.log(error);

        res.status(500).json({ 
            success: false,
            error : error.message
        });
    }
}

exports.makeUserPremium = async (req, res) => {
    const transaction = await db.transaction();

    try {
        const userId  = req.user.id; //changed

        // Validate userId
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Check if user exists
        const user = await Users.findOne({
            where: { id: userId },
            transaction
        });

        if (!user) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if user is already premium
        if (user.premiumUser) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "User is already premium"
            });
        }

        // Update user to premium
        const [updatedRows] = await Users.update(
            { premiumUser: true },
            { 
                where: { id: userId },
                transaction
            }
        );

        if (updatedRows === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Failed to update user to premium"
            });
        }

        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: "User is Premium Now!"
        });

    } catch (error) {
        await transaction.rollback();
        console.log('Premium update error:', error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}