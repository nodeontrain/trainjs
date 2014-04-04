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
var colors = require('colors');
var diff = require('diff');
var jroad = require('jroad');
var readline = require('readline');
var child_process = require('child_process');
var inflection = require('inflection');
var root_app = process.cwd();
var moment = require(root_app + '/node_modules/sequelize/node_modules/moment');

var params, path_templ, lines, src_content, outStr;
var model, model_name, controller_name, model_plural, migration_file_name;
var model_attrs = "";
var migration_attrs = "";
var form_html = "";
var index_th_html = "";
var index_td_html = "";
var show_html = "";
var count = 0;
var order = 0;
var question = false;
var overwrite_all = false;

function jtrain_toTitleCase (str) {
    return str.replace(/\w\S*/g, function(txt) {
    	return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function create_file (src, des, file_path, message) {
	var write_result = fs.writeFileSync(des, src_content);
	if (typeof write_result == 'undefined')
		console.log(message + file_path);
	else
		console.log(write_result);
}

function check_file (line) {
	var line_arr = line.split('/');
	if (line_arr[2] && line_arr[2] == "controller.ls") {
		return line_arr[0] + '/' + line_arr[1] + '/' + model_plural + '_' + line_arr[2];
	} else if (line_arr[2] && line_arr[2] == "models") {
		if (line_arr[3])
			return line_arr[0] + '/' + line_arr[1] + '/' + model_plural + '/' + line_arr[3];
		else
			return line_arr[0] + '/' + line_arr[1] + '/' + model_plural;
	} else if (line_arr[2] && line_arr[2] == "model.ls") {
		return line_arr[0] + '/' + line_arr[1] + '/' + model + '.ls';
	} else if (line_arr[2] && line_arr[2] == "migration.js") {
		return line_arr[0] + '/' + line_arr[1] + '/' + migration_file_name + '.js';
	} else {
		return line;
	}
}

function generate_scaffold () {
	for (var i = order; i < lines.length; i++) {
		count++;
		var line = lines[i].split(" " + path_templ + "/");
		var file_path = check_file(line[1]);

		var des = root_app + "/" + file_path;
		var src = path_templ + "/" + line[1];
		if (line[0] == "d") {
			if (!fs.existsSync(des)) {
				fs.mkdirSync(des);
				console.log('      create  '.bold.green + file_path);
			}
		} else {				
			var info_render = {};
			if (line[1] == 'app/controllers/controller.ls') {
				info_render.controller_name = controller_name;
				info_render.model_plural = model_plural;
				info_render.model_name = model_name;
				info_render.model = model;
			} else if (line[1] == 'app/models/model.ls') {
				info_render.model_name = model_name;
				info_render.model_attrs = model_attrs;
			} else if (line[1] == 'db/migrations/migration.js') {
				info_render.model_plural = model_plural;
				info_render.migration_attrs = migration_attrs;
			} else if (line[1] == 'app/views/models/edit.ejs' ||
						line[1] == 'app/views/models/new.ejs') {
				info_render.model = model;
				info_render.model_plural = model_plural;
			} else if (line[1] == 'app/views/models/form.ejs') {
				info_render.model = model;
				info_render.form_html = form_html;
			} else if (line[1] == 'app/views/models/index.ejs') {
				info_render.model = model;
				info_render.model_plural = model_plural;
				info_render.model_name = model_name;
				info_render.index_td_html = index_td_html;
				info_render.index_th_html = index_th_html;
			} else if (line[1] == 'app/views/models/show.ejs') {
				info_render.model = model;
				info_render.model_plural = model_plural;
				info_render.show_html = show_html;
			}
			
			src_content = fs.readFileSync(src).toString();
			for (var k in info_render) {
				var reg = new RegExp("%%" + k + "%%", "g");		
				src_content = src_content.replace(reg, info_render[k]);
			}

			if (fs.existsSync(des)) {
				question = false;
				var des_content = fs.readFileSync(des).toString();
				if (src_content == des_content) {
					console.log('   identical  '.bold.blue + file_path);
				} else if (src_content != des_content && overwrite_all == true) {
					console.log('    conflict  '.bold.red + file_path)
					var message = '       force  '.bold.yellow;
					create_file(src, des, file_path, message);
				} else if (src_content != des_content && overwrite_all == false) {
					order = i + 1;
					question = true;
					console.log('    conflict  '.bold.red + file_path)
					console.log('Overwrite '+ des +'? (enter "h" for help) [Ynaqdh]');
					break;
				}
			} else {
				var message = '      create  '.bold.green;
				create_file(src, des, file_path, message);
			}
		}
	}
	if (count == lines.length && question == false)
		rl.close();
}

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});
rl.on('line', function (key) {
	if (question) {
		var line = lines[order - 1].split(" " + path_templ + "/");
		var file_path = check_file(line[1]);
		var des = root_app + "/" + file_path;
		var src = path_templ + "/" + line[1];
		if (key == "h") {
			console.log('Y - yes, overwrite');
			console.log('n - no, do not overwrite');
			console.log('a - all, overwrite this and all others');
			console.log('q - quit, abort');
			console.log('d - diff, show the differences between the old and the new');
			console.log('h - help, show this help');
		} else if (key == "y" || key == "Y") {
			var message = '       force  '.bold.yellow;
			create_file(src, des, file_path, message);
			generate_scaffold();
			if (count == lines.length)
				rl.close();
		} else if (key == "n") {
			var message = '        skip  '.bold.yellow + file_path;
			console.log(message);
			generate_scaffold();
			if (count == lines.length)
				rl.close();
		} else if (key == "a") {
			overwrite_all = true;
			var message = '       force  '.bold.yellow;
			create_file(src, des, file_path, message);
			generate_scaffold();
			rl.close();
		} else if (key == "q") {
			console.log('Aborting...');
			rl.close();
		} else if (key == "d") {
			var des_content = fs.readFileSync(des).toString();
			var diff_result = diff.createPatch(des, des_content, src_content);
			console.log(diff_result);
			console.log('Overwrite '+ des +'? (enter "h" for help) [Ynaqdh]');
		}
	}
});

/**
* Read all files in template folder.
* Change content and then resave it.
*/
module.exports = function() {
	model_name = process.argv[4];
	model = model_name.toLowerCase();
	controller_name = inflection.pluralize(model_name);
	model_plural = inflection.pluralize(model);
	migration_file_name = moment().format('YYYYMMDDHHmmss') + '_create_' + model_plural;

	for (var i = 5; i < process.argv.length; i++) {
		var attr_str = process.argv[i].split(':');

		// model.ls
		model_attrs += '\t\t' + attr_str[0] + ': "' + attr_str[1] + '"\n';

		// form.ejs
		form_html += '\t<div class="field">\n';
		var attr_name = jtrain_toTitleCase(attr_str[0]);
		form_html += '\t\t<%- label_tag ("'+ model +'_'+ attr_str[0] +'", "'+ attr_name +'") %><br />\n';
		form_html += '\t\t<%- text_field_tag ("'+ model +'['+ attr_str[0] +']", '+ model +'.'+ attr_str[0] +') %>\n';
		form_html += '\t</div>\n';

		// index.ejs
		index_th_html += '\t\t<th>' + attr_name + '</th>\n'
		index_td_html += '\t\t<td><%= '+ model +'.'+ attr_str[0] +' %></td>\n';

		// show.ejs
		show_html += '<p>\n';
		show_html += '\t<b>'+ attr_name +':</b>\n';
		show_html += '\t<%= '+ model +'.'+ attr_str[0] +' %>\n';
		show_html += '</p>\n';

		// migration
		migration_attrs += "\t\t\t" + attr_str[0] + ": DataTypes." + attr_str[1].toUpperCase() + ",\n";
	}

	var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../');
	path_templ = lib + 'template/scaffold';
	
	var routes_file = root_app + "/config/routes.ls";
	var routes_content = fs.readFileSync(routes_file);
	routes_content += '\n\tresources "' + model_plural + '"';
	fs.writeFileSync(routes_file, routes_content);

	lines = jroad.list_files(path_templ);
	generate_scaffold();
}
