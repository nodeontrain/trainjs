function %%controller_name%%Controller() {

	this.index = function(req, res, next) {
		var %%model_plural%% = ModelSync( %%model_name%%.findAll() );
		res.end(JSON.stringify(%%model_plural%%));
	};

	this.create = function(req, res, next) {
		var %%model%% = ModelSync( %%model_name%%.create(req.body) );
		res.end(JSON.stringify(%%model%%));
	};

	this.show = function(req, res, next) {
		var %%model%% = ModelSync( %%model_name%%.findById(req.params.id) );
		res.end(JSON.stringify(%%model%%));
	};

	this.update = function(req, res, next) {
		var %%model%% = ModelSync( %%model_name%%.findById(req.params.id) );
		%%model%%.update(req.body).then(function(_%%model%%) {
			res.end(JSON.stringify(_%%model%%));
		})
	};

	this.destroy = function(req, res, next) {
		var %%model%% = ModelSync( %%model_name%%.findById(req.params.id) );
		%%model%%.destroy();
		res.end();
	};

}

module.exports = %%controller_name%%Controller;
