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


/**
 * Node Modules
 */
var fs = require('fs');
var jroad = require('jroad');
var train_parser = require('./train.parser.js');


/**
 * Load javascript functions
 */
require('./javascripts/jtrain.js');


/**
 * Global variables
 */
App = module.exports;
ROOT_APP = process.cwd(); // Application root path


/**
 * Load helper
 */
require('./train.helper.js');


/**
 * Routes
 */
require('./train.action.controller.js');
require('./train.application.js');
Application = require(ROOT_APP + '/config/application.ls');
require('./train.routes.js');
require(ROOT_APP + '/config/routes.ls');


/**
 * Get database engine
 */
if (fs.existsSync(ROOT_APP + '/config/database.ls') &&
	fs.existsSync(ROOT_APP + '/app/models')) {
	var dbconfig = require(ROOT_APP + '/config/database.ls');
	var trainhelperDB = './object_mapper/' + dbconfig.development.adapter;
	var train_model = require(trainhelperDB + '/train.model.js');
	train_model(dbconfig.development);
} else {
	console.log('Connection model not established');
}


/**
 * Create Server
 */
require(ROOT_APP + '/app/controllers/application_controller.ls');

var response_assets = function (res, path, type) {
	fs.readFile(path, function(err, data) {
		res.writeHead(200, {'Content-Type': type});
		res.end(data);
	});
}

module.exports.newServer = function (req, res) {
	HOST_NAME = req.headers.host
	jroad.req_parser(req, function (req_parser) {
		if (req_parser.url_path) {
			var p = req_parser.url_path.split('/');
			var f = p[p.length - 1];
		}

		if (f && f == 'jtrain_ujs.js') {
			var jtrain_path = __dirname + '/javascripts/jtrain_ujs.js';
			response_assets(res, jtrain_path, 'text/javascript');
		} else if (req_parser.data_type == "asset") {
			var asset_path = jroad.asset_path(req_parser, ROOT_APP);
			response_assets(res, asset_path, req_parser.content_type);
		} else if (req_parser.data_type == "favicon") {
			var favicon_path = jroad.favicon(ROOT_APP);
			response_assets(res, favicon_path, req_parser.content_type);
		} else if (req_parser.data_type == "view") {
			req_parser = train_parser(req_parser);
			if (req.url.substr(-1) == "/")
				req_parser['train_notice'] = "yes";
			if (typeof req_parser.root_path !== "undefined")
				response_assets(res, req_parser.root_path, req_parser.content_type);
			else
				routesFunc(res, req_parser);
		}
	});
}
