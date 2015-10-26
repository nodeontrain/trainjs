/*

	This file is a part of node-on-train project.

	Copyright (C) Thanh D. Dang <thanhdd.it@gmail.com>

	node-on-train is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	node-on-train is distributed in the hope that it will be useful, but
	WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
	General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/


var Fiber = require('fibers');
var http = require('http');

function httpReq (method, _path, _data, headers, callback) {
	var path_array = _path.split('://')[1].split(':');
	var hostname = path_array[0];
	var port = path_array[1].split('/')[0];
	var path = _path.split(':' + port)[1];

	if (!port) {
		port = 80;
		path = _path.split(hostname)[1];
	}

	var options = {
		hostname: hostname,
		port: port,
		path: path ? path : '/',
		method: method
	};

	if (_data) {
		options.headers = {
			'Content-Type': 'application/json'
		};
	}

	if (headers) {
		for (var k in headers) {
			if (!options.headers)
				options.headers = {};
			options.headers[k] = headers[k];
		}
	}

	if (options.headers && options.headers['Content-Type'] == 'application/json') {
		options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(_data));
	}

	var resData = "";
	var req = http.request(options, function(res) {
		res.on('data', function (chunk) {
			resData += chunk;
		});
		res.on('end', function() {
			if (resData != '') {
				callback(null, res, resData);
			} else {
				callback(null, res, '{}');
			}
		});
	});
	req.on('error', function(e) {
		callback(e, null, null);
	});

	if (_data) {
		if (options.headers['Content-Type'] != 'application/json')
			req.end(_data);
		else
			req.end(JSON.stringify(_data));
	} else {
		req.end();
	}
};

module.exports.get = function(url, headers) {
	var fiber = Fiber.current;
	httpReq('GET', url, null, headers, function (error, response, body) {
		if (error)
			fiber.run({error: error});
		else {
			try {
				var messobj = JSON.parse(body);
				fiber.run(messobj);
			} catch (e) {
				fiber.run({error: body});
			}
		}

	});
	return Fiber.yield();
};

module.exports.post = function(url, data, headers) {
	var fiber = Fiber.current;
	httpReq('POST', url, data, headers, function (error, response, body) {
		if (error)
			fiber.run({error: error});
		else {
			try {
				var messobj = JSON.parse(body);
				fiber.run(messobj);
			} catch (e) {
				fiber.run({error: body});
			}
		}

	});
	return Fiber.yield();
};
