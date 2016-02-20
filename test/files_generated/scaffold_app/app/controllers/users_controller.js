function UsersController() {

	this.index = function(req, res, next) {
		var users = ModelSync( User.findAll() );
		res.end(JSON.stringify(users));
	};

	this.create = function(req, res, next) {
		var user = ModelSync( User.create(req.body) );
		res.end(JSON.stringify(user));
	};

	this.show = function(req, res, next) {
		var user = ModelSync( User.findById(req.params.id) );
		res.end(JSON.stringify(user));
	};

	this.update = function(req, res, next) {
		var user = ModelSync( User.findById(req.params.id) );
		user.update(req.body).then(function(_user) {
			res.end(JSON.stringify(_user));
		})
	};

	this.destroy = function(req, res, next) {
		var user = ModelSync( User.findById(req.params.id) );
		user.destroy();
		res.end();
	};

}

module.exports = UsersController;
