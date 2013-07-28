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


var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

module.exports = function (port) {
	var path_server_ls = path.dirname(fs.realpathSync(__filename)) + '/server.ls';
	var lsc = spawn('lsc', [path_server_ls, port]);

	lsc.stdout.on('data', function (data) {
		var outdata = "";
		outdata += data;
		console.log(outdata);
	});

	lsc.stderr.on('data', function (data) {
		var errdata = "";
		errdata += data;
		console.log(errdata);
	});

	lsc.on('exit', function (code) {
		console.log(code);
	});
}
