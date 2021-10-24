const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const User = require("./user");
const UserPlans = require("./userPlans");
const Domain = require("./domain");
const Inquiry = require("./inquiry");

const db = {};
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = User;
db.UserPlans = UserPlans;
db.Domain = Domain;
db.Inquiry = Inquiry;

User.init(sequelize);
UserPlans.init(sequelize);
Domain.init(sequelize);
Inquiry.init(sequelize);

User.associate(db);
UserPlans.associate(db);
Domain.associate(db);
Inquiry.associate(db);

module.exports = db;
