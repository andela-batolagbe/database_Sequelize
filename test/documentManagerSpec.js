var fs = require('fs');

var documentManager = require('../src/documentManager');

var data = fs.readFileSync(__dirname + '/fixtures.json');

var testData = JSON.parse(data);

describe('User', function() {

  var users = testData[0].Users;

  beforeEach(function(done) {

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

  xit('is unique', function(done) {

    documentManager
      .userModel.create({
        firstname: users[0].firstname,
        lastname: users[0].lastname,
        role: users[0].role
      }).catch(function(err) {
        expect(err).toBeDefined();
        expect(err.hasOwnProperty('errors')).toEqual(true);
        expect(err.errors[0].type).toEqual('unique violation');
        done();
      });
  });

  xit('has a defined role', function(done) {

    var noRole = documentManager.createUser('Simon', 'John', undefined);
    var getOne = documentManager.getOneUser(users[0].firstname);
    var getTwo = documentManager.getOneUser(users[1].firstname);

    expect(noRole).toEqual('user must have a role');
    expect(getOne.role).toBeDefined();
    expect(getOne.role).toEqual('admin');
    expect(getTwo.role).toBeDefined();
    expect(getTwoe.role).toEqual('moderator');

    done();
  });

  xit('has both first and last name', function(done) {

    var noFirst = documentManager.createUser('Simon', undefined, 'regular');
    var noLast = documentManager.createUser(undefined, 'John', 'regular');
    var getOne = documentManager.getOneUser(users[0].firstname);
    var getTwo = documentManager.getOneUser(users[1].lastname);

    expect(noRole).toEqual('please provide a firstname');
    expect(noRole).toEqual('please provide a lastname');
    expect(getOne.lastname).toBeDefined();
    expect(getOne.lastname).toEqual('Adewale');
    expect(getTwo.firstname).toBeDefined();
    expect(getTwo.firstname).toEqual('John');

    done();
  });

  xit(' request for all return all users', function(done) {

    var getAllUsers = documentManager.getAllUsers(function(users) {
      return users;
    });

    expect(getAllUsers).toBeDefined();
    expect(getAllUsers[0].firstname).toEqual('Ore');
    expect(getAllUsers[1].firstname).toEqual('John');
    expect(getAllUsers[2].lasttname).toEqual('Michael');
    expect(getAllUsers[3].lastname).toEqual('Messi');
    expect(getAllUsers[4].role).toEqual('regular');
    expect(getAllUsers[1].role).toEqual('admin');
    done();
  });

});

describe('Role', function() {

  var roles = testData[0].Roles;

  beforeEach(function(done) {

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

  xit('has a unique title', function(done) {


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

    console.log(allRoles);
    
    expect(allRoles).toBeDefined();
    expect(typeof allRoles).toEqual(typeof JSON);
    expect(allRoles[0].title).toEqual('admin');
    expect(allRoles[1].title).toEqual('regular');
    expect(allRoles[0].title).toEqual('moderator');
    done();
  });

});

describe('Document', function() {

  var documents = testData[0].Documents;
  var roles = testData[0].Roles;

  beforeEach(function(done) {

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

  xit(' getAllDocuments should return all documents limited by a specified number', function(done) {

    var documents = documentManager.getAllDocuments(2);

    expect(documents).toBeDefined();
    expect(documents.length).toEqual(2);
    expect(documents[0].contents).toEqual('This is for the fans');
    expect(getAllUsers[1].permitted).toEqual('moderator');

    console.log(documents);

    done();
  });

  xit(' getAllDocuments should return all documents in order of their published dates', function() {

    var documents = documentManager.getAllDocuments(4);

    var createDate = new Date();

    var year = dateValue.getFullYear(),
      month = dateValue.getMonth() + 1,
      day = dateValue.getDay() + 4;
    var date = year + '-' + month + '-' + day;

    expect(documents).toBeDefined();
    expect(documents.length).toEqual(4);
    expect(documents[0].dateCreated).toEqual(date);
    expect(documents[1].dateCreated).toEqual(date);
    expect(documents[2].dateCreated).toEqual(date);
    expect(documents[3].dateCreated).toEqual(date);
    expect(documents[3].permitted).toEqual('admin');

    console.log(documents);

    done();
  });

});

describe('Search', function() {


  var documents = testData[0].Documents;
  var roles = testData[0].Roles;

  beforeEach(function(done) {

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

  xit('getAllDocumentsByRole should return documents that can be accessed by that role', function() {

    var documents = documentManager.getAllDocumentsByRole('regular', 2);

    expect(documents).toBeDefined();
    expect(documents.length).toEqual(2);
    expect(documents[0].contents).toEqual('This is for the fans');
    expect(getAllUsers[1].contents).toEqual('This is owned by the footballer');
    expect(documents[0].permitted).toEqual('regular');
    expect(getAllUsers[1].permitted).toEqual('regular');

    done();
  });

  xit(' getAllDocumentByDate should return documents published on the specified date', function() {

    var documents = documentManager.getAllDocumentsByDate(Date.now, 3);

    expect(documents).toBeDefined();
    expect(documents.length).toEqual(4);
    expect(documents[0].contents).toEqual('This is for the fans');
    expect(documents[1].contents).toEqual('This belongs to the artist');
    expect(getAllUsers[2].contents).toEqual('This is owned by the footballer');
    expect(documents[0].permitted).toEqual('regular');
    expect(getAllUsers[1].permitted).toEqual('moderator');
  });

});
