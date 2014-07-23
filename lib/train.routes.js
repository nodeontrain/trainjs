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

App.respond_to = function (options) {
	options.respond_to = true;
	return options;
}

App.render = function (options) {
	options.render = true;
	return options;
}

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

            if (req.body) {
                params.body = req.body;
                var model_name = inflection.singularize(router_params.controller);
                if (req.body[model_name]) {
                    params.data = req.body[model_name];
                }
            }

            if (router_params.id)
                params.id = router_params.id;

            try {
                var ret = controllerObj[router_params.action](params);
                if (typeof ret !== "undefined" && ret.respond_to) {
                    var format = ret;                    
                    if (req_parser.content_type.indexOf('text/html') || req_parser.content_type.indexOf('x-www-form-urlencoded')
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

}
