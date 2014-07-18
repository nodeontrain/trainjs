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


var fs = require('fs');
var ejs = require(ROOT_APP + '/node_modules/ejs/lib/ejs.js');
var Fiber = require('fibers');
var train_errors_respond = require('./train.errors.respond.js');
var jtrain = require('./javascripts/jtrain.js');

var cookie_separator = "%trainjs%";

function train_render(res, req, router_params, obj, ext) {
    var controller = router_params['controller'];
    var page = router_params['action'];
    var file = ROOT_APP + '/app/views/' + controller + '/' + page + '.' + ext;
    fs.readFile(file, function(err_fs, data) {
        if (err_fs) {
            res.end("Not found " + file);
        } else {
            var str = data.toString();
            
            var response_status = { notice: "" };
            if (req.cookies && req.cookies.trainjs_cookie
                && req.cookies.trainjs_cookie != "none") {
                var key_value_arr = req.cookies.trainjs_cookie.split(cookie_separator);
                for (var k in key_value_arr) {
                    var key_c = key_value_arr[k].split(":")[0];
                    var value_c = key_value_arr[k].split(":")[1];
                    response_status[key_c] = value_c;
                }
            }
            
            for (var k in response_status)
                obj[k] = response_status[k];
            
            obj['action'] = router_params['action'];
            
            var func = ejs.compile(str, {filename: file, pretty: true});
            try {
                var content_body = func(obj);
                
                // Render layout
                var layout = ROOT_APP + '/app/views/layouts/application.' + ext;
                fs.readFile(layout, function(err_fs2, data2) {
                    if(err_fs2)
                        console.log(err_fs2);
                    var str2 = data2.toString();
                    var func2 = ejs.compile(str2, {filename: layout, pretty: true});
                    var body = { yield: content_body };
                    Fiber(function() {
                        var content = func2(body);
                        if (req.cookies && !req.cookies['trainjs_cookie'] || !req.cookies)
                            res.writeHead(200);
                        else {
                            var date = new Date();
                            date.setTime(date.getTime()+((-1)*24*60*60*1000));
                            var expires = "; expires="+date.toGMTString();
                            var train_cookie = "trainjs_cookie=" + expires;
                            res.writeHead(200, {'Set-Cookie': train_cookie});
                        }
                        res.end(content);
                    }).run();
                });
            } catch(error) {
                var lines = error.message.toString().split('\n');
                var line_number = lines[0].split(':')[1];
                var message = lines[lines.length - 1];
                var source_code = "";
                for (var i = 1; i < lines.length - 2; i++) {
                    console.log(lines[i]);
                    source_code += jtrain.escapeHtml(lines[i]) + "\n";
                }
                
                var options = {
                    controller: controller,
                    action: page,
                    file_path: file,
                    line_number: line_number,
                    message: message,
                    source_code: source_code,
                    root_app: ROOT_APP,
                    url_path: req.url,
                    method: router_params.method
                };
                train_errors_respond ("argument_error", res, options);
            }
            
        }
    });
}

exports.response_assets = function (res, req_parser, path) {
	var type = req_parser.content_type;
	fs.readFile(path, function(err, data) {
		if (err && err.code == "ENOENT" && !req_parser.asset_type)
			train_errors_respond ("routes", req_parser, res);
		else {
			res.writeHead(200, {'Content-Type': type});
			res.end(data);
		}
	});
}

exports.format_html = function (options, req, res, router_params) {
	// if ... redirect_to
	// else ... render
	if (typeof options.redirect_to !== "undefined") {
		var train_cookie = "trainjs_cookie=";
		if (typeof options.redirect_to !== "object") {
			for (var k in options) {
				if (k != "redirect_to")
					train_cookie += k + ":" + options[k] + cookie_separator;
			}
			var date = new Date();
			date.setTime(date.getTime()+(1*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
			train_cookie += expires;
			var lnk = options.redirect_to;
		}

		if (req.body && req.body._method == "delete") res.end(lnk);
		else {
			res.writeHead(302, {'Location': lnk, 'Set-Cookie': train_cookie});
			res.end();
		}
	} else {
		if (typeof options.render !== "undefined" &&
			typeof options.render.action !== "undefined") {
			var obj = options.data;
			train_render(res, req, router_params, obj, "ejs");
		} else {
			if (typeof options.data !== "undefined")
				var obj = options.data;
			else
				var obj = options;
			train_render(res, req, router_params, obj, "ejs");
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
