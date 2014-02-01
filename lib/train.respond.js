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


var fs = require('fs');
var ejs = require(ROOT_APP + '/node_modules/ejs/lib/ejs.js');
var Fiber = require('fibers');
var train_parser = require('./train.parser.js');

var train_status = new Array();

function train_render(res, req_parser, obj, ext) {
	var controller = req_parser['controller'];
	var page = req_parser['action'];
	if (typeof req_parser["id"] !== "undefined")
		var id = req_parser["id"];
	if (page == "new") {
		obj.url = "/" + controller;
		obj.options = { method: "POST" };
	} else if (page == "edit") {
		obj.url = "/" + controller + "/" + id;
		obj.options = { method: "PUT" };
	}

	var file = ROOT_APP + '/app/views/' + controller + '/' + page + '.' + ext;
	
	fs.readFile(file, function(err_fs, data) {
		if (err_fs)
			console.log(err_fs);
		var str = data.toString();
		var func = ejs.compile(str, {filename: file, pretty: true});

		if (typeof req_parser['train_notice'] !== "undefined" && req_parser['train_notice'] == "yes"
			&& typeof train_status[req_parser.controller_url] !== "undefined"
			&& typeof train_status[req_parser.controller_url][req_parser.action_key] !== "undefined") {
			var response_status = train_status[req_parser.controller_url][req_parser.action_key];
		} else {
			var response_status = {
				notice: ""
			}
		}

		for (var k in response_status) {
			obj[k] = response_status[k];
		}
		var content_body = func(obj);
		
		// Render layout
		var layout = ROOT_APP + '/app/views/layouts/application.' + ext;
		fs.readFile(layout, function(err_fs2, data2) {
			if(err_fs2)
				console.log(err_fs2);
			var str2 = data2.toString();
			var func2 = ejs.compile(str2, {filename: layout, pretty: true});
			var body = {yield: content_body}
			Fiber(function() {
				var content = func2(body);
				res.end(content);
			}).run();
		});
	});
}

render = function (params) {
	return params;
}

redirect_to = function (options, response_status) {
	var obj = {};
	obj.url = options;
	obj.method = 'redirect';
	obj.response_status = response_status;
	return obj;
}

exports.format_html = function (options, req_parser, res) {
	// if ... redirect_to
	// else ... render
	if (typeof options.method !== 'undefined' && options.method == "redirect") {
		if (typeof options.url !== "object") {
			var parser = {};
			parser.method = "GET";
			parser.url_path = options.url;
			var result = train_parser(parser);
			if (typeof options.response_status !== "undefined") {
				train_status[result.controller_url] = new Array();
				train_status[result.controller_url][result.action_key] = options.response_status;
			}
			var lnk = options.url;
		}
		if (req_parser['_method']) res.end(lnk);
		else {
			res.writeHead(302, {'Location': lnk + '/'});
			res.end();
		}
	} else {
		if (typeof options.action !== "undefined") {
			var obj = options.data;
			req_parser['action'] = options.action;
			train_render(res, req_parser, obj, "ejs");
		} else {
			if (typeof options.data !== "undefined")
				var obj = options.data;
			else
				var obj = options;
			train_render(res, req_parser, obj, "ejs");
		}
	}
}

exports.format_json = function (options, req_parser, res) {
	var status = 200;
	if (typeof options.json !== 'undefined')
		var obj = options.json;
	else
		var obj = {};

	if (typeof options.status !== 'undefined' && options.status == "created")
		status = 201;
	else if (typeof options.status !== 'undefined' && options.status == "unprocessable_entity")
		status = 422;

	var format = req_parser['content_type'];
	if (typeof options.location !== 'undefined')
		res.writeHead(status, {'Content-Type': format, 'Location': HOST_NAME + options.location});
	else if (typeof options.head !== 'undefined' && options.head == "no_content")
		res.writeHead(204);
	else
		res.writeHead(status, {'Content-Type': format});

	res.end(JSON.stringify(obj));
}
