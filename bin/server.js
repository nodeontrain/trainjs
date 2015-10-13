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


var connect = require('connect');
var fs = require('fs');
var trainjs = require('trainjs');
var bodyParser = require('body-parser');
var http = require('http');
var url = require('url');
var exec = require('child_process').exec;
var Fiber = require('fibers');

var pre_run_path = ROOT_APP + '/config/pre_run.js';
var pre_run = fs.existsSync( pre_run_path );

var app = connect();

function runServer() {
	app.use(bodyParser.json({limit: '50mb'}));
	app.use(function (req, res, next) {
		Fiber(function() {
			var url_parts = url.parse(req.url, true);
			req.query = url_parts.query;
			next();
		}).run();
	});
	app.use(trainjs.newServer);

	http.createServer(app).listen(process.argv[2], '127.0.0.1');
	console.log('=> Server running at http://0.0.0.0:' + process.argv[2] + '\n=> Ctrl-C to shutdown server');
}

if ( pre_run_path ) {
	var cmd = require( pre_run_path );
	console.log('=> Run config/pre_run.js');
	exec(cmd, function (error, stdout, stderr) {
		if (error) console.log(error);
		else {
			PRE_RUN_STDOUT = stdout;
			runServer();
		}
	});
} else {
	runServer();
}

