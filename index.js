const express = require(`express`);
const path = require(`path`);
const db = require(`./utils/database`);
const bodyParser = require(`body-parser`);
const userRouter = require(`./Routes/user`);
const premiumRouter = require(`./Routes/premium`);
const expenseRouter = require(`./Routes/expense`);
const passwordRouter = require(`./Routes/password`);
const paymentRouter = require(`./Routes/payment`);
const Users = require(`./Models/users`);
const Expenses = require(`./Models/expenses`);
const Payments = require(`./Models/payments`);
const PasswordReset = require(`./Models/passwordReset`);
const cors = require(`cors`);

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 4000;

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.JWT_SECRET_KEY) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use('/user', userRouter);
app.use('/expense', expenseRouter);
app.use('/premium', premiumRouter);
app.use('/password', passwordRouter);
app.use('/payment', paymentRouter);


//creating associations:
Users.hasMany(Expenses, { foreignKey: `userId`, onDelete : `CASCADE` });
Expenses.belongsTo(Users, { foreignKey: `userId` });

Users.hasMany(PasswordReset, { foreignKey: `userId`, onDelete : `CASCADE` });
PasswordReset.belongsTo(Users, { foreignKey: `userId` });

Users.hasMany(Payments, { foreignKey: `userId`, onDelete : `CASCADE` });
Payments.belongsTo(Users, { foreignKey: `userId` });

//sync the database
db.sync(/* { force : true } */)
.then(() => {
    console.log(`Connected with DB!`);
    app.listen(PORT, () => console.log(`Server is running @ PORT:${PORT}`))
}).catch((err) => {
    console.log(err)
})