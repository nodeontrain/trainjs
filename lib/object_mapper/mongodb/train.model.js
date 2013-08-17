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
var Fiber = require('fibers');

mongoose.connect('mongodb://' + traindbconfig.development.host + '/' + traindbconfig.development.name);
mongoose.connection.on('error', function() {
	console.log("Unable to connect to the database");
});

for	(var i = 0; i < filesnameModels.length; i++) {
	var item = filesnameModels[i];
	var str = item.split(".");
	var modelName = jtrain_toTitleCase(str[0]);
	var objectSchema = new mongoose.Schema(App[modelName].fields);
	global[modelName] = mongoose.model(modelName, objectSchema);
	
	var newObj = {};
	for(var k in App[modelName].fields) {
		newObj[k] = "";
	}
	
	// Querying
	global[modelName].new = newObj;
	global[modelName].all = function () {
		var fiber = Fiber.current;
		global[modelName].find(function (err, users) {
			if (err) return fiber.throwInto(err);
			fiber.run(users);
		})
		return Fiber.yield();
	};
	global[modelName].find_by_id = function (id) {
		var fiber = Fiber.current;
		global[modelName].findById(id, function(err, user) {
			if (err) return fiber.throwInto(err);
			fiber.run(user);
		})
		return Fiber.yield();
	};
	global[modelName].prototype.save_collection = function () {
		var fiber = Fiber.current;
		this.save(function (err) {
			if (err) return fiber.throwInto(err);
			fiber.run(true);
		});
		return Fiber.yield();
	};
	global[modelName].prototype.update_attributes = function (data) {
		var fiber = Fiber.current;
		this.update(data, function (err) {
			if (err) return fiber.throwInto(err);
			fiber.run(true);
		});
		return Fiber.yield();
	};
	global[modelName].prototype.destroy = function () {
		var fiber = Fiber.current;
		this.remove(function (err) {
			if (err) return fiber.throwInto(err);
			fiber.run(true);
		});
		return Fiber.yield();
	};
}
