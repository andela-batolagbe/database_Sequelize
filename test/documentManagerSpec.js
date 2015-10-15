var fs = require('fs');

var documentManager = require('../src/documentManager');

var data = fs.readFileSync(__dirname + '/fixtures.json');

var testData = JSON.parse(data);


/**
 * [fuction to extract data values from response]
 * @param  {[JSON]} data [returned data]
 * @return {[JSON]}      [extracted values]
 */
var response = function(data) {
  var dataList = [];
  dataNum = data.length;
  for (var i = 0; i < dataNum; i++) {
    dataList.push(data[i].dataValues);
  }

  return dataList;
};

//user table tests
describe('User', function() {

  var users = testData[0].Users;

  beforeEach(function(done) {

  	documentManager.dropUser();
    documentManager.dropDocument();
    documentManager.dropRole();
    
    for (var user in users) {
      documentManager
        .createUser(users[user]
          .firstname, users[user].lastname, users[user].role);
    }
    done();
  });

  afterEach(function(done) {

    documentManager.dropUser();
    documentManager.dropDocument();
    documentManager.dropRole();
    done();
  });

  it('is unique', function(done) {

    documentManager
      .userModel.create({
        firstname: users[0].firstname,
        lastname: users[0].lastname,
        role: users[0].role
      }).catch(function(err) {
        expect(err).toBeDefined();
        expect(err.hasOwnProperty('errors')).toEqual(true);
        expect(err.errors[0].type).toEqual('unique violation');
      });
    done();
  });

  it('has a defined role', function(done) {

    var noRole = documentManager.createUser('Simon', 'John', undefined);
    var getAllUsers = documentManager.getAllUsers();

    getAllUsers.then(function(users) {

      userList = response(users);
      expect(noRole).toEqual('Invalid role');
      expect(userList[0].role).toBeDefined();
      expect(userList[0].role).toEqual('admin');
      expect(userList[1].role).toBeDefined();
      expect(userList[1].role).toEqual('moderator');
      done();

    });
  });

  it('has both first and last name', function(done) {

    var noFirst = documentManager.createUser('Simon', undefined, 'regular');
    var noLast = documentManager.createUser(undefined, 'John', 'regular');
    var getOne = documentManager.getOneUser(users[0].firstname);

    getOne.then(function(user) {
      console.log(noFirst);
      var theUser = response(user);

      expect(noFirst).toEqual('Invalid, firstname or lastname');
      expect(noLast).toEqual('Invalid, firstname or lastname');
      expect(user.dataValues.lastname).toBeDefined();
      expect(user.dataValues.lastname).toEqual('Adewale');
      expect(user.dataValues.firstname).toBeDefined();
      expect(user.dataValues.firstname).toEqual('Ore');
      done();
    });

  });

  it(' request for all return all users', function(done) {

    var getAllUsers = documentManager.getAllUsers();

    getAllUsers.then(function(users) {

      var userList = response(users);
      expect(userList).toBeDefined();
      expect(userList[0].firstname).toEqual('Ore');
      expect(userList[1].firstname).toEqual('John');
      expect(userList[2].lastname).toEqual('Michael');
      expect(userList[3].lastname).toEqual('Messi');
      expect(userList[4].role).toEqual('regular');
      expect(userList[0].role).toEqual('admin');
      done();
    });

  });

});

//role table tests
describe('Role', function() {

  var roles = testData[0].Roles;

  beforeEach(function(done) {

    documentManager.dropUser();
    documentManager.dropDocument();
    documentManager.dropRole();
    
    for (var role in roles) {
      documentManager.addRole(roles[role]);
    }
    done();
  });

  afterEach(function(done) {

    documentManager.dropUser();
    documentManager.dropDocument();
    documentManager.dropRole();
    done();
  });

  it('has a unique title', function(done) {


    documentManager.roleModel.create({
      title: roles[0]
    }).catch(function(err) {
      expect(err).toBeDefined();
      expect(err.hasOwnProperty('errors')).toEqual(true);
      expect(err.errors[0].type).toEqual('unique violation');
      done();
    });
  });

  it(' request for all return all roles', function(done) {

    var allRoles = documentManager.getAllRoles();


    allRoles.then(function(roles) {

      var roleList = response(roles);
      expect(roleList).toBeDefined();
      expect(typeof roleList).toEqual(typeof JSON);
      expect(roleList[0].title).toEqual('admin');
      expect(roleList[1].title).toEqual('moderator');
      expect(roleList[2].title).toEqual('regular');
      done();
    });

  });

});

