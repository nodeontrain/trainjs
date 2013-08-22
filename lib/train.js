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
	var urlarr = req.url.split('/');
	var len = urlarr.length;
	if (urlarr[urlarr.length - 1] == "")
		len = len - 1;
	jroad.req_parser(req, function (req_parser) {
		if (req.url == '/jtrain_ujs.js') {
			var jtrain_path = __dirname + '/javascripts/jtrain_ujs.js';
			response_assets(res, jtrain_path, 'text/javascript');
		} else if (req_parser.data_type == "asset") {
			var asset_path = jroad.asset_path(req_parser, train_root_app);
			response_assets(res, asset_path, req_parser.content_type);
		} else if (req_parser.data_type == "favicon") {
			var favicon_path = jroad.favicon(train_root_app);
			response_assets(res, favicon_path, req_parser.content_type);
		} else if (req_parser.data_type == "view") {
			var controller_url = "";
			if (req_parser.controller == "root") {
				if (trainRoutes_root == "public")
					var path_index = train_root_app + '/public/index.html';
				response_assets(res, path_index, req_parser.content_type);
			} else if (req_parser.method == "POST") {
				for(var k = 0; k < len; k++)
					controller_url = controller_url + "_" + urlarr[k];
				controller_url = controller_url.substr(2);
				if (trainRoutes['create'][controller_url]) {
					//URL: hostname/controllers or hostname/controllers.json controllers#create
					req_parser['controller'] = urlarr[len - 1];
					req_parser.controller_url = controller_url;
					routesFunc(res, 'create', req_parser);
				} else {
					//URL: hostname/controllers/:id or hostname/controllers/:id.json controllers#update
					req_parser.method = "PUT";
					controller_url = "";
					for(var k = 0; k < len - 1; k++)
						controller_url = controller_url + "_" + urlarr[k];
					controller_url = controller_url.substr(2);
					req_parser.controller_url = controller_url;
					req_parser['id'] = urlarr[len - 1];
					req_parser['controller'] = urlarr[len - 2];
					routesFunc(res, 'update', req_parser);
				}
			} else if (req_parser.method == "PUT") {
				//URL: hostname/controllers/:id or hostname/controllers/:id.json controllers#update
				for(var k = 0; k < len - 1; k++)
					controller_url = controller_url + "_" + urlarr[k];
				controller_url = controller_url.substr(2);
				req_parser.controller_url = controller_url;
				req_parser['id'] = urlarr[len - 1];
				req_parser['controller'] = urlarr[len - 2];
				routesFunc(res, 'update', req_parser);
			} else if (req_parser.method == "DELETE") {
				//URL: hostname/controllers/:id or hostname/controllers/:id.json controllers#destroy
				for(var k = 0; k < len - 1; k++)
					controller_url = controller_url + "_" + urlarr[k];
				controller_url = controller_url.substr(2);
				req_parser.controller_url = controller_url;
				req_parser['id'] = urlarr[len - 1];
				req_parser['controller'] = urlarr[len - 2];
				routesFunc(res, 'destroy', req_parser);
			} else if (req_parser.method == "GET") {
				if (urlarr[len - 1] == "new") {
					//URL: hostname/controllers/new controllers#new
					for(var k = 0; k < len - 1; k++)
						controller_url = controller_url + "_" + urlarr[k];
					controller_url = controller_url.substr(2);
					req_parser.controller_url = controller_url;
					req_parser['controller'] = urlarr[len - 2];
					routesFunc(res, 'new', req_parser);
				} else if (urlarr[len - 1] == "edit") {
					//URL: hostname/controllers/:id/edit controllers#edit
					req_parser['controller'] = urlarr[len - 3];
					req_parser['id'] = urlarr[len - 2];
					for(var k = 0; k < len - 2; k++)
						controller_url = controller_url + "_" + urlarr[k];
					controller_url = controller_url.substr(2);
					req_parser.controller_url = controller_url;
					routesFunc(res, 'edit', req_parser);
				} else {
					var parts = urlarr[len - 1].split('.');
					for(var k = 0; k < len - 1; k++)
						controller_url = controller_url + "_" + urlarr[k];
					controller_url = controller_url.substr(2);
					if (trainRoutes['index'][controller_url + parts[0]]) {
						//URL: hostname/controllers or hostname/controllers.json controllers#index
						req_parser['controller'] = parts[0];
						req_parser.controller_url = controller_url + parts[0];
						routesFunc(res, 'index', req_parser);
					} else {
						//URL: hostname/controllers/:id or hostname/controllers/:id.json controllers#show
						req_parser['id'] = parts[0];
						req_parser['controller'] = urlarr[len - 2];
						req_parser.controller_url = controller_url;
						routesFunc(res, 'show', req_parser);
					}
				}
			}
		}
	});
}
