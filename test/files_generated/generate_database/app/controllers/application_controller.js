function ApplicationController() {
	var self = this;
	this.before = function(req, res, next) {
		next();
	};
}

module.exports = ApplicationController;
