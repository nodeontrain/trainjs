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


jtrain_trim = function (str) {
	var string = str.replace(/\s{2,}/g, ' ');	// Replace multiple spaces with a single space.
	return string.replace(/^\s+|\s+$/g,'');		// Removes whitespace from both ends of the string.
}

/**
 * Ex: tRaIn => Train
 */
jtrain_toTitleCase = function (str) {
    return str.replace(/\w\S*/g, function (txt) {
    	return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

jtrain_toControllerClass = function (str) {
	return jtrain_toTitleCase(str) + "Controller";
}

jtrain_escapeHtml = function (unsafe) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
