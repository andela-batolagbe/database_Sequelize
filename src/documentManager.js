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


var response = function(data) {
  var dataList = [];
  dataNum = data.length;
  for (var i = 0; i < dataNum; i++) {
    dataList.push(data[i].dataValues);
  }
  console.log(dataList);
  return dataList;
};

/**
 * [function to create new user]
 * @param  {string} first [user firstname]
 * @param  {string} last  [user lastname]
 * @param  {string} role  [role to be assigned to user]
 * @return {string}       [confirmation message if successful]
 */
exports.createUser = function(first, last, role) {
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
        User.create({
          firstname: first,
          lastname: last,
          role: role
        });
        return 'User created';
      } else {
        return "User already exist";
      }
    });
  }).catch(function(err) {
    console.log(err);
  });
};

/**
 * [getAllUsers returns all users in databse]
 * @return {JSON} [users in database]
 */
exports.getAllUsers = function(callback) {

  User.findAll().then(function(users) {

    response(users);
  }).catch(function(err) {
    response(err);
  });
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
  User.findOne({
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
  }).then(function(user) {

    if (!user) {
      return 'User not found';
    } else {
      theUser = user.get({
        plain: true
      });
      return theUser;
    }
  }).catch(function(err) {
    return err;
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

exports.getAllRoles = function(callback) {

  Role.findAll().then(function(roles) {
    callback(
      response(roles));
  }).catch(function(err) {
    callback(err);
  });
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
    attributes: ['content', 'created_by', 'permitted', 'dateCreated'],
  }).then(function(documents) {
    response(documents);
  }).catch(function(err) {
    response(err);
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
  var currentDate = new Date();
  var year = currentDate.getFullYear(),
    month = currentDate.getMonth() + 1,
    day = currentDate.getDay() + 4,
    createdDate = year + '-' + month + '-' + day;
  Role.findOrCreate({
    where: {
      title: authorizedViewer
    }
  }).then(function(user) {

    Document.create({
      content: content,
      permitted: authorizedViewer,
      dateCreated: createdDate
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
  Document.findAll({
    where: {
      permitted: role
    },
    attributes: ['content', 'created_by', 'permitted', 'dateCreated'],
    order: 'createdAt DESC',
    limit: limit
  }).then(function(documents) {
    if (!documents) {
      return 'No documents can be accessed by this role';
    } else {
      response(documents);
    }
  }).catch(function(err) {
    response(err);
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
    day = dateValue.getDay() + 4;
  var actualDate = year + '-' + month + '-' + day;
  Document.findAll({
    where: {
      dateCreated: actualDate
    },
    attributes: ['content', 'created_by', 'permitted', 'dateCreated'],
    order: 'createdAt DESC',
    limit: limit
  }).then(function(documents) {
    if (!documents) {
      return 'No document was created on this day';
    } else {
      response(documents);
    }
  }).catch(function(err) {
    response(err);
  });
};

/**
 * [dropUser, dropRole, dropDocuments are use to 
 * clear the user, role and document tables
 * respectively]
 * @return {no return} 
 */
exports.dropUser = function() {
  sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
    .then(User.destroy({
      truncate: true
    })).catch(function(err) {
      return err;
    });

};


exports.dropRole = function() {
  sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
    .then(Role.destroy({
      truncate: true
    })).catch(function(err) {
      return err;
    });

};

exports.dropDocument = function() {
  sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
    .then(Document.destroy({
      truncate: true
    })).catch(function(err) {
      return err;
    });
};

//exports.dropRole();
exports.getAllRoles(function(params) {
  return params;
});
//createUser('John', 'Sheyman', 'regular');
//exports.createDocument('sweet potato', 'admin', 'Atolagbe', 'Bisoye');
