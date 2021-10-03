const Sequelize = require('sequelize')

module.exports= class userPlans extends Sequelize.Model {
  static init(sequelize){
    return super.init({
      genre:{
        type: Sequelize.STRING(100),
        allowNull:false,
      },
      content: {
        type: Sequelize.STRING(200),
        allowNull: false,
        defaultValue: 'none'
      }
    },{
      sequelize,
      timestamps: true,
      underscored:false,
      modelName:'UserPlans',
      tableName: 'user_plans',
      paranoid: false,
      charset:'utf8mb4',
      collate:'utf8mb4_general_ci'
    })
  }
  static associate(db){
    db.UserPlans.belongsTo(db.User);
  }
}