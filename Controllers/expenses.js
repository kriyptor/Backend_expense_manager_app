const Expenses = require(`../Models/expenses`);
const Users = require(`../Models/users`);
const db = require('../utils/database');


exports.getAllExpense = async (req, res) => {
    try {
        const { userId } = req.body;

        const allUserExpense = await Expenses.findAll({ where : { userId : userId } });

        res.status(200).json({ 
            success: true,
            data : allUserExpense,
        })

    } catch (error) {
        console.log(error);

        res.status(500).json({ 
            success: false,
            error : error.message
        });
    }
}

 
exports.createExpense = async (req, res) => {
    const transaction = await db.transaction(); 

    try {
        const { userId, amount, category, description } = req.body;

        const expenseId = Date.now();

        /* const newExpense = await Expenses.create({
          id: expenseId,
          amount : amount,
          category: category,
          description: description,
          userId: userId,
        });

        const prevTotalExpense = await Users.findOne({ attributes : [`totalExpense`], where : { id : userId } });
        
        const updatedTotalExpense = prevTotalExpense.totalExpense + amount;
        console.log(updatedTotalExpense, prevTotalExpense.totalExpense)

        await Users.update({ totalExpense : updatedTotalExpense }, { where : { id : userId } }); */


        const newExpense = await Expenses.create({
            id: expenseId,
            amount : amount,
            category: category,
            description: description,
            userId: userId,
          },
          { transaction });
  
          const prevTotalExpense = await Users.findOne({
            attributes: [`totalExpense`],
            where: { id: userId },
            lock : transaction.LOCK.UPDATE, //study
            transaction 
          });
          
          const updatedTotalExpense = prevTotalExpense.totalExpense + amount;
          
          console.log(updatedTotalExpense, prevTotalExpense.totalExpense)
  
          await Users.update({ totalExpense : updatedTotalExpense }, { where : { id : userId }, transaction });

          await transaction.commit(); // Commit the transaction

        res.status(201).json({ 
            success: true,
            data : newExpense,
        })


    } catch (error) {

        await transaction.rollback();

        console.log(error);

        res.status(500).json({ 
            success: false,
            error : error.message
        });
    }
}

exports.deleteExpense = async (req, res) => {
    const transaction = await db.transaction(); 
    try {
        const { userId, expenseId } = req.body;
        
        const getExpenseAmt = await Expenses.findOne({
          attributes: [`amount`],  
          where: { id: expenseId },
          transaction,
        });

        console.log(getExpenseAmt.amount)
        
        const deletedExpense = await Expenses.destroy({ where : { id : expenseId }, transaction });

        const prevTotalExpense = await Users.findOne({
            attributes: [`totalExpense`],
            where: { id: userId },
            lock : transaction.LOCK.UPDATE, //study
            transaction 
          });
          
          const updatedTotalExpense = prevTotalExpense.totalExpense - getExpenseAmt.amount;
          
          console.log(updatedTotalExpense, prevTotalExpense.totalExpense)
  
          await Users.update({ totalExpense : updatedTotalExpense }, { where : { id : userId }, transaction });

        await transaction.commit(); // Commit the transaction

        res.status(200).json({ 
            success: true,
            data : deletedExpense,
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