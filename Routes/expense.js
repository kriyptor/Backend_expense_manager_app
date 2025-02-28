const express = require(`express`);
const expenseController = require(`../Controllers/expenses`);

const router = express.Router();

router.get('/user-expense', expenseController.getAllExpense);

router.post('/add-expense', expenseController.createExpense);

router.delete('/delete-expense', expenseController.deleteExpense);


module.exports = router;