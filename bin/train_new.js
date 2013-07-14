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


var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');

var app_dirs = new Array();
app_dirs['app_root'] = 'README.md';
app_dirs['app/assets/javascripts'] = 'application.js';
app_dirs['app/assets/images'] = 'trainjs.png';
app_dirs['app/views/layouts'] = 'application.ejs';
app_dirs['app/controllers'] = 'application_controller.ls';
app_dirs['config'] = 'application.ls database.ls routes.ls';
app_dirs['public'] = 'index.html favicon.ico';

function jtrain_toTitleCase (str) {
    return str.replace(/\w\S*/g, function(txt) {
    	return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function copy_image(file_log, src_file, des_file) {
	var inStr = fs.createReadStream(src_file);
	var outStr = fs.createWriteStream(des_file);
	inStr.pipe(outStr);
	console.log('      create  ' + file_log);
}

function generate_file(info_render, file_log, src_file, des_file) {	
	fs.readFile(src_file, function (errRead, data) {
		if (errRead) throw errRead;

		data = data.toString();
		for(var k in info_render) {
			var reg = new RegExp("%%" + k + "%%", "g");		
			data = data.replace(reg, info_render[k]);
		}

		fs.writeFile(des_file, data, function (errWrite) {
			if (errWrite) throw errWrite;
			console.log('      create  ' + file_log);
		});
	});
}

function generate_dirs(params, path_templ, path_des) {
	var src = path_templ;
	var des = './' + params.app_name;
	if(path_des != 'app_root') {
		des = des + '/' + path_des;
		src = src + path_des;
	}

	if(typeof app_dirs[path_des] != 'undefined')
		var files = app_dirs[path_des].split(" ");

	var info_render = {};

	mkdirp(des, function (err) {
		if (err) console.error(err)
		else {
			if(typeof files != 'undefined') {
				for (var i = 0; i < files.length; i++) {
					var des_file = des + '/' + files[i];
					var src_file = src + '/' + files[i];
					if(path_des == 'app_root')
						var file_log = files[i];
					else
						var file_log = path_des + '/' + files[i];
					if(files[i] == 'trainjs.png' || files[i] == 'favicon.ico') {
						copy_image(file_log, src_file, des_file);
					} else {
						if(files[i] == 'application.ejs')
							info_render.title = jtrain_toTitleCase(params.app_name);
						else if(files[i] == 'database.ls')
							info_render.db_name = params.app_name.toLowerCase();
						else if(files[i] == 'index.html')
							info_render = params;

						generate_file(info_render, file_log, src_file, des_file);
					}
				}
			}
		}
	});
}

module.exports = function(params) {
	params.app_name = process.argv[3];
	var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../');
	var path_templ = lib + 'template/';
	
	generate_dirs(params, path_templ, 'app_root');
	generate_dirs(params, path_templ, 'app/assets/images');
	generate_dirs(params, path_templ, 'app/assets/javascripts');
	generate_dirs(params, path_templ, 'app/views/layouts');
	generate_dirs(params, path_templ, 'app/models');
	generate_dirs(params, path_templ, 'app/controllers');
	generate_dirs(params, path_templ, 'config');
	generate_dirs(params, path_templ, 'public');
}
