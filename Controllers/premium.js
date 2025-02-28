const Sequelize  = require("sequelize");
const Expenses = require(`../Models/expenses`);
const Users = require(`../Models/users`)

exports.getLeaderboardData = async (req, res) => {
    try {

        /*
          SQl Query: SELECT userId, Sum(amount) from expenses GROUP BY userId
         */
        const leaders = await Expenses.findAll({
            attributes : [`userId`, [Sequelize.fn(`SUM`, Sequelize.col(`Expenses.amount`)), `totalExpenses`]],

            include : [{
                model : Users,
                attributes : [`name`]
            }],

            group : [`Expenses.userId`]
        });

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