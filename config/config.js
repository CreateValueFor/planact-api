require("dotenv").config();

module.exports = {
  development: {
    username: "root",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "planact",
    // host: "planact.cltshxneoosu.us-east-2.rds.amazonaws.com",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  test: {
    username: "root",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "planact",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: "root",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "planact",
    host: "127.0.0.1",
    dialect: "mysql",
  },
};
