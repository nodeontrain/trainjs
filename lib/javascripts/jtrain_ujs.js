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


window.addEventListener('load', function() {
	// DELETE method
	var anchors = document.getElementsByTagName("a");
	for (var i = 0; i < anchors.length ; i++) {
		anchors[i].addEventListener("click", function (event) {
			if (this.getAttribute("data-method") == "delete") {
				event.preventDefault();
				if (this.getAttribute("data-confirm"))
					var confirm_mess = this.getAttribute("data-confirm")
				else
					var confirm_mess = 'Are you sure?';
				if (confirm(confirm_mess)) {
					delete_method('POST', this.getAttribute("href"));
				}
			}
		}, false);
	}
	function delete_method(method, url){
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
//        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//        var obj = { _method: 'delete' };
//        xmlhttp.send(JSON.stringify(obj));
        xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlhttp.send('_method=delete');
	}
	
	// Specify field errors
	var div_error = document.getElementById("error_explanation");
	if (div_error) {
		var header = div_error.getElementsByTagName("h2")[0];
		var model_name = header.innerHTML.split(" ")[4];
		var list = div_error.getElementsByTagName("ul")[0];
		var list_arr = list.getElementsByTagName("li");
		for (var i = 0; i < list_arr.length ; i++) {
			var field = list_arr[i].innerHTML.split(": ")[1];
			var labels = document.getElementsByTagName('label');
			for (var j = 0; j < labels.length; j++) {
				if (labels[j].htmlFor == model_name + "_" + field) {
					var div_field = labels[j].parentNode;
					if (div_field.className != "field field_with_errors")
						div_field.className = div_field.className + " field_with_errors";
				}
			}
		}
	}
});

