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


var Fiber = require('fibers');
var inflection = require('inflection');
var train_respond = require('./train.respond.js');
var train_errors_respond = require('./train.errors.respond.js');
var fs = require('fs');
var jtrain = require('./javascripts/jtrain.js');
var Router = require('barista').Router;

//var trainRoutes = new Array();
//trainRoutes['type'] = new Array();
//trainRoutes['controller_url'] = new Array();
//trainRoutes['index'] = new Array();
//trainRoutes['new'] = new Array();
//trainRoutes['edit'] = new Array();
//trainRoutes['show'] = new Array();
//trainRoutes['create'] = new Array();
//trainRoutes['update'] = new Array();
//trainRoutes['destroy'] = new Array();
//trainRoutes['train_root'] = "public";

//resources = function (rsrc) {
//	var singular = inflection.singularize(rsrc);
//	trainRoutes['type'][rsrc] = "REST";
//	trainRoutes['controller_url'][rsrc] = ROOT_APP + '/app/controllers/' + rsrc + '_controller.ls';
//	// index action
//	trainRoutes['index'][rsrc] = 'index';
//	global[rsrc + '_path'] = '/' + rsrc;
//	global[rsrc + '_url'] = global[rsrc + '_path'];
//	// create action
//	trainRoutes['create'][rsrc] = 'create';
//	// new action
//	trainRoutes['new'][rsrc] = 'new';
//	global['new_' + singular + '_path'] = '/' + rsrc + '/new';
//	// edit action
//	trainRoutes['edit'][rsrc] = 'edit';
//	global['edit_' + singular + '_path'] = function (obj) {
//		return "/" + rsrc + "/" + obj.id + "/edit";
//	}
//	// show action
//	trainRoutes['show'][rsrc] = 'show';
//	global[singular + '_path'] = function (obj) {
//		if (obj.id)
//			return "/" + rsrc + "/" + obj.id;
//		else
//			return "/" + rsrc;
//	}
//	// update action
//	trainRoutes['update'][rsrc] = 'update';
//	// destroy action
//	trainRoutes['destroy'][rsrc] = 'destroy';
//}

//get = function (link) {
//	var controller = link.split('/')[0];
//	var action = link.split('/')[1];
//
//	if (!trainRoutes['controller_url'][controller])
//		trainRoutes['controller_url'][controller] = ROOT_APP + '/app/controllers/' + controller + '_controller.ls';
//
//	if (!trainRoutes[action])
//		trainRoutes[action] = new Array();
//	trainRoutes[action][controller] = action;
//}

App.respond_to = function (options) {
	options.respond_to = true;
	return options;
}

App.render = function (options) {
	options.render = true;
	return options;
}

//exports.routes = function () {
//	return trainRoutes;
//}

exports.router = function () {
    var router = new Router;
    if (!Application.routing.root) {
        router.get("/").to('app.public');
    }
    for (var route in Application.routing) {
        if (route == "resources") {
            Application.routing[route].forEach(function(resource) {                
                router.resource(resource);

                var singular = inflection.singularize(resource);
                // index action
                global[resource + '_path'] = '/' + resource;
                global[resource + '_url'] = global[resource + '_path'];
                // new action
                global['new_' + singular + '_path'] = '/' + resource + '/add';
                // edit action
                global['edit_' + singular + '_path'] = function (obj) {
                    return "/" + resource + "/" + obj.id + "/edit";
                }
                // show action
                global[singular + '_path'] = function (obj) {
                    if (obj.id)
                        return "/" + resource + "/" + obj.id;
                    else
                        return "/" + resource;
                }
            });
        }
    }
    return router;
}

