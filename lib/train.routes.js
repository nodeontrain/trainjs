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

trainRoutes = new Array();
trainRoutes['index'] = new Array();
trainRoutes['new'] = new Array();
trainRoutes['edit'] = new Array();
trainRoutes['show'] = new Array();
trainRoutes['create'] = new Array();
trainRoutes['update'] = new Array();
trainRoutes['destroy'] = new Array();
trainRoutes_root = "public";

resources = function (rsrc) {
	var singular = inflection.singularize(rsrc);
	trainRoutes['index'][rsrc] = 'index';	
	trainRoutes['create'][rsrc] = 'create';
	trainRoutes['new'][rsrc] = 'new';
	global['new_' + singular + '_path'] = function () {
		var obj_controller = {};
		obj_controller.controller = rsrc;
		obj_controller.action = "new";
		return obj_controller;
	}
	trainRoutes['edit'][rsrc] = 'edit';
	global['edit_' + singular + '_path'] = function (obj) {
		var obj_controller = {};
		obj_controller.data = obj;
		obj_controller.controller = rsrc;
		obj_controller.action = "edit";
		return obj_controller;
	}
	trainRoutes['show'][rsrc] = 'show';
	global['show_' + singular + '_path'] = function (obj) {
		var obj_controller = {};
		obj_controller.data = obj;
		obj_controller.controller = rsrc;
		obj_controller.action = "show";
		return obj_controller;
	}
	trainRoutes['update'][rsrc] = 'update';
	trainRoutes['destroy'][rsrc] = 'destroy';
}

function train_render(res, req_parser, obj, page, ext) {
	var controller = req_parser['controller'];
	if (page == "new")
		obj.action = "/" + controller;
	else if (page == "edit")
		obj.action = "/" + controller + "/" + req_parser["id"];
	var file = train_root_app + '/app/views/' + controller + '/' + page + '.' + ext;
	fs.readFile(file, function(err_fs, data) {
		if (err_fs)
			console.log(err_fs);
		var str = data.toString();
		var func = ejs.compile(str, {filename: file, pretty: true});
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

routesFunc = function (res, action_key, req_parser) {
	var rsrc = req_parser.controller_url;
	var urlcontrollers = train_root_app + '/app/controllers/' + rsrc + '_controller.ls';
	require(urlcontrollers);
	var controllerName = jtrain_toControllerClass(rsrc);
	var controllerClass = App[controllerName];
	var action = trainRoutes[action_key][rsrc];
	req_parser['action'] = action;
	controllerClass.prototype.params = req_parser;

	if (req_parser.content_type == 'text/html') {
		controllerClass.prototype.respond_to_html = function (obj) {
			var format = req_parser['content_type'];
			train_render(res, req_parser, obj, req_parser['action'], "ejs");
		};
		controllerClass.prototype.respond_to_json = function (){};
	} else {
		controllerClass.prototype.respond_to_html = function (){};
		controllerClass.prototype.respond_to_json = function (obj) {
			var format = req_parser['content_type'];
			res.writeHead(200, {'Content-Type': format});
			res.end(JSON.stringify(obj));
		};
	}
	
	controllerClass.prototype.redirect_to = function(obj) {
		var controller = req_parser['controller'];
		if (obj.action && obj.controller) {
			if (obj.action == "index")
				var lnk = '/' + obj.controller;
		} else {
			for (var k in obj) {
				console.log(obj);
				if (typeof(obj[k]['id']) != "undefined") {
					var obj_id = obj[k]['id'];
					break;
				}
			}
			var lnk = '/' + controller + '/' + obj_id;
		}

		if (req_parser['_method']) res.end(lnk);
		else {
			res.writeHead(302, {'Location': lnk});
			res.end();
		}
	};
	Fiber(function() {
		var controllerObj = new controllerClass;
		controllerObj[action]();
	}).run();
}
