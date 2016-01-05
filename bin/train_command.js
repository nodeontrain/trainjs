#!/usr/bin/env node

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


var path = require('path');
var fs = require('fs');
var child_process = require('child_process');
var Fiber = require('fibers');

TRAINJS_LIB_PATH = path.join(path.dirname(fs.realpathSync(__filename)), '../');
var info_param = {};

// Check trainjs, nodejs, livescript version
function checkinfo () {
	info_param.trainjs_version = require(TRAINJS_LIB_PATH + 'package.json').version;
	info_param.node_version = process.version.substr(1);
}

function isNormalInteger(str) {
	var n = ~~Number(str);
	return String(n) === str && n >= 0;
}

Fiber(function() {
	checkinfo();
	if (process.argv[2] == "server" || process.argv[2] == "s") {
		var port = '1337';
		var port_param_index = process.argv.indexOf("-p");
		if ( port_param_index > -1 && process.argv[ port_param_index + 1 ] && isNormalInteger( process.argv[ port_param_index + 1 ] ) ) {
			port = process.argv[ port_param_index + 1 ];
		}
		require('./train_server.js')(port);
	} else if (process.argv[2] == "new") {
		require('./train_new.js')(info_param);
	} else if (process.argv[2] == "-h" || process.argv[2] == "--help") {
		fs.readFile(path.dirname(fs.realpathSync(__filename)) + '/train_help', function (err, data) {
			if (err) throw err;
			console.log(data.toString());
		});
	} else if (process.argv[2] == "-v" || process.argv[2] == "--version") {
		console.log("trainjs " + info_param.trainjs_version);
	} else if (process.argv[2] == "generate" || process.argv[2] == "g") {
		if (process.argv[3] == "scaffold")
			require('./train_generate_scaffold.js')();
		else if (process.argv[3] == "controller")
			require('./train_generate_controller.js')();
	}
}).run();
