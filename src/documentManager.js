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
exports.userModel = User;
exports.roleModel = Role;
exports.documentModel = Document;

/**
 * [function to create new user]
 * @param  {string} first [user firstname]
 * @param  {string} last  [user lastname]
 * @param  {string} role  [role to be assigned to user]
 * @return {string}       [confirmation message if successful]
 */
exports.createUser = function(first, last, role) {
  if (!role) {
    return "Invalid role";
  } else {
    Role.findOrCreate({
      where: {
        title: role
      }
    }).then(function() {
      User.findOne({
        where: {
          firstname: first,
          lastname: last
        }
      }).then(function(user) {
        if (!user) {
          if (!first || !last) {
            return "Invalid, firstname or lastname";
          } else {
            User.create({
              firstname: first,
              lastname: last,
              role: role
            });
            return 'User created';
          }
        } else {
          return "User already exist";
        }
      });
    });
  }
};

/**
 * [getAllUsers returns all users in databse]
 * @return {JSON} [users in database]
 */
exports.getAllUsers = function(callback) {

  return User.findAll();

};

/**
 * [getOneUser method to get a single user]
 * @param  {string} name [username, either first, last or 
 * fullname]
 * @return {[JSON]}      [user details if found, 
 * error message if not found]
 */
exports.getOneUser = function(name) {
  var theUser,
    nameList = name.split(' ');
  return User.findOne({
    where: {
      $or: [{
        firstname: name
      }, {
        lastname: name
      }, {
        firstname: nameList[0]
      }, {
        firstname: nameList[1]
      }, {
        lastname: nameList[0]
      }, {
        lastname: nameList[1]
      }]
    }
  });
};

/**
 * [addRole function to add a new role]
 * @param {string} role [role title]
 * return {string}  [confirmation message if succesful]
 */
exports.addRole = function(role) {
  Role.create({
    title: role
  }).then(function() {
    return 'Role added';
  }).catch(function(err) {
    return err;
  });
};

/**
 * [getAllRoles gets all roles in database]
 * @return {JSON} [list of all roles]
 */

exports.getAllRoles = function() {
  return Role.findAll();

};

/**
 * [getAllDocuments gets all document in database]
 * @param  {integer} limit [limit of number of files
 * to be returned]
 * @return {JSON}        [documents list]
 */
exports.getAllDocuments = function(limit, res) {

  return Document.findAll({
    order: '"createdAt" DESC',
    limit: limit,
    attributes: ['content', 'permitted', 'dateCreated'],
  });

};

/**
 * [createDocument creates new document in the database]
 * @param  {String} content          [contents of document]
 * @param  {String} authorizedViewer [role to be grated access]
 * @param  {String} firstname        [firstname of creator]
 * @param  {String} lastname         [lastname of creator]
 * @return {String}                  [confirmation message if successful]
 */
exports.createDocument = function(content, authorizedViewer) {

  var createDate = new Date();

  var year = createDate.getFullYear(),
    month = createDate.getMonth() + 1,
    day = createDate.getDate();
  var date = year + '-' + month + '-' + day;

  Role.findOrCreate({
    where: {
      title: authorizedViewer
    }
  }).then(function(user) {

    Document.create({
      content: content,
      permitted: authorizedViewer,
      dateCreated: date
    });
  }).then(function() {
    return 'document successfully created';
  }).catch(function(err) {
    return err;
  });
};

/**
 * [getAllDocumentsByRole gets documents by roles with access]
 * @param  {String} role [role title]
 * @param  {integer} limit [limit of number of files
 * to be returned]
 * @return {[JSON]}      [list of documents that can be accessed by that role]
 */
exports.getAllDocumentsByRole = function(role, limit) {
  return Document.findAll({
    where: {
      permitted: role
    },
    attributes: ['content', 'permitted', 'dateCreated'],
    order: 'createdAt DESC',
    limit: limit
  });
};

/**
 * [getAllDocumentsByDate gets documents created on a given date]
 * @param  {string/date} date [date documents were created]
 * @param  {integer} limit [limit of number of files
 * to be returned]
 * @return {JSON}      [list of documents created 
 * on that date if available]
 */

exports.getAllDocumentsByDate = function(date, limit) {
  var documentList = [];
  var dateValue = new Date(date);
  var year = dateValue.getFullYear(),
    month = dateValue.getMonth() + 1,
    day = dateValue.getDate();
  var actualDate = year + '-' + month + '-' + day;
  return Document.findAll({
    where: {
      dateCreated: actualDate
    },
    attributes: ['content', 'permitted', 'dateCreated'],
    order: 'createdAt DESC',
    limit: limit
  });
};

/**
 * [dropUser, dropRole, dropDocuments are use to 
 * clear the user, role and document tables
 * respectively]
 * @return {no return} 
 */
exports.dropUser = function() {
  User.findAll()
    .then(function(users) {
      for (var user in users) {
        User.destroy({
          where: {
            firstname: users[user].dataValue.firstname
          }
        });
      }
    }).catch(function(err) {
      return err;
    });

};


exports.dropRole = function() {
  Role.findAll()
    .then(function(roles) {
      for (var role in roles) {
        Role.destroy({
          where: {
            title: roles[role].dataValue.title
          }
        });
      }
    }).catch(function(err) {
      return err;
    });

};

exports.dropDocument = function() {
  Document.findAll()
    .then(function(docs) {
      for (var doc in docs) {
        Document.destroy({
          where: {
            content: docs[doc].dataValue.content
          }
        });
      }
    }).catch(function(err) {
      return err;
    });

};

//exports.dropRole();
//exports.getOneUser('Sheyman');
//exports.createUser('John', 'Sheyman', 'regular');
//exports.createDocument('sweet potato', 'admin');
