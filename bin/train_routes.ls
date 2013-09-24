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


require! path
require! fs
require! inflection
htmlToText = require('html-to-text')

global.train_root_app = process.cwd()
lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../')
require lib + 'lib/train.application.js'
global.Application = require train_root_app + '/config/application.ls'

routes_table = '<table id="routes">'

global.resources = (rsrc) !->
	model = inflection.singularize(rsrc)
	routes_table += '<tr><td>'+rsrc+'</td><td>GET</td><td>/'+rsrc+'(.:format)</td><td>'+rsrc+'#index</td></tr>'
	routes_table += '<tr><td></td><td>POST</td><td>/'+rsrc+'(.:format)</td><td>'+rsrc+'#create</td></tr>'
	routes_table += '<tr><td>new_'+model+'</td><td>GET</td><td>/'+rsrc+'/new(.:format)</td><td>'+rsrc+'#new</td></tr>'
	routes_table += '<tr><td>edit_'+model+'</td><td>GET</td><td>/'+rsrc+'/:id/edit(.:format)</td><td>'+rsrc+'#edit</td></tr>'
	routes_table += '<tr><td>'+model+'</td><td>GET</td><td>/'+rsrc+'/:id(.:format)</td><td>'+rsrc+'#show</td></tr>'
	routes_table += '<tr><td></td><td>PUT</td><td>/'+rsrc+'/:id(.:format)</td><td>'+rsrc+'#update</td></tr>'
	routes_table += '<tr><td></td><td>DELETE</td><td>/'+rsrc+'/:id(.:format)</td><td>'+rsrc+'#destroy</td></tr>'

require train_root_app + '/config/routes.ls'

routes_table += '</table>'

text = htmlToText.fromString(routes_table, {tables: ['#routes']});
console.log text