//user document tests
describe('Document', function() {

  var documents = testData[0].Documents;
  var roles = testData[0].Roles;

  beforeEach(function(done) {

  	documentManager.dropUser();
    documentManager.dropDocument();
    documentManager.dropRole();

    for (var doc in documents) {
      documentManager.createDocument(documents[doc].contents, documents[doc].permitted);
    }
    done();
  });

  afterEach(function(done) {

    documentManager.dropUser();
    documentManager.dropDocument();
    documentManager.dropRole();
    done();
  });

  it(' getAllDocuments should return all documents limited by a specified number', function(done) {

    var documents = documentManager.getAllDocuments(2);

    documents.then(function(docs) {
      docList = response(docs);
      expect(docList).toBeDefined();
      expect(docList.length).toEqual(2);
      expect(docList[0].content).toEqual('This is for the fans');
      expect(docList[1].permitted).toEqual('moderator');
      done();
    });
  });

  it(' getAllDocuments should return all documents in order of their published dates', function(done) {

    var documents = documentManager.getAllDocuments(4);

    //generate date to be used for evaluating results
    var createDate = new Date();

    var year = createDate.getFullYear(),
      month = createDate.getMonth() + 1,
      day = createDate.getDate();
    var date = year + '-' + month + '-' + day;

    documents.then(function(docs) {
      docList = response(docs);
      expect(docList).toBeDefined();
      expect(docList.length).toEqual(4);
      expect(docList[0].dateCreated).toEqual(date);
      expect(docList[1].dateCreated).toEqual(date);
      expect(docList[2].dateCreated).toEqual(date);
      expect(docList[3].dateCreated).toEqual(date);
      expect(docList[3].permitted).toEqual('admin');

      done();
    });

  });

});

describe('Search', function() {


  var documents = testData[0].Documents;
  var roles = testData[0].Roles;

  beforeEach(function(done) {

  	documentManager.dropUser();
    documentManager.dropDocument();
    documentManager.dropRole();

    for (var doc in documents) {
      documentManager.createDocument(documents[doc].contents, documents[doc].permitted);
    }
    done();
  });

  afterEach(function(done) {

    documentManager.dropUser();
    documentManager.dropDocument();
    documentManager.dropRole();
    done();
  });

  it('getAllDocumentsByRole should return documents that can be accessed by that role', function(done) {

    var documents = documentManager.getAllDocumentsByRole('regular', 2);

    documents.then(function(docs) {

      docList = response(docs);

      expect(docList).toBeDefined();
      expect(docList.length).toEqual(2);
      expect(docList[0].content).toEqual('This is for the fans');
      expect(docList[1].content).toEqual('This is owned by the footballer');
      expect(docList[0].permitted).toEqual('regular');
      expect(docList[1].permitted).toEqual('regular');

      done();
    });
  });

  it(' getAllDocumentByDate should return documents published on the specified date', function(done) {

    //generate date to be passed as an argument
    var date = new Date();

    var documents = documentManager.getAllDocumentsByDate(date, 3);

    documents.then(function(docs) {

      docList = response(docs);

      expect(docList).toBeDefined();
      expect(docList.length).toEqual(3);
      expect(docList[0].content).toEqual('This is for the fans');
      expect(docList[1].content).toEqual('This belongs to the artist');
      expect(docList[2].content).toEqual('This is owned by the footballer');
      expect(docList[0].permitted).toEqual('regular');
      expect(docList[1].permitted).toEqual('moderator');
      done();
    });

  });
});
