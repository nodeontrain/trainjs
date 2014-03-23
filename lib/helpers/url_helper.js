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


link_to = function (body, url_options, html_options) {
	var html = "";
	if (typeof html_options !== "undefined") {
		if (typeof html_options.data !== "undefined" && typeof html_options.data.confirm !== "undefined")
			html += " data-confirm='" + html_options.data.confirm + "'";
		if (typeof html_options.method !== "undefined")
			html += " data-method='" + html_options.method + "'";
	}
	return '<a href="' + url_options + '" ' + html + '>' + body + '</a>';
}
