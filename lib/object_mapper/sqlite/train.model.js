/*

	This file is a part of node-on-train project.

	Copyright (C) 2013-2014 Thanh D. Dang <thanhdd.it@gmail.com>

	node-on-train is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	node-on-train is distributed in the hope that it will be useful, but
	WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
	General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/


var Sequelize = require('sequelize');
var Fiber = require('fibers');
var fs = require('fs');
var inflection = require('inflection');
var train_validate = require('./train.model.validator.js');

module.exports = function(options) {
    var sequelize = new Sequelize('database', null, null, {
        dialect: 'sqlite',
        storage: options.database
    });

	var model_files_name = fs.readdirSync(ROOT_APP + '/app/models');
	var model_array = [];
	for	(var i = 0; i < model_files_name.length; i++) {
		require(ROOT_APP + '/app/models/' + model_files_name[i]);
		var item = model_files_name[i];
		var str = item.split(".");
		var modelName = jtrain_toTitleCase(str[0]);
		var table_name = inflection.pluralize(str[0]);

		if (typeof App[modelName] !== "undefined") {
			model_array.push(modelName);
			var attributes = {};
            for (var k in App[modelName].fields) {
				var type = App[modelName].fields[k].toUpperCase();
				if (typeof App[modelName].validates !== "undefined" &&
					typeof App[modelName].validates[k] !== "undefined") {
					var validates = train_validate(App[modelName].validates[k]);
					attributes[k] = {type: Sequelize[type], validate: validates};
				}
				else attributes[k] = Sequelize[type];
			}
			global[modelName] = sequelize.define(table_name, attributes);

			// Querying
			global[modelName].new = function (params) {
				if (params) {
					return this.build(params);
				} else {
					var newObj = {};
					var model_name = inflection.singularize(jtrain_toTitleCase(this.name));
					for(var j in App[model_name].fields) {
						newObj[j] = "";
					}
					return newObj;
				}
			};
			global[modelName].all = function () {
				var fiber = Fiber.current;
				this.findAll().done(function(err, data) {
					if (err) return fiber.run(err);
					fiber.run(data);
				});
				return Fiber.yield();
			};
			global[modelName].findSync = function (id) {
				var fiber = Fiber.current;
				this.find(id).done(function(err, data) {
					if (err) return fiber.run(err);
					fiber.run(data);
				});
				return Fiber.yield();
			};
			global[modelName].DAO.prototype.saveSync = function () {
				var fiber = Fiber.current;
				var self = this;
				this.save().success(function(data) {
					self = data;
					fiber.run(true);
				}).error(function(error) {
					self.errors = error;
					fiber.run(false);
				});
				return Fiber.yield();
			};
			global[modelName].DAO.prototype.update = function (params) {
				var fiber = Fiber.current;
				var self = this;
				this.updateAttributes(params).success(function(data) {
					self = data;
					fiber.run(true);
				}).error(function(error) {
					self.errors = error;
					fiber.run(false);
				});
				return Fiber.yield();
			};
			global[modelName].DAO.prototype.destroySync = function () {
				var fiber = Fiber.current;
				this.destroy().success(function() {
					fiber.run(true);
				});
				return Fiber.yield();
			};
		}
	}

	// Associations
	for	(var i = 0; i < model_array.length; i++) {
		var modelName = model_array[i];
		var modelObj = null;
		var modelObj_id = null;
		if (App[modelName].associations) {
			for (var k in App[modelName].associations) {
				if (k == "has_many") {
					modelObj = jtrain_toTitleCase(inflection.singularize(App[modelName].associations[k]));
					modelObj_id = modelName.toLowerCase() + "_id";
					global[modelName].hasMany(global[modelObj], { foreignKey: modelObj_id });

					// Example: user.microposts
					global[modelName].DAO.prototype[App[modelName].associations[k]] = function () {
						var fiber = Fiber.current;
						var model_name = jtrain_toTitleCase(inflection.singularize(this.daoFactoryName));
						var func_name = 'get' + jtrain_toTitleCase(App[model_name].associations["has_many"]);
						this[func_name]().success(function(data) {
							fiber.run(data);
						});
						return Fiber.yield();
					}
				} else if (k == "belongs_to") {
					modelObj = jtrain_toTitleCase(App[modelName].associations[k]);
					modelObj_id = App[modelName].associations[k] + "_id";
					global[modelName].belongsTo(global[modelObj], { foreignKey: modelObj_id });

					// Example: micropost.user
					global[modelName].DAO.prototype[App[modelName].associations[k]] = function () {
						var fiber = Fiber.current;
						var model_name = jtrain_toTitleCase(inflection.singularize(this.daoFactoryName));
						var func_name = 'get' + jtrain_toTitleCase(App[model_name].associations["belongs_to"]);
						this[func_name]().success(function(data) {
							fiber.run(data);
						});
						return Fiber.yield();
					}
				}
			}
		}
	}
}
