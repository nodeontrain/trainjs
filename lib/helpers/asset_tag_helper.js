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


var Fiber = require('fibers');
var fs = require('fs');
var jtrain = require('../javascripts/jtrain.js');

/**
* Read line by line from a file.
* if '//=' exists in line, split a string to filter js file name
* and return <script> tag
*/
javascript_include_tag = function(filename) {
	if (filename == "application") {
		var filepath = ROOT_APP + '/app/assets/javascripts/application.js';
		var input = fs.createReadStream(filepath);
		var remaining = '';
		var html = "";
		var fiber = Fiber.current;
		input.on('data', function(data) {
			remaining += data;
			var index = remaining.indexOf('\n');
			while (index > -1) {
				var line = remaining.substring(0, index);
				if (line.split('//=')[1]) {
					var require_str = jtrain.trim(line.split('//=')[1]);
					var str_arr = require_str.split(" ");
					if(str_arr[0] == "require")
						html = html + '<script src="/assets/' + str_arr[1] + '.js"></script>' + '\n';
				}
				remaining = remaining.substring(index + 1);
				index = remaining.indexOf('\n');
			}
		});
		input.on('end', function() {
			fiber.run(html);
		});
		return Fiber.yield();
	}
}

/**
* Read line by line from a file.
* if '*=' exists in line, split a string to filter css file name
* and return <link> tag
*/
stylesheet_link_tag = function(filename, options) {
	var opt_str = "";
	if (typeof options !== "undefined") {
		for (var k in options) {
			opt_str = opt_str + " " + k + "=" + options[k];
		}
	}
	if (filename == "application") {
		var filepath = ROOT_APP + '/app/assets/stylesheets/application.css';
		var input = fs.createReadStream(filepath);
		var remaining = '';
		var html = "";
		var fiber = Fiber.current;
		input.on('data', function(data) {
			remaining += data;
			var index = remaining.indexOf('\n');
			while (index > -1) {
				var line = remaining.substring(0, index);
				if (line.split('*=')[1]) {
					var require_str = jtrain.trim(line.split('*=')[1]);
					if (require_str == "require_tree .") {
						css_files = fs.readdirSync(ROOT_APP + '/app/assets/stylesheets');
						for	(var i = 0; i < css_files.length; i++) {
							if (css_files[i] != "application.css")
								html += '<link href="/assets/' + css_files[i] + '" ' + opt_str + ' rel="stylesheet" />'
						}
					} else if (require_str == "require_self") {
						html += '<link href="/assets/application.css" ' + opt_str + ' rel="stylesheet" />'
					}
				}
				remaining = remaining.substring(index + 1);
				index = remaining.indexOf('\n');
			}
		});
		input.on('end', function() {
			fiber.run(html);
		});
		return Fiber.yield();
	}
}
