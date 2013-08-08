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


trainRoutes = new Array();
trainRoutes['index'] = new Array();
trainRoutes['new'] = new Array();
trainRoutes['edit'] = new Array();
trainRoutes['show'] = new Array();
trainRoutes['create'] = new Array();
trainRoutes['update'] = new Array();
trainRoutes['destroy'] = new Array();
trainRoutes_root = "public";

resources = function (rsrc) {
	trainRoutes['index'][rsrc] = 'index';
	trainRoutes['create'][rsrc] = 'create';
	trainRoutes['new'][rsrc] = 'new';
	trainRoutes['edit'][rsrc] = 'edit';
	trainRoutes['show'][rsrc] = 'show';
	trainRoutes['update'][rsrc] = 'update';
	trainRoutes['destroy'][rsrc] = 'destroy';
}

routesFunc = function (action_key, rsrc) {
	var urlcontrollers = train_root_app + '/app/controllers/' + rsrc + '_controller.ls';
	require(urlcontrollers);
	var controllerName = jtrain_toControllerClass(rsrc);
	var controllerObj = new App[controllerName];
	var action = trainRoutes[action_key][rsrc];
	params['action'] = action;
	controllerObj[action]();
}
