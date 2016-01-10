exports.config = {
	framework: 'jasmine',
	seleniumAddress: 'http://localhost:4444/wd/hub',
	specs: [
		'public/test/e2e/*.js'
	],
	capabilities: {
		'browserName': 'firefox'
	}
}
