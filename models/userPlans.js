const Sequelize = require("sequelize");

module.exports = class userPlans extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        flag: {
          type: Sequelize.TINYINT(2),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "UserPlans",
        tableName: "tb_user_plans",
        paranoid: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }
  static associate(db) {
    db.UserPlans.belongsTo(db.User);
    db.UserPlans.belongsTo(db.PlanSummary);
  }
};
