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

module.exports = function (error_type, req_parser, res, options) {
	var info_render = {};
	var file_name = "";
	var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../');
	var path_templ = lib + 'template/errors/';
	if (error_type == "routes") {
		info_render.info = 'No route matches ['+req_parser.method+'] &quot;'+req_parser.url_path+'&quot;';
		file_name = "routing_error.html";
	} else if (error_type == "controller_not_found") {
		info_render.info = 'uninitialized constant '+options.controller+'Controller';
		file_name = "routing_error.html";
	} else if (error_type == "model_undefined") {
		info_render.info = options.info;
		info_render.controller = options.controller;
		info_render.action = options.action;
		file_name = "name_error.html";
	}

	var content = fs.readFileSync(path_templ + file_name).toString();
	for (var k in info_render) {
		var reg = new RegExp("%%" + k + "%%", "g");		
		content = content.replace(reg, info_render[k]);
	}
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end(content);
}
