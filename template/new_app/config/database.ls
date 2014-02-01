#   - Example:
#	development:
#		adapter: "mongodb"
#		host: "localhost"
#		name: "database_name"
module.exports =
	development:
		adapter: "sqlite"
		database: "db/%%db_name%%.sqlite3"
	test:
		adapter: "sqlite"
		database: "db/%%db_name%%-test.sqlite3"
	production:
		adapter: "sqlite"
		database: "db/%%db_name%%-production.sqlite3"
