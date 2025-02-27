const express = require(`express`);
const db = require(`./utils/database`);
const bodyParser = require(`body-parser`);
const userRouter = require(`./Routes/user`);
const cors = require(`cors`);
//require model
//require routes

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/user', userRouter);
//sync the database

db.sync(/* { force : true } */)
.then(() => {
    console.log(`Connected with DB!`);
    app.listen(4000, () => console.log(`Server is running @ PORT:4000`))
}).catch((err) => {
    console.log(err)
})