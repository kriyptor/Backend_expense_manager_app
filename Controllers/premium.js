const Sequelize  = require("sequelize");
const Expenses = require(`../Models/expenses`);
const Users = require(`../Models/users`)

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