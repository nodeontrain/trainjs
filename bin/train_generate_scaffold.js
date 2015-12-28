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


var fs = require('fs');
var path = require('path');
var inflection = require('inflection');
var root_app = process.cwd();
var stringHelper = require('../lib/helpers/string_helper.js');
var migrationTime = require('../lib/helpers/migration_time.js');
var train_generate = require('./train_generate.js');

module.exports = function() {
	var model_name = process.argv[4];
	var model = model_name.toLowerCase();
	var controller_name = inflection.pluralize(model_name);
	var model_plural = inflection.pluralize(model);
	var migration_file_name = migrationTime() + '_create_' + model_plural;

	var model_attrs = "";
	var migration_attrs = "";
	var form_html = "";
	var index_th_html = "";
	var index_td_html = "";
	var show_html = "";

	for (var i = 5; i < process.argv.length; i++) {
		var attr_str = process.argv[i].split(':');
		var attr_name = stringHelper.toTitleCase(attr_str[0]);

		// model.js
		model_attrs += '\t' + attr_str[0] + ': {\n';
		model_attrs += '\t\ttype: Sequelize.' + attr_str[1].toUpperCase() + ',\n';
		model_attrs += '\t},\n';

		// form.html
		form_html += '\t<div class="field">\n';
		var type = 'text';
		if (attr_str[0] == 'email') {
			type = 'email';
		} else if (attr_str[0] == 'password') {
			type = 'password';
		}
		form_html += '\t\t<text-field attribute="'+attr_str[0]+'" label="'+attr_name+'" type="'+type+'"></text-field>\n';
		form_html += '\t</div>\n';

		// index.html
		index_th_html += '\t\t<th>' + attr_name + '</th>\n';
		index_td_html += '\t\t<td>{{ '+ model +'.'+ attr_str[0] +' }}</td>\n';

		// show.html
		show_html += '<p>\n';
		show_html += '\t<strong>'+ attr_name +':</strong>\n';
		show_html += '\t{{ '+ model +'.'+ attr_str[0] +' }}\n';
		show_html += '</p>\n';

		// migration
		migration_attrs += "\t\t\t" + attr_str[0] + ": DataTypes." + attr_str[1].toUpperCase() + ",\n";
	}

	var dir_templates = {
		'public/partials/controller_name': [
			{ dir_path: 'public/partials/' + model_plural }
		]
	}

	var file_templates = {
		'app/controllers/controller.js': [
			{
				file_path: 'app/controllers/' + model_plural + '_controller.js',
				info_render: {
					controller_name: controller_name,
					model_plural: model_plural,
					model_name: model_name,
					model: model
				}
			}
		],
		'app/models/model.js': [
			{
				file_path: 'app/models/' + model + '.js',
				info_render: {
					model_name: model_name,
					model_attrs: model_attrs,
					model: model
				}
			}
		],
		'db/migrate/migration.js': [
			{
				file_path: 'db/migrate/' + migration_file_name + '.js',
				info_render: {
					model: model,
					migration_attrs: migration_attrs
				}
			}
		],
		'public/controllers/controller.js': [
			{
				file_path: 'public/controllers/' + model_plural + '_controller.js',
				info_render: {
					controller_name: controller_name,
					model_plural: model_plural,
					model_name: model_name,
					model: model
				}
			}
		],
		'public/services/service.js': [
			{
				file_path: 'public/services/' + model + '.js',
				info_render: {
					model_plural: model_plural,
					model_name: model_name,
					model: model
				}
			}
		],
		'public/partials/controller_name/form.html': [
			{
				file_path: 'public/partials/' + model_plural + '/form.html',
				info_render: {
					model: model,
					model_name: model_name,
					model_plural: model_plural,
					form_html: form_html
				}
			}
		],
		'public/partials/controller_name/index.html': [
			{
				file_path: 'public/partials/' + model_plural + '/index.html',
				info_render: {
					model: model,
					model_plural: model_plural,
					model_name: model_name,
					controller_name: controller_name,
					index_td_html: index_td_html,
					index_th_html: index_th_html
				}
			}
		],
		'public/partials/controller_name/show.html': [
			{
				file_path: 'public/partials/' + model_plural + '/show.html',
				info_render: {
					model: model,
					model_plural: model_plural,
					show_html: show_html
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
	if (app_file_content.indexOf('formFor') < 0) {
		app_file_content = app_file_content.replace("'ui.router'", "'ui.router',\n\t'formFor',\n\t'formFor.defaultTemplates'");
	}
	if (app_file_content.indexOf(model_plural + 'Controller') < 0) {
		app_file_content = app_file_content.replace("'ui.router'", "'ui.router',\n\t'" + model_plural + "Controller'");
	}
	if (app_file_content.indexOf(model + 'Service') < 0) {
		app_file_content = app_file_content.replace("'ui.router'", "'ui.router',\n\t'" + model + "Service'");
	}
	if (app_file_content.indexOf('alertHelper') < 0) {
		app_file_content = app_file_content.replace("'ui.router'", "'ui.router',\n\t'alertHelper'");
	}
	if (app_file_content.indexOf('alertDirective') < 0) {
		app_file_content = app_file_content.replace("'ui.router'", "'ui.router',\n\t'alertDirective'");
	}
	if (app_file_content.indexOf('partials/'+model_plural+'/index.html') < 0) {
		var state_content = "\t.state('"+model_plural+"', {\n"
		state_content += "\t\turl: '/"+model_plural+"',\n"
		state_content += "\t\ttemplateUrl: 'partials/"+model_plural+"/index.html',\n"
		state_content += "\t\tresolve: {\n"
		state_content += "\t\t\t"+model_plural+": ['$q', '"+model_name+"', function($q, "+model_name+"){\n"
		state_content += "\t\t\t\tvar deferred = $q.defer();\n"
		state_content += "\t\t\t\t"+model_name+".query({}, function("+model_plural+") {\n"
		state_content += "\t\t\t\t\tdeferred.resolve("+model_plural+");\n"
		state_content += "\t\t\t\t}, function(error) {\n"
		state_content += "\t\t\t\t\tdeferred.reject();\n"
		state_content += "\t\t\t\t});\n"
		state_content += "\t\t\t\treturn deferred.promise;\n"
		state_content += "\t\t\t}]\n"
		state_content += "\t\t},\n"
		state_content += "\t\tcontroller: '"+controller_name+"Ctrl'\n"
		state_content += "\t})"
		app_file_content = app_file_content.replace('\t$stateProvider', '\t$stateProvider\n' + state_content);
	}
	if (app_file_content.indexOf('partials/'+model_plural+'/show.html') < 0) {
		var state_content = "\t.state('"+model+"_detail', {\n"
		state_content += "\t\turl: '/"+model_plural+"/:id',\n"
		state_content += "\t\ttemplateUrl: 'partials/"+model_plural+"/show.html',\n"
		state_content += "\t\tresolve: {\n"
		state_content += "\t\t\t"+model+": ['$q', '$stateParams', '"+model_name+"', function($q, $stateParams, "+model_name+"){\n"
		state_content += "\t\t\t\tvar deferred = $q.defer();\n"
		state_content += "\t\t\t\t"+model_name+".get({id: $stateParams.id}, function("+model+") {\n"
		state_content += "\t\t\t\t\tdeferred.resolve("+model+");\n"
		state_content += "\t\t\t\t}, function(error) {\n"
		state_content += "\t\t\t\t\tdeferred.reject();\n"
		state_content += "\t\t\t\t});\n"
		state_content += "\t\t\t\treturn deferred.promise;\n"
		state_content += "\t\t\t}]\n"
		state_content += "\t\t},\n"
		state_content += "\t\tcontroller: '"+controller_name+"DetailCtrl'\n"
		state_content += "\t})"
		app_file_content = app_file_content.replace('\t$stateProvider', '\t$stateProvider\n' + state_content);
	}
	if (app_file_content.indexOf('partials/'+model_plural+'/form.html') < 0) {
		var state_content = "\t.state('"+model+"_form', {\n"
		state_content += "\t\turl: '/"+model_plural+"/save/:id',\n"
		state_content += "\t\ttemplateUrl: 'partials/"+model_plural+"/form.html',\n"
		state_content += "\t\tresolve: {\n"
		state_content += "\t\t\t"+model+": ['$q', '$stateParams', '"+model_name+"', function($q, $stateParams, "+model_name+"){\n"
		state_content += "\t\t\t\tif ( $stateParams == 'new' ) {\n"
		state_content += "\t\t\t\t\treturn {"
		for (var i = 5; i < process.argv.length; i++) {
			var attr_str = process.argv[i].split(':');
			if (i == 5)
				state_content += attr_str[0] + ": ''";
			else
				state_content += ", " + attr_str[0] + ": ''";
		}
		state_content += "};\n"
		state_content += "\t\t\t\t} else {\n"
		state_content += "\t\t\t\t\tvar deferred = $q.defer();\n"
		state_content += "\t\t\t\t\t"+model_name+".get({id: $stateParams.id}, function("+model+") {\n"
		state_content += "\t\t\t\t\t\tdeferred.resolve("+model+");\n"
		state_content += "\t\t\t\t\t}, function(error) {\n"
		state_content += "\t\t\t\t\t\tdeferred.reject();\n"
		state_content += "\t\t\t\t\t});\n"
		state_content += "\t\t\t\t\treturn deferred.promise;\n"
		state_content += "\t\t\t\t}\n"
		state_content += "\t\t\t}]\n"
		state_content += "\t\t},\n"
		state_content += "\t\tcontroller: '"+model_name+"FormCtrl'\n"
		state_content += "\t})"
		app_file_content = app_file_content.replace('\t$stateProvider', '\t$stateProvider\n' + state_content);
	}
	fs.writeFileSync(app_file, app_file_content);
	//--- Edit public/app.js ---//


	//--- Edit public/index.html ---//
	var index_file = root_app + "/public/index.html";
	var index_file_content = fs.readFileSync(index_file).toString();
	if (index_file_content.indexOf('assets/stylesheets/form-for.css') < 0) {
		index_file_content = index_file_content.replace('</title>', '</title>\n\t<link rel="stylesheet" href="assets/stylesheets/form-for.css">');
	}
	if (index_file_content.indexOf('assets/stylesheets/scaffolds.css') < 0) {
		index_file_content = index_file_content.replace('</title>', '</title>\n\t<link rel="stylesheet" href="assets/stylesheets/scaffolds.css">');
	}
	if (index_file_content.indexOf('lib/form-for.default-templates.js') < 0) {
		index_file_content = index_file_content.replace('<script src="lib/angular-ui-router.min.js"></script>', '<script src="lib/angular-ui-router.min.js"></script>\n\t<script src="lib/form-for.default-templates.js"></script>');
	}
	if (index_file_content.indexOf('lib/form-for.min.js') < 0) {
		index_file_content = index_file_content.replace('<script src="lib/angular-ui-router.min.js"></script>', '<script src="lib/angular-ui-router.min.js"></script>\n\t<script src="lib/form-for.min.js"></script>');
	}
	if (index_file_content.indexOf('lib/angular-resource.min.js') < 0) {
		index_file_content = index_file_content.replace('<script src="lib/angular-ui-router.min.js"></script>', '<script src="lib/angular-ui-router.min.js"></script>\n\t<script src="lib/angular-resource.min.js"></script>');
	}
	if (index_file_content.indexOf('helpers/alert.js') < 0) {
		index_file_content = index_file_content.replace('<script src="app.js"></script>', '<script src="helpers/alert.js"></script>\n\t<script src="app.js"></script>');
	}
	if (index_file_content.indexOf('controllers/'+model_plural+'_controller.js') < 0) {
		index_file_content = index_file_content.replace('<script src="app.js"></script>', '<script src="controllers/'+model_plural+'_controller.js"></script>\n\t<script src="app.js"></script>');
	}
	if (index_file_content.indexOf('services/'+model+'.js') < 0) {
		index_file_content = index_file_content.replace('<script src="app.js"></script>', '<script src="services/'+model+'.js"></script>\n\t<script src="app.js"></script>');
	}
	if (index_file_content.indexOf('directives/alert.js') < 0) {
		index_file_content = index_file_content.replace('<script src="app.js"></script>', '<script src="directives/alert.js"></script>\n\t<script src="app.js"></script>');
	}
	fs.writeFileSync(index_file, index_file_content);
	//--- Edit public/index.html ---//


	//--- Edit app.js ---//
	var app_file = root_app + "/app.js";
	var app_file_content = fs.readFileSync(app_file).toString();
	if (app_file_content.indexOf('bodyParser.json()') < 0) {
		if (app_file_content.indexOf('body-parser') < 0) {
			app_file_content = app_file_content.replace("require('connect');", "require('connect');\nvar bodyParser = require('body-parser');");
		}
		app_file_content = app_file_content.replace("connect();", "connect();\napp.use(bodyParser.json());");
		fs.writeFileSync(app_file, app_file_content);
	}
	//--- Edit app.js ---//


	//--- Edit package.json ---//
	var package_file = root_app + "/package.json";
	var package_file_content = fs.readFileSync(package_file).toString();
	if (package_file_content.indexOf('body-parser') < 0) {
		package_file_content = package_file_content.replace('"dependencies": {', '"dependencies": {\n\t"body-parser": "*",');
	}
	if (package_file_content.indexOf('sequelize') < 0) {
		package_file_content = package_file_content.replace('"dependencies": {', '"dependencies": {\n\t"sequelize": "*",');
	}
	if (package_file_content.indexOf('sqlite3') < 0) {
		package_file_content = package_file_content.replace('"dependencies": {', '"dependencies": {\n\t"sqlite3": "*",');
	}
	fs.writeFileSync(package_file, package_file_content);
	//--- Edit package.json ---//


	var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../');
	var path_templ = lib + 'template/scaffold';

	train_generate(path_templ, dir_templates, file_templates);
}
