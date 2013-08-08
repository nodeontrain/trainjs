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
var ejs = require('ejs');

function train_render(obj, page, ext) {
	var controller = params['controller'];
	if (page == "new")
		obj.action = "/" + controller;
	else if (page == "edit")
		obj.action = "/" + controller + "/" + params["id"];
	var file = train_root_app + '/app/views/' + controller + '/' + page + '.' + ext;
	fs.readFile(file, function(err_fs, data) {
		if (err_fs)
			console.log(err_fs);
		var str = data.toString();
		var func = ejs.compile(str, {filename: file, pretty: true});
		var content_body = func(obj);
		
		// Render layout
		var layout = train_root_app + '/app/views/layouts/application.' + ext;
		fs.readFile(layout, function(err_fs2, data2) {
			if(err_fs2)
				console.log(err_fs2);
			var str2 = data2.toString();
			var func2 = ejs.compile(str2, {filename: layout, pretty: true});
			var body = {yield: content_body}
			var content = func2(body);		
			var res = params['respond'];
			res.end(content);
		});
	});
}

respond_to = (function(){
	function respond_to() {}
	respond_to.html = function (obj) {
		var format = params['content_type'];
		if(format == "text/html") {
			if(train_html) {
				train_render(obj, params['action'], "ejs");
			} else {
				var filepath = train_root_app + '/app/assets/javascripts/application.js';
				var input = fs.createReadStream(filepath);
				var remaining = '';
				input.on('data', function(data) {
					remaining += data;
					var index = remaining.indexOf('\n');
					while (index > -1) {
						var line = remaining.substring(0, index);
						var require_str = jtrain_trim(line.substring(3));
						var str_arr = require_str.split(" ");
						if(str_arr[0] == "require")
							train_html = train_html + '<script src="' + str_arr[1] + '.js"></script>' + '\n';
						remaining = remaining.substring(index + 1);
						index = remaining.indexOf('\n');
					}
				});
				input.on('end', function() {
					train_render(obj, params['action'], "ejs");
				});
			}
		} else {
			return;
		}
	}
	respond_to.json = function (obj) {
		var format = params['content_type'];
		if(format == "application/json") {
			var res = params['respond'];
			res.writeHead(200, {'Content-Type': format});
			res.end(JSON.stringify(obj));
		} else {
			return;
		}
	}
	return respond_to;
}());

//redirect_to = function(obj){
//	var controller = params['controller'];
//	var res = params['respond'];
//	if(obj.action && obj.controller) {
//		if(obj.action == "index")
//			var lnk = '/' + obj.controller;
//	} else {
//		for(var k in obj) {
//			if(typeof(obj[k]['id']) != "undefined") {
//				var obj_id = obj[k]['id'];
//				break;
//			}
//		}
//		var lnk = '/' + controller + '/' + obj_id;
//	}
//	
//	if(checkAjaxReq == "yes")
//		res.end(lnk);
//	else {
//		res.writeHead(302, {'Location': lnk});
//		res.end();
//	}
//};
