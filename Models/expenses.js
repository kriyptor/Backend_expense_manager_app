const Sequelize = require(`sequelize`);
const db = require(`../utils/database`);

const Expenses = db.define(`Expenses`, {
    id : {
        type :  Sequelize.DOUBLE,
        allowNull : false,
        primaryKey: true,
    },

    amount : {
        type : Sequelize.DOUBLE,
        allowNull : false,
    },

    category : {
        type : Sequelize.STRING,
        allowNull : false,
    },

    description : {
        type : Sequelize.STRING,
        allowNull : false
    },

    userId : {
        type : Sequelize.DOUBLE,
        allowNull : false
    }
});

module.exports = Expenses;