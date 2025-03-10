const Sequelize = require(`sequelize`);
const db = require(`../utils/database`);

const Payments = db.define(`Payments`, {
    id : {
        type :  Sequelize.STRING,
        allowNull : false,
        primaryKey: true,
    },

    paymentStatus : {
        type : Sequelize.BOOLEAN,
        allowNull : false,
        defaultValue: false,
    },

    userId : {
        type : Sequelize.STRING,
        allowNull : false
    }
});

module.exports = Payments;