const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: Sequelize.STRING(40),
          allowNull: true,
          unique: true,
        },
        nick: {
          type: Sequelize.STRING(15),
          allowNull: false,
        },
        thumb:{
          type:Sequelize.STRING(200),
          allowNull:true
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        flag: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "User",
        tableName: "tb_users",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.User.hasMany(db.UserPlans);
    db.User.hasMany(db.Inquiry);
    db.User.hasMany(db.PlanSummary);
    db.User.hasMany(db.Logs);
  }
};
