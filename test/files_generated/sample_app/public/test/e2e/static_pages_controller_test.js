describe('staticPagesControllerTest', function() {

	beforeEach(function() {
		browser.driver.manage().window().maximize();
	});

	it('should get home', function() {
		var current_url = 'http://localhost:1337/#/static_pages/home';
		browser.get(current_url);
		expect(browser.getCurrentUrl()).toEqual(current_url);
	});
	it('should get help', function() {
		var current_url = 'http://localhost:1337/#/static_pages/help';
		browser.get(current_url);
		expect(browser.getCurrentUrl()).toEqual(current_url);
	});

});
