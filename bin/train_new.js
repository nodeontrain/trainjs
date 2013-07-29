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
var path = require('path');
var colors = require('colors');
var diff = require('diff');
var jroad = require('jroad');
var readline = require('readline');
var child_process = require('child_process');

var root_app, params, path_templ, lines, file_type, src_content, outStr;
var count = 0;
var order = 0;
var question = false;
var overwrite_all = false;

function jtrain_toTitleCase (str) {
    return str.replace(/\w\S*/g, function(txt) {
    	return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function create_file (src, des, file_name, message) {
	if (file_type == 'image') {
		var inStr = fs.createReadStream(src);
		var outStr = fs.createWriteStream(des);
		inStr.pipe(outStr);
		console.log(message + file_name);
//		console.log(outStr._writableState);
	} else {
		var write_result = fs.writeFileSync(des, src_content);
		if (typeof write_result == 'undefined')
			console.log(message + file_name);
		else
			console.log(write_result);
	}
}

function create_app () {
	for (var i = order; i < lines.length; i++) {
		count++;
		var line = lines[i].split(" " + path_templ + "/");
		var des = root_app + "/" + line[1];
		var src = path_templ + "/" + line[1];
		if (line[0] == "d") {
			if (fs.existsSync(des)) console.log('       exist  '.bold.blue + line[1]);
			else {
				fs.mkdirSync(des);
				console.log('      create  '.bold.green + line[1]);
			}
		} else {
			if (line[1] == 'app/assets/images/trainjs.png' ||
				line[1] == 'public/favicon.ico') {
				file_type = "image";
				var src_buff = fs.readFileSync(src);
				src_content = JSON.stringify(src_buff);
			} else {
				file_type = "text";
				var info_render = {};
				if(line[1] == 'app/views/layouts/application.ejs')
					info_render.title = jtrain_toTitleCase(params.app_name);
				else if(line[1] == 'config/database.ls')
					info_render.db_name = params.app_name.toLowerCase();
				else if(line[1] == 'public/index.html')
					info_render = params;
					
				src_content = fs.readFileSync(src).toString();
				for (var k in info_render) {
					var reg = new RegExp("%%" + k + "%%", "g");		
					src_content = src_content.replace(reg, info_render[k]);
				}
			}

			if (fs.existsSync(des)) {
				if (file_type == "text")
					var des_content = fs.readFileSync(des).toString();
				else {
					var des_buff = fs.readFileSync(des);
					var des_content = JSON.stringify(des_buff);
				}

				if (src_content == des_content) {
					console.log('   identical  '.bold.blue + line[1]);
				} else if (src_content != des_content && overwrite_all == true) {
					console.log('    conflict  '.bold.red + line[1])
					var message = '       force  '.bold.yellow;
					create_file(src, des, line[1], message);
				} else if (src_content != des_content && overwrite_all == false) {
					order = i + 1;
					question = true;
					console.log('    conflict  '.bold.red + line[1])
					console.log('Overwrite '+ des +'? (enter "h" for help) [Ynaqdh]');
					break;
				}
			} else {
				var message = '      create  '.bold.green;
				create_file(src, des, line[1], message);
			}
		}
	}
	if (count == lines.length) {
		rl.close();
		console.log('         run  '.bold.green + 'npm install');
		child_process.exec('cd '+ params.app_name +' && npm install',
			function (error, stdout, stderr) {
				console.log('' + stdout);
				console.log('' + stderr);
				if (error !== null) {
					console.log('' + error);
				}
			}
		);
	}
}

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});
rl.on('line', function (key) {
	if (question) {
		var line = lines[order - 1].split(" " + path_templ + "/");
		var file_name = line[1];
		var des = root_app + "/" + line[1];
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
			create_file(src, des, file_name, message);
			create_app(order);
		} else if (key == "n") {
			var message = '        skip  '.bold.yellow + file_name;
			console.log(message);
			create_app (order);
		} else if (key == "a") {
			overwrite_all = true;
			var message = '       force  '.bold.yellow;
			create_file(src, des, file_name, message);
			create_app(order);
			rl.close();
		} else if (key == "q") {
			console.log('Aborting...');
			rl.close();
		} else if (key == "d") {
			if (file_type == "text") {
				var des_content = fs.readFileSync(des).toString();
				var diff_result = diff.createPatch(des, des_content, src_content);
				console.log(diff_result);
			} else {
				console.log(des + ' is binary file');
			}
			console.log('Overwrite '+ des +'? (enter "h" for help) [Ynaqdh]');
		}
	}
});


module.exports = function(info_param) {
	params = info_param;
	params.app_name = process.argv[3];
	var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../');
	path_templ = lib + 'template';
	
	root_app = './' + params.app_name;
	if (fs.existsSync(root_app)) console.log('       exist  '.bold.blue);
	else {
		fs.mkdirSync(root_app);
		console.log('      create  '.bold.green);
	}

	lines = jroad.list_files(path_templ);
	create_app();
}
