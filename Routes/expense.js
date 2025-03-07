const express = require(`express`);
const expenseController = require(`../Controllers/expenses`);

const router = express.Router();

// Specific routes
router.post('/add-expense', expenseController.createExpense);
router.delete('/delete-expense', expenseController.deleteExpense);
router.get('/download-day-expense', expenseController.downloadDayExpenseCSV);
router.get('/download-month-expense', expenseController.downloadMonthExpenseCSV);
router.get('/download-year-expense', expenseController.downloadYearExpenseCSV);

// More specific GET routes with full path
router.get('/user-expense/day', expenseController.getAllDayExpense);
router.get('/user-expense/month', expenseController.getAllMonthExpense);
router.get('/user-expense/year', expenseController.getAllYearExpense);

// Dynamic route
router.get('/user-expense/:id', expenseController.getAllExpense);

module.exports = router;