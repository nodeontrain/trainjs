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


var fs = require('fs');
var path = require('path');
var inflection = require('inflection');
var root_app = process.cwd();
var train_generate = require('./train_generate.js');

module.exports = function() {
	var model_name = process.argv[4];
	var model = model_name.toLowerCase();
	var controller_name = inflection.pluralize(model_name);
	var model_plural = inflection.pluralize(model);

	var controller_actions = '';
	var service_resources = '';
	if ( process.argv.length < 6 ) {
		controller_actions += '\tthis.index = function(req, res, next) {\n';
		controller_actions += '\t};\n';
		controller_actions += '\tthis.create = function(req, res, next) {\n';
		controller_actions += '\t};\n';
		controller_actions += '\tthis.show = function(req, res, next) {\n';
		controller_actions += '\t};\n';
		controller_actions += '\tthis.update = function(req, res, next) {\n';
		controller_actions += '\t};\n';
		controller_actions += '\tthis.destroy = function(req, res, next) {\n';
		controller_actions += '\t};\n';
		service_resources += "\t\t'get':    {method: 'GET'},\n";
		service_resources += "\t\t'create': {method: 'POST'},\n";
		service_resources += "\t\t'update': {method: 'PUT'},\n";
		service_resources += "\t\t'query':  {method: 'GET', isArray:true},\n";
		service_resources += "\t\t'delete': {method: 'DELETE'},\n";
	} else {
		for (var i = 5; i < process.argv.length; i++) {
			var action = process.argv[i];
			controller_actions += '\tthis.'+action+' = function(req, res, next) {\n';
			controller_actions += '\t};\n';

			if (action == 'show') {
				service_resources += "\t\t'get':    {method: 'GET'},\n";
			} else if (action == 'create') {
				service_resources += "\t\t'create': {method: 'POST'},\n";
			} else if (action == 'update') {
				service_resources += "\t\t'update': {method: 'PUT'},\n";
			} else if (action == 'destroy') {
				service_resources += "\t\t'delete': {method: 'DELETE'},\n";
			} else if (action == 'index') {
				service_resources += "\t\t'query':  {method: 'GET', isArray:true},\n";
			}
		}
	}

	var file_templates = {
		'app/controllers/controller.js': [
			{
				file_path: 'app/controllers/' + model_plural + '_controller.js',
				info_render: {
					controller_name: controller_name,
					model_plural: model_plural,
					model_name: model_name,
					model: model,
					controller_actions: controller_actions
				}
			}
		],
		'public/services/service.js': [
			{
				file_path: 'public/services/' + model + '.js',
				info_render: {
					model_plural: model_plural,
					model_name: model_name,
					model: model,
					service_resources: service_resources
				}
			}
		]
	}

	//--- Edit routes ---//
	var routes_file = root_app + "/config/routes.js";
	var routes = require(routes_file);
	var is_exist = false;
	for (var k in routes) {
		if (routes[k]['resources'] && routes[k]['resources'] == model_plural) {
			is_exist = true;
			break;
		}
	}
	if (!is_exist) {
		var routes_content = fs.readFileSync(routes_file).toString();
		routes_content = routes_content.replace(']', "\t{ resources: '"+model_plural+"' },\n]");
		fs.writeFileSync(routes_file, routes_content);
	}
	//--- Edit routes ---//

	//--- Edit public/app.js ---//
	var app_file = root_app + "/public/app.js";
	var app_file_content = fs.readFileSync(app_file).toString();
	if (app_file_content.indexOf(model + 'Service') < 0) {
		app_file_content = app_file_content.replace("'ui.router'", "'ui.router',\n\t'" + model + "Service'");
	}
	fs.writeFileSync(app_file, app_file_content);
	//--- Edit public/app.js ---//

	//--- Edit public/index.html ---//
	var index_file = root_app + "/public/index.html";
	var index_file_content = fs.readFileSync(index_file).toString();
	if (index_file_content.indexOf('angular-resource.min.js') < 0) {
		index_file_content = index_file_content.replace('<script src="../node_modules/angular-ui-router/release/angular-ui-router.min.js"></script>', '<script src="../node_modules/angular-ui-router/release/angular-ui-router.min.js"></script>\n\t<script src="../node_modules/angular-resource/angular-resource.min.js"></script>');
	}
	if (index_file_content.indexOf('services/'+model+'.js') < 0) {
		index_file_content = index_file_content.replace('<script src="app.js"></script>', '<script src="services/'+model+'.js"></script>\n\t<script src="app.js"></script>');
	}
	fs.writeFileSync(index_file, index_file_content);
	//--- Edit public/index.html ---//

	//--- Edit package.json ---//
	var package_file = root_app + "/package.json";
	var package_file_content = fs.readFileSync(package_file).toString();
	if (package_file_content.indexOf('angular-resource') < 0) {
		package_file_content = package_file_content.replace('"dependencies": {', '"dependencies": {\n\t\t"angular-resource": "1.5.0",');
	}
	fs.writeFileSync(package_file, package_file_content);
	//--- Edit package.json ---//

	var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../');
	var path_templ = lib + 'template/service';

	train_generate(path_templ, null, file_templates);
}
