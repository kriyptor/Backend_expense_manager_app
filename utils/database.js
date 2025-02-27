const Sequelize = require(`sequelize`);

const db = new Sequelize(`expense-manager-app`, `root`, `root`,{
    dialect : `mysql`,
    host : `localhost`
});

module.exports = db;