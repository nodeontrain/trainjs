/*

	This file is a part of node-on-train project.

	Copyright (C) Thanh D. Dang <thanhdd.it@gmail.com>

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


var connectRoute = require('connect-route');
var listFiles = require('./helpers/list_files.js');

ROOT_APP = process.cwd();
var routes = require(ROOT_APP + '/config/routes.js');

var controllers = {};
var files = listFiles(ROOT_APP + '/controllers');
for (var k in files) {
	var path = files[k].split('/');
	var controller_name = path[ path.length - 1 ];
	var resource = controller_name.split('_controller')[0];
	controllers[resource] = require(files[k]);
}

module.exports.newServer = connectRoute(function (router) {
	for (var k in routes) {
		var method = routes[k]['method'].toLowerCase();
		var url_path = routes[k]['url'].split('/');
		var resource = url_path[1];
		var action = routes[k]['action'];
		if (!routes[k]['action']) {
			if (method == 'get' && url_path.length > 2) {
				action = 'show';
			} else if (method == 'delete') {
				action = 'destroy';
			} else if (method == 'post') {
				action = 'create';
			} else if (method == 'put') {
				action = 'update';
			} else {
				action = 'index';
			}
		}
		var class_object = new controllers[resource]();
		router[method](routes[k]['url'], class_object[action] );
	}
});
