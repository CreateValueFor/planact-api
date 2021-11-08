const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const User = require("./user");
const UserPlans = require("./userPlans");
const Inquiry = require("./inquiry");
const PlanSummary = require("./plan");
const Logs = require("./logs");

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
db.PlanSummary = PlanSummary;
db.Logs = Logs;
db.Inquiry = Inquiry;

User.init(sequelize);
UserPlans.init(sequelize);
PlanSummary.init(sequelize);
Logs.init(sequelize);
Inquiry.init(sequelize);

User.associate(db);
UserPlans.associate(db);
PlanSummary.associate(db);
Logs.associate(db);
Inquiry.associate(db);

module.exports = db;
