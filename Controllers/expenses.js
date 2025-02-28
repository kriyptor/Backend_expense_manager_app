const Expenses = require(`../Models/expenses`);


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
    try {
        const { userId, amount, category, description } = req.body;

        const expenseId = Date.now();

        const newExpense = await Expenses.create({
          id: expenseId,
          amount : amount,
          category: category,
          description: description,
          userId: userId,
        });

        res.status(201).json({ 
            success: true,
            data : newExpense,
        })


    } catch (error) {
        console.log(error);

        res.status(500).json({ 
            success: false,
            error : error.message
        });
    }
}

exports.deleteExpense = async (req, res) => {
    try {
        const { expenseId } = req.body;

        const deletedExpense = await Expenses.destroy({ where : { id : expenseId } });

        res.status(200).json({ 
            success: true,
            data : deletedExpense,
        })


    } catch (error) {
        console.log(error);

        res.status(500).json({ 
            success: false,
            error : error.message
        });
    }
}