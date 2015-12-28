var fs = require('fs');
var path = require('path');

var assert = require('assert');

var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../');

var listFiles = require(lib + 'lib/helpers/list_files.js');

it("generate scaffold User", function() {
	var path1 = '/tmp/scaffold_app';
	var path2 = lib + 'test/files_generated/scaffold_app';
	var files = listFiles(path2);

	for (var i = 0; i < files.length; i++) {
		var file = files[i].split(" " + path2 + "/");
		if (file[0] == "f") {
			var src1 = path1 + "/" + file[1];
			var src2 = path2 + "/" + file[1];

			var src_content1 = fs.readFileSync(src1).toString();
			var src_content2 = fs.readFileSync(src2).toString();

			assert.equal(src_content1, src_content2);
		}
	}
})
