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


var fs = require('fs');
var ejs = require('ejs');
var Fiber = require('fibers');
var inflection = require('inflection');
var train_parser = require('./train.parser.js');

trainRoutes = new Array();
trainRoutes['controller_url'] = new Array();
trainRoutes['index'] = new Array();
trainRoutes['new'] = new Array();
trainRoutes['edit'] = new Array();
trainRoutes['show'] = new Array();
trainRoutes['create'] = new Array();
trainRoutes['update'] = new Array();
trainRoutes['destroy'] = new Array();
trainRoutes_root = "public";

var train_status = new Array();

resources = function (rsrc) {
	var singular = inflection.singularize(rsrc);
	trainRoutes['controller_url'][rsrc] = train_root_app + '/app/controllers/' + rsrc + '_controller.ls';
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
		return "/" + rsrc + "/" + obj.id;
	}
	// update action
	trainRoutes['update'][rsrc] = 'update';
	// destroy action
	trainRoutes['destroy'][rsrc] = 'destroy';
}

function train_render(res, req_parser, obj, ext) {
	var controller = req_parser['controller'];
	var page = req_parser['action'];
	if (typeof req_parser["id"] !== "undefined")
		var id = req_parser["id"];
	if (page == "new")
		obj.action = "/" + controller;
	else if (page == "edit")
		obj.action = "/" + controller + "/" + id;
	var file = train_root_app + '/app/views/' + controller + '/' + page + '.' + ext;
	
	fs.readFile(file, function(err_fs, data) {
		if (err_fs)
			console.log(err_fs);
		var str = data.toString();
		var func = ejs.compile(str, {filename: file, pretty: true});
		
		
		if (typeof req_parser['train_notice'] !== "undefined" && req_parser['train_notice'] == "yes"
			&& typeof train_status[req_parser.controller_url] !== "undefined"
			&& typeof train_status[req_parser.controller_url][req_parser.action_key] !== "undefined") {
			var response_status = train_status[req_parser.controller_url][req_parser.action_key];
		} else {
			var response_status = {
				notice: ""
			}
		}

		for (var k in response_status) {
			obj[k] = response_status[k];
		}
		var content_body = func(obj);
		
		// Render layout
		var layout = train_root_app + '/app/views/layouts/application.' + ext;
		fs.readFile(layout, function(err_fs2, data2) {
			if(err_fs2)
				console.log(err_fs2);
			var str2 = data2.toString();
			var func2 = ejs.compile(str2, {filename: layout, pretty: true});
			var body = {yield: content_body}
			Fiber(function() {
				var content = func2(body);
				res.end(content);
			}).run();
		});
	});
}

render = function (params) {
	return params;
}

redirect_to = function (options, response_status) {
	var obj = {};
	obj.url = options;
	obj.method = 'redirect';
	obj.response_status = response_status;
	return obj;
}

routesFunc = function (res, req_parser) {
	var action_key = req_parser.action_key;
	var rsrc = req_parser.controller_url;
	var urlcontrollers = trainRoutes['controller_url'][rsrc];
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
	
	if (req_parser.content_type == 'text/html') {
		controllerClass.prototype.format_html = function (options) {
			if (typeof options.method !== 'undefined' && options.method == "redirect") {
				if (typeof options.url !== "object") {
					var parser = {};
					parser.method = "GET";
					var result = train_parser(options.url, parser);
					if (typeof response_status !== "undefined") {
						train_status[result.controller_url] = new Array();
						train_status[result.controller_url][result.action_key] = options.response_status;
					}
					var lnk = options.url;
				}
				if (req_parser['_method']) res.end(lnk);
				else {
					res.writeHead(302, {'Location': lnk + '/'});
					res.end();
				}
			} else {	
				var obj = options;
				train_render(res, req_parser, obj, "ejs");
			}
		};
		controllerClass.prototype.format_json = function (){};
	} else {
		controllerClass.prototype.format_html = function (){};
		controllerClass.prototype.format_json = function (options) {
			var status = 200;
			var obj = options.json;
			if (typeof options.status !== 'undefined' && options.status == "created")
				status = 201;
			var format = req_parser['content_type'];
			if (typeof options.location !== 'undefined')
				res.writeHead(status, {'Content-Type': format, 'Location': HOST_NAME + options.location});
			else
				res.writeHead(status, {'Content-Type': format});
			res.end(JSON.stringify(obj));
		};
	}

	Fiber(function() {
		var controllerObj = new controllerClass;
		controllerObj[action]();
	}).run();
}
