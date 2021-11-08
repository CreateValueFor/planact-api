const Sequelize = require("sequelize");

module.exports = class Logs extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        action: {
          type: Sequelize.STRING(40),
          allowNull: false,
        },
        ip: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Logs",
        tableName: "tb_logs",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.PlanSummary.belongsTo(db.User);
  }
};
