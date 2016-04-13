var Sequelize = require('sequelize');
var sequelize = CONFIG.database;
%%require_modules%%
var %%model_name%% = sequelize.define('%%model%%', {
%%model_attrs%%
}, {
	freezeTableName: true // Model tableName will be the same as the model name
});

module.exports = %%model_name%%;
