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


var Fiber = require('fibers');
var fs = require('fs');

javascript_include_tag = function(filename) {
	if (filename == "application") {
		var filepath = train_root_app + '/app/assets/javascripts/application.js';
		var input = fs.createReadStream(filepath);
		var remaining = '';
		var html = "";
		var fiber = Fiber.current;
		input.on('data', function(data) {
			remaining += data;
			var index = remaining.indexOf('\n');
			while (index > -1) {
				var line = remaining.substring(0, index);
				var require_str = jtrain_trim(line.substring(3));
				var str_arr = require_str.split(" ");
				if(str_arr[0] == "require")
					html = html + '<script src="' + str_arr[1] + '.js"></script>' + '\n';
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
