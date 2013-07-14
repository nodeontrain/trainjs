module.exports =
	development:
		adapter: "mongodb"
		host: "localhost"
		name: "%%db_name%%"
	test:
		adapter: "mongodb"
		host: "localhost"
		name: "%%db_name%%-test"
