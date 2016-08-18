describe('staticPagesControllerTest', function() {

	it('should get home', function() {
		var current_url = 'http://localhost:1337/#/static_pages/home';
		browser.get(current_url);
		expect(browser.getCurrentUrl()).toContain('#/static_pages/home');
		expect( element(by.css('body')).getText() ).not.toEqual('');
	});
	it('should get help', function() {
		var current_url = 'http://localhost:1337/#/static_pages/help';
		browser.get(current_url);
		expect(browser.getCurrentUrl()).toContain('#/static_pages/help');
		expect( element(by.css('body')).getText() ).not.toEqual('');
	});

});
