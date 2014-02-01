module.exports = {
	up: function(migration, DataTypes, done) {
		// add altering commands here, calling 'done' when finished
		migration.createTable('%%model_plural%%', {
%%migration_attrs%%
			createdAt: DataTypes.DATE,
			updatedAt: DataTypes.DATE
		});
		done();
	},
	down: function(migration, DataTypes, done) {
		// add reverting commands here, calling 'done' when finished
		done();
	}
}
