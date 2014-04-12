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


var Fiber = require('fibers');
var inflection = require('inflection');
var jtrain = require('../../javascripts/jtrain.js');

module.exports = function (modelObject) {
	modelObject.new = function (params) {
		if (params) {
			return this.build(params);
		} else {
			var newObj = {};
			var model_name = inflection.singularize(jtrain.toTitleCase(this.name));
			for(var j in App[model_name].fields) {
				newObj[j] = "";
			}
			return newObj;
		}
	};
	modelObject.all = function () {
		var fiber = Fiber.current;
		this.findAll().done(function(err, data) {
			if (err) return fiber.run(err);
			fiber.run(data);
		});
		return Fiber.yield();
	};
	modelObject.findSync = function (id) {
		var fiber = Fiber.current;
		this.find(id).done(function(err, data) {
			if (err) return fiber.run(err);
			fiber.run(data);
		});
		return Fiber.yield();
	};
	modelObject.DAO.prototype.saveSync = function () {
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
	modelObject.DAO.prototype.updateSync = function (params) {
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
	modelObject.DAO.prototype.destroySync = function () {
		var fiber = Fiber.current;
		this.destroy().success(function() {
			fiber.run(true);
		});
		return Fiber.yield();
	};
};
