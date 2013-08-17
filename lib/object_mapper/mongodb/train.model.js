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


var mongoose = require('mongoose');
var child_process = require('child_process');
var fs = require('fs');

function query (controller_name, model_name, query, options) {
	if (query != 'all' && query != 'findByid')
		var options = JSON.stringify(options);
	var db_config = JSON.stringify(traindbconfig);
	var timestamps = new Date().getTime().toString();
	var file_tmp = train_root_app + '/tmp/queries/' + timestamps;
	var args = [
		file_tmp,
		controller_name,
		train_root_app,
		db_config,
		model_name,
		query,
		options
	];

	child_process.fork(__dirname + '/train.async.ls', args);
	var str = "";
	while (str == "") {
		if (fs.existsSync(file_tmp))
			str = fs.readFileSync(file_tmp);
	}
	if (query == 'save' || query == 'update') {
		str = str.toString();
		if (str == "true")
			var obj = true;
		else
			var obj = false;
	}
	else
		var obj = JSON.parse(str);
	
	if	(query != "all" && query != "save" && query != "update")
		obj = new global[model_name](obj);

	child_process.fork(__dirname + '/delete.tmp.ls', [file_tmp]);
	return obj;
}

for	(var i = 0; i < filesnameModels.length; i++) {
	var item = filesnameModels[i];
	var str = item.split(".");
	var modelName = jtrain_toTitleCase(str[0]);
	var objectSchema = new mongoose.Schema(App[modelName].fields);
	global[modelName] = mongoose.model(modelName, objectSchema);
	
	var newObj = {};
	for(var k in App[modelName].fields) {
		newObj[k] = "";
	}
	
	// Querying
	global[modelName].new = newObj;
	global[modelName].all = function () {
		return query(item, modelName, 'all', null);
	};
	global[modelName].find_by_id = function (id) {
		return query(item, modelName, 'findByid', id);
	};
	global[modelName].prototype.save_collection = function () {
		console.log(this);
		return query(item, modelName, 'save', this);
	};
	global[modelName].prototype.update_attributes = function (data) {
		var options = {};
		options.id = this.id
		options.data = data;
		return query(item, modelName, 'update', options);
	};
}
