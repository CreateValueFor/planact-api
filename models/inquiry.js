const Sequelize = require("sequelize");

module.exports = class Inquiry extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: Sequelize.STRING(40),
          allowNull: false,
        },
        nick: {
          type: Sequelize.STRING(15),
          allowNull: false,
        },
        content: {
          type: Sequelize.STRING(200),
        },
        flag: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 1,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Inquiry",
        tableName: "inquiries",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
  static associate(db) {
    db.Inquiry.belongsTo(db.User);
  }
};
