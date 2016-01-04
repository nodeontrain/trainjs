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
var colors = require('colors');
var diff = require('diff');
var listFiles = require('../lib/helpers/list_files.js');
var readline = require('readline');
var root_app = process.cwd();

var params, path_templ, lines, src_content, outStr;
var count = 0;
var file_order = 0;
var template_order = 0;
var question = false;
var overwrite_all = false;

function create_file (src, des, file_path, message) {
	var write_result = fs.writeFileSync(des, src_content);
	if (typeof write_result == 'undefined')
		console.log(message + file_path);
	else
		console.log(write_result);
}

function generate_scaffold () {
	for (var i = file_order; i < lines.length; i++) {
		question = false;
		count++;
		var line = lines[i].split(" " + path_templ + "/");
		var src = path_templ + "/" + line[1];

		if (line[0] == "d") {
			if (dir_templates[line[1]]) {
				for (var t = 0; t < dir_templates[line[1]].length; t++) {
					var dir_path = dir_templates[line[1]][t]['dir_path'];
					var des = root_app + "/" + dir_path;
					if (!fs.existsSync(des)) {
						fs.mkdirSync(des);
						console.log('      create  '.bold.green + line[1]);
					}
				}
			} else {
				var des = root_app + "/" + line[1];
				if (!fs.existsSync(des)) {
					fs.mkdirSync(des);
					console.log('      create  '.bold.green + line[1]);
				}
			}
		} else {
			if (file_templates[line[1]]) {
				for (var t = template_order; t < file_templates[line[1]].length; t++) {
					var info_render = file_templates[line[1]][t]['info_render'];
					var file_path = file_templates[line[1]][t]['file_path'];
					var des = root_app + "/" + file_path;
					src_content = fs.readFileSync(src).toString();
					for (var k in info_render) {
						var reg = new RegExp("%%" + k + "%%", "g");
						src_content = src_content.replace(reg, info_render[k]);
					}

					if (fs.existsSync(des)) {
						var des_content = fs.readFileSync(des).toString();
						if (src_content == des_content) {
							console.log('   identical  '.bold.blue + file_path);
						} else if (src_content != des_content && overwrite_all == true) {
							console.log('    conflict  '.bold.red + file_path)
							var message = '       force  '.bold.yellow;
							create_file(src, des, file_path, message);
						} else if (src_content != des_content && overwrite_all == false) {
							if (t == file_templates[line[1]].length - 1) {
								file_order = i + 1;
								template_order = 0;
							} else {
								file_order = i;
								template_order = t + 1;
							}
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
				if (question) break;
			} else {
				var file_path = line[1];
				var des = root_app + "/" + file_path;
				src_content = fs.readFileSync(src).toString();

				if (fs.existsSync(des)) {
					var des_content = fs.readFileSync(des).toString();
					if (src_content == des_content) {
						console.log('   identical  '.bold.blue + file_path);
					} else if (src_content != des_content && overwrite_all == true) {
						console.log('    conflict  '.bold.red + file_path)
						var message = '       force  '.bold.yellow;
						create_file(src, des, file_path, message);
					} else if (src_content != des_content && overwrite_all == false) {
						file_order = i + 1;
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
		var line = lines[file_order - 1].split(" " + path_templ + "/");
		var src = path_templ + "/" + line[1];
		if (file_templates[line[1]]) {
			var file_path = file_templates[line[1]][template_order]['file_path'];
		} else {
			var file_path = line[1];
		}
		var des = root_app + "/" + file_path;

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
module.exports = function(path, dir_templs, file_templs) {
	path_templ = path;
	dir_templates = dir_templs;
	file_templates = file_templs;
	lines = listFiles(path_templ);
	generate_scaffold();
}
