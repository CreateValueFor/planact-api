require("dotenv").config();

module.exports = {
  development: {
    username: "planact",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "planact",
    host: "planact.cltshxneoosu.us-east-2.rds.amazonaws.com",
    dialect: "mysql",
  },
  test: {
    username: "planact",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "planact",
    host: "planact.cltshxneoosu.us-east-2.rds.amazonaws.com",
    dialect: "mysql",
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql",
  },
};
