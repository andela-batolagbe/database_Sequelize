var Sequelize = require('sequelize');

//database connection definition, the mysql server was started using MAMP App
var sequelize = new Sequelize('test_Database', 'root', 'testing', {
  dialect: 'mysql',
  dialectOptions: {
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
  }
});

//user model definition
var User = sequelize.define('User', {
  firstname: {
    type: Sequelize.STRING,
    allowNull: false,
    // unique: true
  },
  lastname: {
    type: Sequelize.STRING,
    allowNull: false
  },
  role: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

//role model definition
var Role = sequelize.define('Role', {
  title: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  }
});

//document model definition
var Document = sequelize.define('Document', {
  content: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  permitted: {
    type: Sequelize.STRING,
    allowNull: false
  },
  // created_by: {
  //   type: Sequelize.STRING
  // },

  dateCreated: {
    type: Sequelize.STRING
  }

});

//model associations
// Document.belongsTo(User, {
//   targetKey: 'firstname',
//   foreignKey: 'created_by'
// });

User.belongsTo(Role, {
  targetKey: 'title',
  foreignKey: 'role'
});

Document.belongsTo(Role, {
  targetKey: 'title',
  foreignKey: 'permitted'
});
sequelize.sync();

//export models as [model]Model
exports.User = User;
exports.Role = Role;
exports.Document = Document;