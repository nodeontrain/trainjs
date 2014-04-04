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


form_tag = function (url_options, action) {
	var inputs_hidden = '<input type="hidden" value="post" name="_method">';
	if (action == "edit")
		inputs_hidden = '<input type="hidden" value="put" name="_method">';
	return '<form action="' + url_options + '" method="POST" >' + inputs_hidden;
};
form_end = function () {
	return '</form>';
};

label_tag = function (name, content_options, options) {
	if (typeof content_options === "undefined")
		content_options = "";
	if (typeof options === "undefined")
		options = "";
	return '<label for="' + name + '" ' + options + '>' + content_options + '</label>';
};

text_field_tag = function (name, value, options) {
	if (typeof options === "undefined")
		options = "";
	var matches = name.match(/\[(.*?)\]/);
	if (matches) {
		var arr = name.split('[');
		var id = arr[0] + '_' + arr[1].split(']')[0];
		var id = jtrain_trim(id);
	}
	else
		var id = name;
	return '<input id="' + id + '" type="text" value="' + value + '" size="30" name="' + name + '" ' + options + '>';
};

submit_tag = function (value, options) {
	if (typeof options === "undefined")
		options = "";
	return '<input name="commit" type="submit" value="' + value + '" ' + options + ' />';
};
