var jspec = require('jspec');

describe("Static pages", function() {
	describe("Home page", function() {
		it("should have the content 'Browse'", function() {
			jspec.visit("/", function(content) {
				jspec.have_content(content, "Browse");
			})
		})
	})
})
