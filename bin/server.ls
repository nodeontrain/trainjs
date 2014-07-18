/*

	This file is a part of node-on-train project.

	Copyright (C) 2013-2014 Thanh D. Dang <thanhdd.it@gmail.com>

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


require! trainjs
require! jroad
require! http
require! connect
require! 'body-parser'
require! 'serve-favicon'
require! 'method-override'
require! 'cookie-parser'

app = connect()
    .use(serveFavicon(jroad.favicon(process.cwd())))
    .use(methodOverride('_method'))
    .use(methodOverride('X-HTTP-Method'))
    .use(methodOverride('X-HTTP-Method-Override'))
    .use(methodOverride('X-Method-Override'))
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(cookieParser())
    .use(trainjs.newServer)

http.createServer(app).listen(process.argv[2], '127.0.0.1')
console.log '=> Server running at http://0.0.0.0:' + process.argv[2] + '\n=> Ctrl-C to shutdown server'

#app = connect()
#    .use(bodyParser.json())
#    .use(bodyParser.text())
#    .use(trainjs.newServer)
#    .use(serveFavicon(jroad.favicon(process.cwd())))
#
#http.createServer(app).listen(process.argv[2], '127.0.0.1')
#console.log '=> Server running at http://0.0.0.0:' + process.argv[2] + '\n=> Ctrl-C to shutdown server'






