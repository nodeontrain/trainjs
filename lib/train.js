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
 * Global variables
 */
App = module.exports;
ROOT_APP = process.cwd(); // Application root path


/**
 * Node Modules
 */
var fs = require('fs');
var jroad = require('jroad');
var train_parser = require('./train.parser.js');
var train_errors_respond = require('./train.errors.respond.js');
var train_respond = require('./train.respond.js');


/**
 * Load javascript functions
 */
require('./javascripts/jtrain.js');


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
require(ROOT_APP + '/config/routes.ls');
var train_routes = require('./train.routes.js');
var router = train_routes.router();


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
module.exports.newServer = function (req, res) {
    HOST_NAME = req.headers.host;
    var req_parser = jroad.req_parser(req);

    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        req.method = req.body._method.toUpperCase();
    }

    var params = router.first(req.url, req.method)
    if (params) {
        if (params.controller == "app" && params.action == "public") {
            var path_index = ROOT_APP + '/public/index.html';
            train_respond.response_assets(res, req_parser, path_index);
        } else {
            train_routes.routing(req, res, params, req_parser);
        }
    } else {
        if (req_parser.url_path) {
            var p = req_parser.url_path.split('/');
            var f = p[p.length - 1];
        }
        
        if (f && f == 'jtrain_ujs.js') {
            var jtrain_path = __dirname + '/javascripts/jtrain_ujs.js';
            train_respond.response_assets(res, req_parser, jtrain_path);
        } else if (req_parser.asset_type) {
            var asset_path = jroad.asset_path(req_parser, ROOT_APP);
            train_respond.response_assets(res, req_parser, asset_path);
        } else {
            res.end("404");
        }
    }

}
