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
	var database = process.argv[4].toLowerCase();
	var npm_module = ['mysql2'];
	if (database == 'sqlite')
		npm_module = ['sqlite3'];
	else if (database == 'postgres')
		npm_module = ['pg','pg-hstore'];
	else if (database == 'mssql')
		npm_module = ['tedious'];

	var development_options = '\t\t"host": "localhost",\n';
	development_options += '\t\t"database": "database_development",\n';
	development_options += '\t\t"username": "username",\n';
	development_options += '\t\t"password": "password"';
	var test_options = '\t\t"host": "localhost",\n';
	test_options += '\t\t"database": "database_test",\n';
	test_options += '\t\t"username": "username",\n';
	test_options += '\t\t"password": "password"';
	var production_options = '\t\t"host": "localhost",\n';
	production_options += '\t\t"database": "database_production",\n';
	production_options += '\t\t"username": "username",\n';
	production_options += '\t\t"password": "password"';
	if (database == 'sqlite') {
		development_options = '\t\t"storage": "db/development.sqlite3"';
		test_options = '\t\t"storage": "db/test.sqlite3"';
		production_options = '\t\t"storage": "db/production.sqlite3"';
	}

	var file_templates = {
		'config/database.json': [
			{
				file_path: 'config/database.json',
				info_render: {
					dialect: database,
					development_options: development_options,
					test_options: test_options,
					production_options: production_options
				}
			}
		]
	}

	//--- Edit package.json ---//
	var package_file = root_app + "/package.json";
	var package_file_content = fs.readFileSync(package_file).toString();
	if (package_file_content.indexOf('sequelize') < 0) {
		package_file_content = package_file_content.replace('"dependencies": {', '"dependencies": {\n\t\t"sequelize": "*",');
	}

	for (var i in npm_module) {
		var npm = npm_module[i];
		if (package_file_content.indexOf(npm) < 0) {
			package_file_content = package_file_content.replace('"dependencies": {', '"dependencies": {\n\t\t"'+npm+'": "*",');
		}
	}

	fs.writeFileSync(package_file, package_file_content);
	//--- Edit package.json ---//

	var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../');
	var path_templ = lib + 'template/database';

	train_generate(path_templ, null, file_templates);
}
