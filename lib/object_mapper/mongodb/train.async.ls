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


require! fs
require! mongoose

file_tmp = process.argv[2]
filename = process.argv[3]
root_app = process.argv[4]
db_config = process.argv[5]
db_config = JSON.parse(db_config)
modelName = process.argv[6]
query = process.argv[7]
options = process.argv[8]
global.App = module.exports

if query != "all" && query != 'findByid'
	options = JSON.parse(options)

mongoose.connect('mongodb://' + db_config.development.host + '/' + db_config.development.name)
mongoose.connection.on 'error', !->
	console.log "Unable to connect to the database"

require(root_app + '/app/models/' + filename)

objectSchema = new mongoose.Schema(App[modelName].fields)
modelObj = mongoose.model(modelName, objectSchema)

if query == "all"
	modelObj.find (err, collections) !->
		if err
			console.log err
		str = JSON.stringify(collections)
		fs.writeFileSync(file_tmp, str)
		process.kill process.pid
else if query == "findByid"
	modelObj.findById options, (err, collection) !->
		if err
			console.log err
		str = JSON.stringify(collection)
		fs.writeFileSync(file_tmp, str)
		process.kill process.pid
else if query == "save"
	collection = new modelObj(options)
	collection.save (err) !->
		if err
			console.log err
		else
			str = 'true'
		fs.writeFileSync(file_tmp, str)
		process.kill process.pid
else if query == "update"
	modelObj.findById options.id, (err, collection) !->
		if err
			console.log err
		collection.update options.data, (err) !->
			if err
				console.log err
			else
				str = 'true'
			fs.writeFileSync(file_tmp, str)
			process.kill process.pid
