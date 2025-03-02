const Sequelize = require(`sequelize`);
const db = require(`../utils/database`);

const PasswordResetReq = db.define(`Password-Reset`, {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },

    userId: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    }

});

module.exports = PasswordResetReq;
