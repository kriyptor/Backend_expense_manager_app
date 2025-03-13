const Sequelize = require(`sequelize`);
const Expenses = require(`../Models/expenses`);
const Users = require(`../Models/users`);
const db = require('../utils/database');
const { getMonthFromNumber } = require(`../utils/helperFunctins`);
const { v4: uuidv4 } = require('uuid');
const { Parser } = require('json2csv');


exports.getAllExpense = async (req, res) => {
    try {
        const userId  = req.user.id; //changed
        
        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 5);
        
        //calculating offset to skip expenses
        const offset = (page - 1) * limit;


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
        const userId  = req.user.id; //changed

        const { amount, category, description, date } = req.body; //changed

        const [year, month, day] = date.split("-"); 

        const monthName = getMonthFromNumber(month);

        const expenseId = uuidv4();

        const newExpense = await Expenses.create({
            id: expenseId,
            amount : amount,
            category: category,
            description: description,
            date : date,
            month : monthName,
            year : parseInt(year),
            userId: userId,
          },
          { transaction });

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
        const userId  = req.user.id; //changed

        const { expenseId } = req.body; //chnaged

        const getExpenseAmt = await Expenses.findOne({
          attributes: [`amount`],  
          where: { id: expenseId },
          transaction,
        });
        
        const deletedExpense = await Expenses.destroy({ where : { id : expenseId }, transaction });


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

 

//all the expense for particular date 
exports.getAllDayExpense = async (req, res) => {
    try {

        const userId  = req.user.id; //changed
        const date = req.query.date;
        
        const allDayExpenses = await Expenses.findAll({ where : { userId : userId, date : date } })

        res.status(200).json({ 
            success: true,
            data : allDayExpenses,
        })

    } catch (error) {
        console.log(error);

        res.status(500).json({ 
            success: false,
            error : error.message
        });
    }
}


//all the expense for particular month
exports.getAllMonthExpense = async (req, res) => {
    try {
        const userId  = req.user.id; //changed
        const month = req.query.month;
        
        const strMonth = getMonthFromNumber(parseInt(month.split("-").at(-1)));

        const allMonthExpenses = await Expenses.findAll({ where : { userId : userId, month : strMonth } })

        res.status(200).json({ 
            success: true,
            data : allMonthExpenses,
        })

    } catch (error) {
        console.log(error);

        res.status(500).json({ 
            success: false,
            error : error.message
        });
    }
}

//all the expense for particular month
exports.getAllYearExpense = async (req, res) => {
    try {
        
        const userId  = req.user.id; //changed
        const year = req.query.year;
        
        const allYearExpenses = await Expenses.findAll({
            
          attributes : [`month`, [Sequelize.fn(`SUM`, Sequelize.col(`amount`)), `amount`]],  

          group : [`month`],

          where: { userId: userId, year: year },
        });

         res.status(200).json({ 
            success: true,
            data : allYearExpenses,
        }) 

    } catch (error) {
        console.log(error);

        res.status(500).json({ 
            success: false,
            error : error.message
        });
    }
}

exports.downloadDayExpenseCSV = async (req, res) => {
    try {
      const userId  = req.user.id; //changed
      const date = req.query.date;
  
      const allDayExpenses = await Expenses.findAll({ where: { userId: userId, date: date } });
  
      if (allDayExpenses.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No expenses found for the given criteria.",
        });
      }
  
      // Convert data to CSV
      const fields = ["date", "amount", "category", "description"]; // Define CSV columns
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(allDayExpenses);
  
      // Set headers to trigger file download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=day-expenses-${date}.csv`);
  
      // Send CSV as response
      res.status(200).send(csv);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

exports.downloadMonthExpenseCSV = async (req, res) => {
    try {
      const userId  = req.user.id; //changed
      const month = req.query.month;
        
      console.log(month)
      const strMonth = getMonthFromNumber(parseInt(month.split("-").at(-1)));
  
      const allMonthExpenses = await Expenses.findAll({ where: { userId: userId, month: strMonth } });
  
      if (allMonthExpenses.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No expenses found for the given criteria.",
        });
      }
  
      // Convert data to CSV
      const fields = ["date", "amount", "category", "description"];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(allMonthExpenses);
  
      // Set headers to trigger file download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=month-expenses-${month}.csv`);
  
      // Send CSV as response
      res.status(200).send(csv);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

exports.downloadYearExpenseCSV = async (req, res) => {
    try {
      const userId  = req.user.id; //changed
      const year = req.query.year;
  
      const allYearExpenses = await Expenses.findAll({
        attributes: [`month`, [Sequelize.fn(`SUM`, Sequelize.col(`amount`)), `amount`]],
        group: [`month`],
        where: { userId: userId, year: year },
      });
  
      if (allYearExpenses.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No expenses found for the given criteria.",
        });
      }
  
      // Convert data to CSV
      const fields = ["month", "amount"]; // Adjust fields based on grouped data
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(allYearExpenses);
  
      // Set headers to trigger file download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=year-expenses-${year}.csv`);
  
      // Send CSV as response
      res.status(200).send(csv);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

    