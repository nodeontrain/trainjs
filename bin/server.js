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
var trainjs = require('trainjs');
var http = require('http');
var url = require('url');
var exec = require('child_process').exec;
var Fiber = require('fibers');
var path = require('path');

var pre_run_path = ROOT_APP + '/config/pre_run.js';
var pre_run = fs.existsSync( pre_run_path );

var app_config = require( ROOT_APP + '/config/application.js' );
var ApplicationController = require( ROOT_APP + '/app/controllers/application_controller.js' );

var app = require( ROOT_APP + '/app.js' );

function runServer() {
	app.use(function (req, res, next) {
		Fiber(function() {
			var url_parts = url.parse(req.url, true);
			req.query = url_parts.query;

			if ( app_config.cors ) {
				res.setHeader("Access-Control-Allow-Origin", "*");
				res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
				res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
			}

			res.setHeader("Content-Type", "application/json");
			next();
		}).run();
	});

	var application = new ApplicationController();
	app.use(function (req, res, next) {
		var assets = ['image/', 'text/html', 'application/javascript', 'text/css', 'application/font'];
		var content_type = 'text/plain';

		if (req.headers.accept) {
			var headers_accept = req.headers.accept.split(',');
			content_type = headers_accept[0];

			for (var i in headers_accept) {
				if ( headers_accept[i].indexOf('text/plain') > -1 ) {
					content_type = 'text/html';
				}
			}

			if (req.headers['content-type'])
				content_type = req.headers['content-type'];

			if (content_type == '*/*' && /\.js$/.test(req.url)) {
				content_type = 'application/javascript';
			}

			if (content_type == 'image/webp' && /\.png$/.test(req.url)) {
				content_type = 'image/png';
			}
		}

		var url_path = req.url.split('?')[0];

		var is_asset = false;
		for (var k in assets) {
			if ( content_type.indexOf(assets[k]) > -1 ) {
				is_asset = true;
				break;
			}
		}

		if ( url_path.indexOf('/node_modules/') > -1 && url_path.indexOf('../') < 0 ) {
			url_path = '..' + url_path;
		}

		var file_path = path.join(ROOT_APP, '/public', url_path);

		if (is_asset && url_path != '/' && fs.existsSync(file_path)) {
			fs.readFile(file_path, function(err, page) {
				res.writeHead(200, {'Content-Type': content_type});
				res.write(page);
				res.end();
			});
		} else {
			next();
		}
	});
	app.use(application.before);
	app.use(trainjs.newServer);

	var port = process.env.PORT || process.argv[2];

	http.createServer(app).listen(port);
	console.log('=> Server running at http://0.0.0.0:' + port + '\n=> Ctrl-C to shutdown server');
}

if ( pre_run ) {
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

