const Expenses = require(`../Models/expenses`);
const Users = require(`../Models/users`);
const db = require('../utils/database');
const { v4: uuidv4 } = require('uuid');

exports.getAllExpense = async (req, res) => {
    try {
        const { userId } = req.body;
        
        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 5);
        
        //calculating offset to skip expenses
        const offset = (page - 1) * limit;

        //const allUserExpense = await Expenses.findAll({ where : { userId : userId } });

        const { count, rows: allUserExpense } = await Expenses.findAndCountAll({
          where: { userId: userId },
          limit: limit,
          offset: offset,
          order: [[`createdAt`, `DESC`]],
        });

        //calculating pagination metadata
        const totalPages = Math.ceil(count / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;


        res.status(200).json({ 
            success: true,
            data : allUserExpense,
            pagination : {
                totalItems : count,
                totalPages : totalPages,
                currentPage : page,
                itemsPerPage : limit,
                hasNextPage : hasNextPage,
                hasPrevPage : hasPrevPage
            }
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
        const { userId, amount, category, description, /* date */} = req.body;

        const expenseId = uuidv4();

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
  
          /* const prevTotalExpense = await Users.findOne({
            attributes: [`totalExpense`],
            where: { id: userId },
            lock : transaction.LOCK.UPDATE, //study
            transaction 
          });
          
          const updatedTotalExpense = prevTotalExpense.totalExpense + amount;
          
          console.log(updatedTotalExpense, prevTotalExpense.totalExpense)
  
          await Users.update({ totalExpense : updatedTotalExpense }, { where : { id : userId }, transaction }); */

          await Users.increment("totalExpense", {
            by: amount,
            where: { id: userId },
            transaction
          });

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

        /* const prevTotalExpense = await Users.findOne({
            attributes: [`totalExpense`],
            where: { id: userId },
            lock : transaction.LOCK.UPDATE, //study
            transaction 
          });
          
          const updatedTotalExpense = prevTotalExpense.totalExpense - getExpenseAmt.amount;
          
          console.log(updatedTotalExpense, prevTotalExpense.totalExpense)
  
          await Users.update({ totalExpense : updatedTotalExpense }, { where : { id : userId }, transaction }); */

          await Users.increment("totalExpense", {
            by: (Number(getExpenseAmt.amount) * -1),
            where: { id: userId },
            transaction
          });

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