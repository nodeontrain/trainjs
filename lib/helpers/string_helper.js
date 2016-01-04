/*

	This file is a part of node-on-train project.

	Copyright (C) Thanh D. Dang <thanhdd.it@gmail.com>

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


var toTitleCase = function (str) {
	return str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};

var Underscore2CamelCase = function (str){
	return str.replace(/(\_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});
};

var CamelCase2Underscore = function(str){
	return str.replace(/([A-Z])/g, "_$1").replace(/^_/,'').toLowerCase();
};

var Underscore2CamelCaseWithOutTitleCase = function (str) {
	return Underscore2CamelCase( CamelCase2Underscore(str) );
};

var Underscore2CamelCaseWithTitleCase = function (str) {
	return Underscore2CamelCase( toTitleCase( CamelCase2Underscore(str) ) );
};

module.exports.toTitleCase = toTitleCase;
module.exports.Underscore2CamelCaseWithOutTitleCase = Underscore2CamelCaseWithOutTitleCase;
module.exports.Underscore2CamelCaseWithTitleCase = Underscore2CamelCaseWithTitleCase;
module.exports.Underscore2CamelCase = Underscore2CamelCase;
module.exports.CamelCase2Underscore = CamelCase2Underscore;
