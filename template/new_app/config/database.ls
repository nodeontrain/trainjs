#   - Example:
#	development:
#		adapter: "mongodb"
#		host: "localhost"
#		name: "database_name"
module.exports =
	development:
		adapter: "sqlite"
		database: "db/development.sqlite3"
	test:
		adapter: "sqlite"
		database: "db/test.sqlite3"
	production:
		adapter: "sqlite"
		database: "db/production.sqlite3"