exports.routing = function (req, res, router_params, req_parser) {
    var controller_path = ROOT_APP + '/app/controllers/' + router_params.controller + '_controller.ls';
    if (fs.existsSync(controller_path)) {
        require(controller_path);
        var controllerName = jtrain.toControllerClass(router_params.controller);
        var controllerClass = App[controllerName];
        
        Fiber(function() {
            var controllerObj = new controllerClass;
            var params = {};
            if (req.body)
                params.data = req.body;
            if (router_params.id)
                params.id = router_params.id;
            try {
                var ret = controllerObj[router_params.action](params);
                if (typeof ret !== "undefined" && ret.respond_to) {
                    var format = ret;
                    if (req_parser.content_type == 'text/html' || req_parser.content_type == 'application/x-www-form-urlencoded'
                        && typeof format.format_html !== 'undefined') {
                        var options = format.format_html;
                        train_respond.format_html(options, req, res, router_params);
                    } else if (req_parser.content_type == 'application/json'
                               && typeof format.format_json !== 'undefined') {
                        var options = format.format_json;
                        train_respond.format_json(options, req_parser, res);
                    }
                } else if (typeof ret !== "undefined" && ret.render) {
                    var options = ret;
                    if (typeof options.json !== 'undefined') {
                        train_respond.format_json(options, req_parser, res);
                    } else {
                        train_respond.format_html(options, req, res, router_params);
                    }
                } else {
                    var template_path = ROOT_APP + '/app/views/' + req_parser.controller;
                    template_path += '/' + router_params.action + '.ejs';
                    train_respond.response_assets(res, req_parser, template_path);
                }
            } catch(error) {
                var options = {
                    info: error.toString(),
                    controller: controllerName,
                    action: router_params.action,
                    url_path: req.url,
                    method: router_params.method
                }
                train_errors_respond ("model_undefined", res, options);
            }
        }).run();
        
    } else {
        var options = {
            controller: jtrain.toTitleCase(router_params.controller),
            url_path: req.url,
            method: router_params.method
        };
        train_errors_respond ("controller_not_found", res, options);
    }
    
//	var action_key = req_parser.action_key;
//	var rsrc = req_parser.controller;
//	var urlcontrollers = trainRoutes['controller_url'][rsrc];
//	if (typeof urlcontrollers === "undefined") {
//		train_errors_respond ("config_error", req_parser, res);
//	} else {
//		if (fs.existsSync(urlcontrollers)) {
//			require(urlcontrollers);
//			var controllerName = jtrain.toControllerClass(rsrc);
//			var controllerClass = App[controllerName];
//			var action = trainRoutes[action_key][rsrc];
//			req_parser['action'] = action;
//
//			var params = {};
//			if (typeof req_parser['data'] !== "undefined") {
//				params['data'] = {};
//				if (req_parser.content_type == 'text/html') {
//					for (var k in req_parser['data']) {
//						var matches = k.match(/\[(.*?)\]/);
//						if (matches) {
//							var submatch = matches[1];
//							params['data'][submatch] = req_parser['data'][k];
//						}
//					}
//				} else {
//					for (var k in req_parser['data']) {
//						params['data'] = req_parser['data'][k];
//					}
//				}
//			}
//			if (typeof req_parser['id'] !== "undefined")
//				params['id'] = req_parser['id'];
//			controllerClass.prototype.params = params;
//
//			Fiber(function() {
//				var controllerObj = new controllerClass;
//				try {
//					var ret = controllerObj[action]();
//					if (typeof ret !== "undefined" && ret.respond_to) {
//						var format = ret;
//						if (req_parser.content_type == 'text/html' && typeof format.format_html !== 'undefined') {
//							var options = format.format_html;
//							train_respond.format_html(options, req_parser, res);
//						} else if (req_parser.content_type == 'application/json'
//									&& typeof format.format_json !== 'undefined') {
//							var options = format.format_json;
//							train_respond.format_json(options, req_parser, res);
//						}
//					} else if (typeof ret !== "undefined" && ret.render) {
//						var options = ret;
//						if (typeof options.json !== 'undefined') {
//							train_respond.format_json(options, req_parser, res);
//						} else {
//							train_respond.format_html(options, req_parser, res);
//						}
//					} else {
//						var template_path = ROOT_APP + '/app/views/' + req_parser.controller;
//						template_path += '/' + action + '.ejs';
//						train_respond.response_assets(res, req_parser, template_path);
//					}
//				} catch(error) {
//					var options = {info: error.toString(), controller: controllerName, action: action}
//					train_errors_respond ("model_undefined", req_parser, res, options);
//				}
//			}).run();
//		} else {
//			var options = { controller: jtrain.toTitleCase(rsrc) };
//			train_errors_respond ("controller_not_found", req_parser, res, options);
//		}
//	}
}
