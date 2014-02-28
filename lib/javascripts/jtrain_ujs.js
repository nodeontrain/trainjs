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


$(document).ready(function() {
	// DELETE method
	$("a").each(function() {
		$(this).click(function(event) {
			if ($(this).attr("data-method") == "delete") {
				event.preventDefault();
				var confirm_mess = 'Are you sure?';
				if ($(this).attr("data-confirm"))
					confirm_mess = $(this).attr("data-confirm");

				if (confirm(confirm_mess)) {
					var posting = $.post($(this).attr("href"), { _method: "delete" });
					posting.done(function(data) {
						if (data == window.location.pathname)
							window.location.reload();
						else
							window.location.href = data;
					});
				}
			}
		});
	});

	// Form view
	if ($('input[name=_method]').length) {
		var link_str = window.location.pathname.split('/');
		var action = link_str[link_str.length - 1];
		if (action == "edit")
			$('input[name=_method]').val('put');
	}

	$("form").each(function() {
		$(this).submit(function(event) {
			if ($(this).find('input[name=_method]').length && $(this).find('input[name=_method]').val() == "put") {
				event.preventDefault();
				var datastring = $(this).serialize();
				var path = $(this).attr('action');
				$.ajax({
					type: "POST",
					url: path,
					data: datastring,
					success: function(_url) {
						console.log(document.cookie);
					}
				});
			}
		});
	});

//	// Specify field errors
//	if ($('#error_explanation').length) {
//		var div_error = $('#error_explanation');
//		var header = div_error.find("h2")[0];
//		var model_name = $(header).text().split(" ")[4];
//		var list = div_error.find("ul")[0];
//		$(list).find("li").each(function() {
//			var field = null;
//			if ($(this).text().indexOf("failed for path") != -1) // Mongoose error
//				field = $(this).text().split("failed for path ")[1].split(" ")[0];
//			else // Sequelize error
//				field = $(this).text().split(": ")[1];

//			$('label').each(function() {
//				console.log($(this).text());
//			});
//		});


//		for (var i = 0; i < list_arr.length ; i++) {
//			var field = list_arr[i].innerHTML.split("failed for path ")[1].split(" ")[0];
//			var labels = document.getElementsByTagName('label');
//			for (var j = 0; j < labels.length; j++) {
//				if (labels[j].htmlFor == model_name + "_" + field) {
//					var div_field = labels[j].parentNode;
//					if (div_field.className != "field field_with_errors")
//						div_field.className = div_field.className + " field_with_errors";
//				}
//			}
//		}

});

//window.addEventListener('load', function() {
//	
//	// Specify field errors
//	var div_error = document.getElementById("error_explanation");
//	if (div_error) {
//		var header = div_error.getElementsByTagName("h2")[0];
//		var model_name = header.innerHTML.split(" ")[4];
//		var list = div_error.getElementsByTagName("ul")[0];
//		var list_arr = list.getElementsByTagName("li");
//		for (var i = 0; i < list_arr.length ; i++) {
//			var field = list_arr[i].innerHTML.split("failed for path ")[1].split(" ")[0];
//			var labels = document.getElementsByTagName('label');
//			for (var j = 0; j < labels.length; j++) {
//				if (labels[j].htmlFor == model_name + "_" + field) {
//					var div_field = labels[j].parentNode;
//					if (div_field.className != "field field_with_errors")
//						div_field.className = div_field.className + " field_with_errors";
//				}
//			}
//		}
//	}

//	// Form view
//	var link_str = window.location.pathname.split('/');
//	var action = link_str[link_str.length - 1];
//	if (action == "edit")
//		for (var i = 0; i < document.getElementsByName("_method").length ; i++)
//			document.getElementsByName("_method")[i].value = "put";

//	var forms = document.getElementsByTagName("form");
//	for (var i = 0; i < forms.length ; i++) {
//		forms[i].addEventListener("submit", function (event) {
//			event.preventDefault();
//			var formData = new FormData(this);
//			var xmlhttp = new XMLHttpRequest();
//			xmlhttp.onreadystatechange = function() {
//				if (xmlhttp.readyState == 4) {
//					console.log(xmlhttp);
////					xmlhttp.open('POST', url, true);
////					xmlhttp.send(formData);
//				}
//			}
//			xmlhttp.open('POST', this.getAttribute('action'), true);
//			xmlhttp.send(formData);
//		}, false);
//	}

//});
