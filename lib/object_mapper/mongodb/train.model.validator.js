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


module.exports = function (validates, schema) {
	for (var attr in validates) {
		for (var opt in validates[attr]) {
			if (opt == "max_length")
				schema.path(attr).validate(function (v) {
					return v.length < validates[attr][opt];
				}, attr + ' is too long (maximum is ' + validates[attr][opt] + ' characters)');
		}
	}
}
