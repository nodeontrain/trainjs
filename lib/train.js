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
train_root_app = process.cwd(); // Application root path


/**
 * Load helper
 */
require('./train.helper.js');


/**
 * Routes
 */
require('./train.action.controller.js');
require('./train.application.js');
Application = require(train_root_app + '/config/application.ls');
require('./train.routes.js');
require(train_root_app + '/config/routes.ls');


/**
 * Get database engine
 */
if (fs.existsSync(train_root_app + '/config/database.ls') &&
	fs.existsSync(train_root_app + '/app/models')) {
	traindbconfig = require(train_root_app + '/config/database.ls');
	var trainhelperDB = './object_mapper/' + traindbconfig.development.adapter;
	filesnameModels = fs.readdirSync(train_root_app + '/app/models');
	for	(var i = 0; i < filesnameModels.length; i++) {
		require(train_root_app + '/app/models/' + filesnameModels[i]);
	}
	require(trainhelperDB + '/train.model.js');
} else {
	console.log('Connection model not established');
}


/**
 * Create Server
 */
require(train_root_app + '/app/controllers/application_controller.ls');

var response_assets = function (res, path, type) {
	fs.readFile(path, function(err, data) {
		res.writeHead(200, {'Content-Type': type});
		res.end(data);
	});
}

module.exports.newServer = function (req, res) {
//	var url_parts = url.parse(req.url, true);
//	var url_pathname = url_parts.pathname;
//	var query = url_parts.query;
	HOST_NAME = req.headers.host
	jroad.req_parser(req, function (req_parser) {
		if (req_parser.url_path == '/jtrain_ujs.js') {
			var jtrain_path = __dirname + '/javascripts/jtrain_ujs.js';
			response_assets(res, jtrain_path, 'text/javascript');
		} else if (req_parser.data_type == "asset") {
			var asset_path = jroad.asset_path(req_parser, train_root_app);
			response_assets(res, asset_path, req_parser.content_type);
		} else if (req_parser.data_type == "favicon") {
			var favicon_path = jroad.favicon(train_root_app);
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
