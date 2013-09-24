var jspec = require('jspec');
var fs = require('fs');
var path = require('path');
var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../');
var train_parser = require(lib + 'lib/train.parser.js');

it("index action", function() {
	var req_parser = {url_path: "/users", method: "GET"};
	var result = train_parser(req_parser);
	var info = {
		url_path: "/users",
		method: "GET",
		controller: "users",
		controller_url: "users",
		action_key: "index"
	};
	jspec.object_equals(result, info);
})

it("show action", function() {
	var req_parser = {url_path: "/users/12345", method: "GET"};
	var result = train_parser(req_parser);
	var info = {
		id: "12345",
		url_path: "/users/12345",
		method: "GET",
		controller: "users",
		controller_url: "users",
		action_key: "show"
	};
	jspec.object_equals(result, info);
})

it("new action", function() {
	var req_parser = {url_path: "/users/new", method: "GET"};
	var result = train_parser(req_parser);
	var info = {
		url_path: "/users/new",
		method: "GET",
		controller: "users",
		controller_url: "users",
		action_key: "new"
	};
	jspec.object_equals(result, info);
})

it("edit action", function() {
	var req_parser = {url_path: "/users/12345/edit", method: "GET"};
	var result = train_parser(req_parser);
	var info = {
		id: "12345",
		url_path: "/users/12345/edit",
		method: "GET",
		controller: "users",
		controller_url: "users",
		action_key: "edit"
	};
	jspec.object_equals(result, info);
})

it("create action", function() {
	var req_parser = {url_path: "/users", method: "POST"};
	var result = train_parser(req_parser);
	var info = {
		url_path: "/users",
		method: "POST",
		controller: "users",
		controller_url: "users",
		action_key: "create"
	};
	jspec.object_equals(result, info);
})

it("update action", function() {
	var req_parser = {url_path: "/users/12345", method: "PUT"};
	var result = train_parser(req_parser);
	var info = {
		id: "12345",
		url_path: "/users/12345",
		method: "PUT",
		controller: "users",
		controller_url: "users",
		action_key: "update"
	};
	jspec.object_equals(result, info);
})
