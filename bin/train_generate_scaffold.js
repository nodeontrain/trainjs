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
var path = require('path');
var inflection = require('inflection');
var root_app = process.cwd();
var jtrain = require('../lib/javascripts/jtrain.js');
var train_generate = require('./train_generate.js');

module.exports = function() {
	var model_name = process.argv[4];
	var model = model_name.toLowerCase();
	var controller_name = inflection.pluralize(model_name);
	var model_plural = inflection.pluralize(model);
	var migration_file_name = jtrain.migration_time() + '_create_' + model_plural;
    
    var model_attrs = "";
    var migration_attrs = "";
    var form_html = "";
    var index_th_html = "";
    var index_td_html = "";
    var show_html = "";

	for (var i = 5; i < process.argv.length; i++) {
		var attr_str = process.argv[i].split(':');
        var attr_name = jtrain.toTitleCase(attr_str[0]);

		// model.ls
		model_attrs += '\t\t' + attr_str[0] + ': "' + attr_str[1] + '"\n';

		// form.ejs
		form_html += '\t<div class="field">\n';
		form_html += '\t\t<%- label_tag ("'+ model +'_'+ attr_str[0] +'", "'+ attr_name +'") %><br />\n';
		form_html += '\t\t<%- text_field_tag ("'+ model +'['+ attr_str[0] +']", '+ model +'.'+ attr_str[0] +') %>\n';
		form_html += '\t</div>\n';

		// index.ejs
		index_th_html += '\t\t<th>' + attr_name + '</th>\n'
		index_td_html += '\t\t<td><%= '+ model +'.'+ attr_str[0] +' %></td>\n';

		// show.ejs
		show_html += '<p>\n';
		show_html += '\t<b>'+ attr_name +':</b>\n';
		show_html += '\t<%= '+ model +'.'+ attr_str[0] +' %>\n';
		show_html += '</p>\n';

		// migration
		migration_attrs += "\t\t\t" + attr_str[0] + ": DataTypes." + attr_str[1].toUpperCase() + ",\n";
	}

    var dir_templates = {
        'app/views/controller_name': [
            { dir_path: 'app/views/' + model_plural }
        ]
    }
    
    var file_templates = {
        'app/controllers/controller.ls': [
            {
                file_path: 'app/controllers/' + model_plural + '_controller.ls',
                info_render: {
                    controller_name: controller_name,
                    model_plural: model_plural,
                    model_name: model_name,
                    model: model
                }
            }
        ],
        'app/models/model.ls': [
            {
                file_path: 'app/models/' + model + '.ls',
                info_render: {
                    model_name: model_name,
				    model_attrs: model_attrs
                }
            }
        ],
        'db/migrations/migration.js': [
            {
                file_path: 'db/migrations/' + migration_file_name + '.js',
                info_render: {
                    model_plural: model_plural,
				    migration_attrs: migration_attrs
                }
            }
        ],
        'app/views/controller_name/edit.ejs': [
            {
                file_path: 'app/views/' + model_plural + '/edit.ejs',
                info_render: {
                    model: model,
				    model_plural: model_plural
                }
            }
        ],
        'app/views/controller_name/new.ejs': [
            {
                file_path: 'app/views/' + model_plural + '/new.ejs',
                info_render: {
                    model: model,
				    model_plural: model_plural
                }
            }
        ],
        'app/views/controller_name/form.ejs': [
            {
                file_path: 'app/views/' + model_plural + '/form.ejs',
                info_render: {
                    model: model,
				    form_html: form_html
                }
            }
        ],
        'app/views/controller_name/index.ejs': [
            {
                file_path: 'app/views/' + model_plural + '/index.ejs',
                info_render: {
                    model: model,
				    model_plural: model_plural,
				    model_name: model_name,
				    index_td_html: index_td_html,
				    index_th_html: index_th_html
                }
            }
        ],
        'app/views/controller_name/show.ejs': [
            {
                file_path: 'app/views/' + model_plural + '/show.ejs',
                info_render: {
                    model: model,
				    model_plural: model_plural,
				    show_html: show_html
                }
            }
        ]
    }

	var routes_file = root_app + "/config/routes.ls";
	var routes_content = fs.readFileSync(routes_file);
	routes_content += '\n\tresources "' + model_plural + '"';
	fs.writeFileSync(routes_file, routes_content);

    var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../');
	var path_templ = lib + 'template/scaffold';
    
	train_generate(path_templ, dir_templates, file_templates);
}
