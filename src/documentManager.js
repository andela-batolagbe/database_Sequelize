var models = require('./schema');

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
  } else if (!first || !last) {
    return "Invalid, firstname or lastname";
  } else {
    models.Role.findOrCreate({
      where: {
        title: role
      }
    }).then(function() {
      models.User.findOne({
        where: {
          firstname: first,
          lastname: last
        }
      }).then(function(user) {
        if (!user) {
          models.User.create({
            firstname: first,
            lastname: last,
            role: role
          });
          return 'User created';
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

  return models.User.findAll();

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
  return models.User.findOne({
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
  models.Role.create({
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
  return models.Role.findAll();

};

/**
 * [getAllDocuments gets all document in database]
 * @param  {integer} limit [limit of number of files
 * to be returned]
 * @return {JSON}        [documents list]
 */
exports.getAllDocuments = function(limit, res) {

  return models.Document.findAll({
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

  models.Role.findOrCreate({
    where: {
      title: authorizedViewer
    }
  }).then(function(user) {

    models.Document.create({
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
  return models.Document.findAll({
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

  return models.Document.findAll({
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
  models.User.findAll()
    .then(function(users) {
      for (var user in users) {
        models.User.destroy({
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
  models.Role.findAll()
    .then(function(roles) {
      for (var role in roles) {
        models.Role.destroy({
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
  models.Document.findAll()
    .then(function(docs) {
      for (var doc in docs) {
        models.Document.destroy({
          where: {
            content: docs[doc].dataValue.content
          }
        });
      }
    }).catch(function(err) {
      return err;
    });

};
