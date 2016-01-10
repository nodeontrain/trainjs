exports.config = {
	framework: 'jasmine',
	seleniumAddress: 'http://localhost:4444/wd/hub',
	specs: [
		'public/test/e2e_test/**/*.js'
	],
	capabilities: {
		'browserName': 'firefox'
	}
}
