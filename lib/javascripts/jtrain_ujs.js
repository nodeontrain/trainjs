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


window.addEventListener('load', function() {
	var Anchors = document.getElementsByTagName("a");
	
	for (var i = 0; i < Anchors.length ; i++) {
		Anchors[i].addEventListener("click", function (event) {
				if(this.getAttribute("data-method") == "delete") {						
					event.preventDefault();
					if (confirm('Are you sure?')) {
						execute('POST', this.getAttribute("href"));
					}
				}
		}, false);
	}

	function execute(method, url){
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4) {							
				if(xmlhttp.responseText == window.location.pathname)
					window.location.reload();
				else
					window.location.href = xmlhttp.responseText;
			}
		}
		xmlhttp.open(method, url, true);
		xmlhttp.send("_method=delete");
	}
});
