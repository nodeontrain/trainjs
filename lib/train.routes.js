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
var train_respond = require('./train.respond.js');
var train_errors_respond = require('./train.errors.respond.js');
var fs = require('fs');

var trainRoutes = new Array();
trainRoutes['type'] = new Array();
trainRoutes['controller_url'] = new Array();
trainRoutes['index'] = new Array();
trainRoutes['new'] = new Array();
trainRoutes['edit'] = new Array();
trainRoutes['show'] = new Array();
trainRoutes['create'] = new Array();
trainRoutes['update'] = new Array();
trainRoutes['destroy'] = new Array();
trainRoutes['train_root'] = "public";

resources = function (rsrc) {
	var singular = inflection.singularize(rsrc);
	trainRoutes['type'][rsrc] = "REST";
	trainRoutes['controller_url'][rsrc] = ROOT_APP + '/app/controllers/' + rsrc + '_controller.ls';
	// index action
	trainRoutes['index'][rsrc] = 'index';
	global[rsrc + '_path'] = '/' + rsrc;
	global[rsrc + '_url'] = global[rsrc + '_path'];
	// create action
	trainRoutes['create'][rsrc] = 'create';
	// new action
	trainRoutes['new'][rsrc] = 'new';
	global['new_' + singular + '_path'] = '/' + rsrc + '/new';
	// edit action
	trainRoutes['edit'][rsrc] = 'edit';
	global['edit_' + singular + '_path'] = function (obj) {
		return "/" + rsrc + "/" + obj.id + "/edit";
	}
	// show action
	trainRoutes['show'][rsrc] = 'show';
	global[singular + '_path'] = function (obj) {
		if (obj.id)
			return "/" + rsrc + "/" + obj.id;
		else
			return "/" + rsrc;
	}
	// update action
	trainRoutes['update'][rsrc] = 'update';
	// destroy action
	trainRoutes['destroy'][rsrc] = 'destroy';
}

get = function (link) {
	var controller = link.split('/')[0];
	var action = link.split('/')[1];

	if (!trainRoutes['controller_url'][controller])
		trainRoutes['controller_url'][controller] = ROOT_APP + '/app/controllers/' + controller + '_controller.ls';

	if (!trainRoutes[action])
		trainRoutes[action] = new Array();
	trainRoutes[action][controller] = action;
}

exports.routes = function () {
	return trainRoutes;
}

exports.routing = function (res, req_parser) {
	var action_key = req_parser.action_key;
	var rsrc = req_parser.controller;
	var urlcontrollers = trainRoutes['controller_url'][rsrc];
	if (typeof urlcontrollers === "undefined") {
		train_errors_respond ("config_error", req_parser, res);
	} else {
		if (fs.existsSync(urlcontrollers)) {
			require(urlcontrollers);
			var controllerName = jtrain_toControllerClass(rsrc);
			var controllerClass = App[controllerName];
			var action = trainRoutes[action_key][rsrc];
			req_parser['action'] = action;

			var params = {};
			if (typeof req_parser['data'] !== "undefined") {
				params['data'] = {};
				if (req_parser.content_type == 'text/html') {
					for (var k in req_parser['data']) {
						var matches = k.match(/\[(.*?)\]/);
						if (matches) {
							var submatch = matches[1];
							params['data'][submatch] = req_parser['data'][k];
						}
					}
				} else {
					for (var k in req_parser['data']) {
						params['data'] = req_parser['data'][k];
					}
				}
			}
			if (typeof req_parser['id'] !== "undefined")
				params['id'] = req_parser['id'];
			controllerClass.prototype.params = params;
	
			controllerClass.prototype.respond_to = function (format) {
				if (req_parser.content_type == 'text/html' && typeof format.format_html !== 'undefined') {
					var options = format.format_html;
					train_respond.format_html(options, req_parser, res);
				} else if (req_parser.content_type == 'application/json'
							&& typeof format.format_json !== 'undefined') {
					var options = format.format_json;
					train_respond.format_json(options, req_parser, res);
				}
			}
			controllerClass.prototype.render = function (options) {
				if (typeof options.json !== 'undefined') {
					train_respond.format_json(options, req_parser, res);
				} else {
					train_respond.format_html(options, req_parser, res);
				}
			}

			Fiber(function() {
				var controllerObj = new controllerClass;
				try {
					controllerObj[action]();
				} catch(error) {
					var options = {info: error.toString(), controller: controllerName, action: action}
					train_errors_respond ("model_undefined", req_parser, res, options);
				}
			}).run();
		} else {
			var options = { controller: jtrain_toTitleCase(rsrc) };
			train_errors_respond ("controller_not_found", req_parser, res, options);
		}
	}
}
