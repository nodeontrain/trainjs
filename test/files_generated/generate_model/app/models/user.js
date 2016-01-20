var Sequelize = require('sequelize');
var sequelize = CONFIG.database;

var User = sequelize.define('user', {
	name: {
		type: Sequelize.STRING,
	},
	email: {
		type: Sequelize.STRING,
	},

}, {
	freezeTableName: true // Model tableName will be the same as the model name
});

module.exports = User;
