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


module.exports = function (url, req_parser) {
	var urlarr = url.split('/');
	var len = urlarr.length;
	if (urlarr[urlarr.length - 1] == "")
		len = len - 1;
	var controller_url = "";
	if (req_parser.method == "POST") {
		for(var k = 0; k < len; k++)
			controller_url = controller_url + "_" + urlarr[k];
		controller_url = controller_url.substr(2);
		if (trainRoutes['create'][controller_url]) {
			//URL: hostname/controllers or hostname/controllers.json controllers#create
			req_parser['controller'] = urlarr[len - 1];
			req_parser['controller_url'] = controller_url;
			req_parser['action_key'] = 'create';
		} else {
			//URL: hostname/controllers/:id or hostname/controllers/:id.json controllers#update
			req_parser.method = "PUT";
			controller_url = "";
			for(var k = 0; k < len - 1; k++)
				controller_url = controller_url + "_" + urlarr[k];
			controller_url = controller_url.substr(2);
			req_parser['controller_url'] = controller_url;
			req_parser['id'] = urlarr[len - 1];
			req_parser['controller'] = urlarr[len - 2];
			req_parser['action_key'] = 'update';
		}
	} else if (req_parser.method == "PUT") {
		//URL: hostname/controllers/:id or hostname/controllers/:id.json controllers#update
		for(var k = 0; k < len - 1; k++)
			controller_url = controller_url + "_" + urlarr[k];
		controller_url = controller_url.substr(2);
		req_parser['controller_url'] = controller_url;
		req_parser['id'] = urlarr[len - 1];
		req_parser['controller'] = urlarr[len - 2];
		req_parser['action_key'] = 'update';
	} else if (req_parser.method == "DELETE") {
		//URL: hostname/controllers/:id or hostname/controllers/:id.json controllers#destroy
		for(var k = 0; k < len - 1; k++)
			controller_url = controller_url + "_" + urlarr[k];
		controller_url = controller_url.substr(2);
		req_parser['controller_url'] = controller_url;
		req_parser['id'] = urlarr[len - 1];
		req_parser['controller'] = urlarr[len - 2];
		req_parser['action_key'] = 'destroy';
	} else if (req_parser.method == "GET") {
		if (url == "/") {
			if (trainRoutes_root == "public")
				var path_index = train_root_app + '/public/index.html';
			req_parser['root_path'] = path_index;
		} else if (urlarr[len - 1] == "new") {
			//URL: hostname/controllers/new controllers#new
			for(var k = 0; k < len - 1; k++)
				controller_url = controller_url + "_" + urlarr[k];
			controller_url = controller_url.substr(2);
			req_parser['controller_url'] = controller_url;
			req_parser['controller'] = urlarr[len - 2];
			req_parser['action_key'] = 'new';
		} else if (urlarr[len - 1] == "edit") {
			//URL: hostname/controllers/:id/edit controllers#edit
			req_parser['controller'] = urlarr[len - 3];
			req_parser['id'] = urlarr[len - 2];
			for(var k = 0; k < len - 2; k++)
				controller_url = controller_url + "_" + urlarr[k];
			controller_url = controller_url.substr(2);
			req_parser['controller_url'] = controller_url;
			req_parser['action_key'] = 'edit';
		} else {
			var parts = urlarr[len - 1].split('.');
			for(var k = 0; k < len - 1; k++)
				controller_url = controller_url + "_" + urlarr[k];
			controller_url = controller_url.substr(2);
			if (trainRoutes['index'][controller_url + parts[0]]) {
				//URL: hostname/controllers or hostname/controllers.json controllers#index
				req_parser['controller'] = parts[0];
				req_parser['controller_url'] = controller_url + parts[0];
				req_parser['action_key'] = 'index';
			} else {
				//URL: hostname/controllers/:id or hostname/controllers/:id.json controllers#show
				req_parser['id'] = parts[0];
				req_parser['controller'] = urlarr[len - 2];
				req_parser['controller_url'] = controller_url;
				req_parser['action_key'] = 'show';
			}
		}
	}
	return req_parser;
}
