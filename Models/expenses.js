const Sequelize = require(`sequelize`);
const db = require(`../utils/database`);

const Expenses = db.define(`Expenses`, {
    id : {
        type :  Sequelize.STRING,
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

    date : {
        type : Sequelize.STRING,
        allowNull : false
    },

    month : {
        type : Sequelize.STRING, //TODO: Change to integer
        allowNull : false
    },

    year : {
        type : Sequelize.INTEGER,
        allowNull : false
    },

    userId : {
        type : Sequelize.STRING,
        allowNull : false
    }
});

module.exports = Expenses;