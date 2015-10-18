var repl = require('repl');
var replServer = repl.start("sequelize_db>");
var documentManager = require('./documentManager');

console.log('\nWelcome to the sequelize checkpoint db terminal\n');
console.log('Run all methods by calling documentManager.methodName()\n');
console.log('Refer to documentManager.js for list of methods');
console.log('Apart from create methods, all other methods require a .then(callback)\n');
console.log('For options on what you want to do with the return values\n');
console.log('Example on use: documentManager.getAllUsers().then(function(users){ console.log(users) })\n');
replServer.context.documentManager = documentManager;