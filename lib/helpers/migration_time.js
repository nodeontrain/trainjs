var full_date = function(number) {
	if (number < 10)
		return '0' + number;
	else
		return number;
}

module.exports = function() {
	var today = new Date();
	var year = today.getFullYear();
	var month = full_date(today.getMonth() + 1);
	var day = full_date(today.getDate());
	var hours = full_date(today.getHours());
	var minutes = full_date(today.getMinutes());
	var seconds = full_date(today.getSeconds());
	return year.toString() + month + day + hours + minutes + seconds;
}
