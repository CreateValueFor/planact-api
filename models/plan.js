const Sequelize = require("sequelize");

module.exports = class PlanSummary extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        planID: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        imgID: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        author: {
          type: Sequelize.STRING(40),
          allowNull: false,
        },
        sns: {
          type: Sequelize.STRING(40),
          allowNull: true,
        },
        title: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        category: {
          type: Sequelize.STRING(40),
          allowNull: false,
        },
        downloads: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "PlanSummary",
        tableName: "tb_plan_summary",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.PlanSummary.belongsTo(db.User);
    db.PlanSummary.hasMany(db.UserPlans);
  }
};
