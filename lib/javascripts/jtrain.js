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


var jtrain_trim = function (str) {
	var string = str.replace(/\s{2,}/g, ' ');	// Replace multiple spaces with a single space.
	return string.replace(/^\s+|\s+$/g,'');		// Removes whitespace from both ends of the string.
}

/**
 * Ex: tRaIn => Train
 */
var jtrain_toTitleCase = function (str) {
    return str.replace(/\w\S*/g, function (txt) {
    	return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

var jtrain_Underscore2CamelCase = function (str){
	return str.replace(/(\_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});
};

var jtrain_toControllerClass = function (str) {
	return jtrain_Underscore2CamelCase(jtrain_toTitleCase(str)) + "Controller";
};

var jtrain_escapeHtml = function (unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
};

var jtrain_CamelCase2Underscore = function(){
	return this.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});
};

var jtrain_full_date = function(number) {
    if (number < 10)
        return '0' + number;
    else
        return number;
}

var jtrain_migration_time = function() {
    var today = new Date();
    var year = today.getFullYear();
    var month = jtrain_full_date(today.getMonth() + 1);
    var day = jtrain_full_date(today.getDate());
    var hours = jtrain_full_date(today.getHours());
    var minutes = jtrain_full_date(today.getMinutes());
    var seconds = jtrain_full_date(today.getSeconds());
    return year.toString() + month + day + hours + minutes + seconds;
}

exports.trim = jtrain_trim;
exports.toTitleCase = jtrain_toTitleCase;
exports.Underscore2CamelCase = jtrain_Underscore2CamelCase;
exports.CamelCase2Underscore = jtrain_CamelCase2Underscore;
exports.toControllerClass = jtrain_toControllerClass;
exports.escapeHtml = jtrain_escapeHtml;
exports.full_date = jtrain_full_date;
exports.migration_time = jtrain_migration_time;
