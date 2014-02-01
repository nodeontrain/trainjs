/*

	This file is a part of node-on-train project.

	Copyright (C) 2013 Thanh D. Dang <thanhdd.it@gmail.com>

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


var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Fiber = require('fibers');
var train_validate = require('./train.model.validator.js');
var fs = require('fs');

module.exports = function(options) {
	mongoose.connect('mongodb://' + options.host + '/' + options.name);
	mongoose.connection.on('error', function() {
		console.log("Unable to connect to the database");
	});

	var model_files_name = fs.readdirSync(ROOT_APP + '/app/models');
	for	(var i = 0; i < model_files_name.length; i++) {
		require(ROOT_APP + '/app/models/' + model_files_name[i]);
		var item = model_files_name[i];
		var str = item.split(".");
		var modelName = jtrain_toTitleCase(str[0]);

		if (typeof App[modelName] !== "undefined") {
			var objectSchema = new mongoose.Schema(App[modelName].fields);
			if (typeof App[modelName].validates !== "undefined")
				train_validate(App[modelName].validates, objectSchema);
			global[modelName] = mongoose.model(modelName, objectSchema);

			// Querying
			global[modelName].new = function () {
				var newObj = {};
				for(var k in App[this.modelName].fields) {
					newObj[k] = "";
				}
				return newObj;
			};
			global[modelName].all = function () {
				var fiber = Fiber.current;
				this.find(function (err, data) {
					if (err) return fiber.run(err);
					fiber.run(data);
				})
				return Fiber.yield();
			};
			global[modelName].find_by_id = function (id) {
				var fiber = Fiber.current;
				this.findById(id, function(err, data) {
					if (err) return fiber.run(err);
					fiber.run(data);
				})
				return Fiber.yield();
			};
			global[modelName].prototype.save_collection = function () {
				var fiber = Fiber.current;
				this.save(function (err) {
					if (err) return fiber.run(err);
					fiber.run(true);
				});
				return Fiber.yield();
			};
			global[modelName].prototype.update_attributes = function (data) {
				for (var k in data) {
					this[k] = data[k];
				}
				var fiber = Fiber.current;
				this.save(function (err) {
					if (err) return fiber.run(err);
					fiber.run(true);
				});
				return Fiber.yield();
			};
			global[modelName].prototype.destroy = function () {
				var fiber = Fiber.current;
				this.remove(function (err) {
					if (err) return fiber.run(err);
					fiber.run(true);
				});
				return Fiber.yield();
			};
		}
	}
}
