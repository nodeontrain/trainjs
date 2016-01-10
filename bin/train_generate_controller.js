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
var root_app = process.cwd();
var stringHelper = require('../lib/helpers/string_helper.js');
var train_generate = require('./train_generate.js');

module.exports = function() {
	var controller_module = stringHelper.Underscore2CamelCaseWithOutTitleCase( process.argv[4] ) + "Controller";
	var controller_module_name = stringHelper.Underscore2CamelCaseWithTitleCase( process.argv[4] );
	var controller_name = stringHelper.CamelCase2Underscore( process.argv[4] );

	var controller_js = '';
	var controller_test_js = '';
	var action_templates = [];
	for (var i = 5; i < process.argv.length; i++) {
		var action = process.argv[i];
		var controller_action = controller_module_name + stringHelper.toTitleCase(action) + "Ctrl";

		controller_js += controller_module + '.controller(\n';
		controller_js += "\t'"+controller_action+"',\n";
		controller_js += "\t['$scope', function ($scope) {\n";
		controller_js += "\t}]\n";
		controller_js += ");\n";

		var state_url = controller_name + "/" + action.toLowerCase();
		controller_test_js += "\tit('should get "+action.toLowerCase()+"', function() {\n";
		controller_test_js += "\t\tvar current_url = 'http://localhost:1337/#/" + state_url + "';\n";
		controller_test_js += "\t\tbrowser.get(current_url);\n";
		controller_test_js += "\t\texpect(browser.getCurrentUrl()).toContain('#/" + state_url + "');\n";
		controller_test_js += "\t});\n";

		action_templates.push({
			file_path: 'public/partials/' + controller_name + '/' + action +'.html',
			info_render: {
				controller_module_name: controller_module_name,
				action: action,
				controller_name: controller_name
			}
		});

		//--- Edit public/app.js ---//
		var app_file = root_app + "/public/app.js";
		var app_file_content = fs.readFileSync(app_file).toString();
		if (app_file_content.indexOf(controller_module) < 0) {
			app_file_content = app_file_content.replace("'ui.router'", "'ui.router',\n\t'" + controller_module + "'");
		}
		if (app_file_content.indexOf('partials/'+controller_name+'/'+action+'.html') < 0) {
			var state_content = "\t.state('"+controller_name+"_"+action+"', {\n"
			state_content += "\t\turl: '/"+controller_name+"/"+action+"',\n"
			state_content += "\t\ttemplateUrl: 'partials/"+controller_name+"/"+action+".html',\n"
			state_content += "\t\tcontroller: '"+controller_action+"'\n"
			state_content += "\t})"
			app_file_content = app_file_content.replace('\t$stateProvider', '\t$stateProvider\n' + state_content);
		}

		fs.writeFileSync(app_file, app_file_content);
		//--- Edit public/app.js ---//
	}

	var dir_templates = {
		'public/partials/controller_name': [
			{ dir_path: 'public/partials/' + controller_name }
		]
	}

	var file_templates = {
		'public/controllers/controller.js': [
			{
				file_path: 'public/controllers/' + controller_name + '_controller.js',
				info_render: {
					controller_js: controller_js,
					controller_module: controller_module
				}
			}
		],
		'public/partials/controller_name/action.html': action_templates,
		'public/test/e2e_test/controllers/controller_test.js': [
			{
				file_path: 'public/test/e2e_test/controllers/' + controller_name + '_controller_test.js',
				info_render: {
					controller_test_js: controller_test_js,
					controller_module: controller_module
				}
			}
		],
	}

	//--- Edit public/index.html ---//
	var index_file = root_app + "/public/index.html";
	var index_file_content = fs.readFileSync(index_file).toString();
	if (index_file_content.indexOf('controllers/'+controller_name+'_controller.js') < 0) {
		index_file_content = index_file_content.replace('<script src="app.js"></script>', '<script src="controllers/'+controller_name+'_controller.js"></script>\n\t<script src="app.js"></script>');
	}
	fs.writeFileSync(index_file, index_file_content);
	//--- Edit public/index.html ---//


	var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../');
	var path_templ = lib + 'template/controller';

	train_generate(path_templ, dir_templates, file_templates);
}
