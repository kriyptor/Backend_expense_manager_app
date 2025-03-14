const Sequelize = require(`sequelize`);
const db = require(`../utils/database`);

const Users = db.define(`Users`, {
    id : {
        type :  Sequelize.STRING,
        allowNull : false,
        primaryKey: true,
    },

    name : {
        type : Sequelize.STRING,
        allowNull : false,
    },

    email : {
        type : Sequelize.STRING,
        allowNull : false
    },

    password : {
        type : Sequelize.STRING,
        allowNull : false
    },

    totalExpense : {
        type : Sequelize.DOUBLE,
        allowNull : false,
        defaultValue: 0
    },

    premiumUser : {
        type : Sequelize.BOOLEAN,
        allowNull : false,
        defaultValue: false
    }

});

module.exports = Users;