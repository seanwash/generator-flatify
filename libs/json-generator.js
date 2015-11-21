// JSON example:
// [
// 	{
// 		"class": "flaticon stroke grid-1", // for using font via class
// 		"set": "stroke", // for generating urls and whatnot
// 		"name": "grid-1", // for generating urls and whatnot
// 		"unicode": "\\e3e8", // for using font directly
// 		"size": '24x24', // Used for sizing in the search app since AI doens't expose the non responsive export option
// 		"tags": "grid-1 grid" // for searching
// 	}
// ]

var fs = require('fs'),
	async = require('async'),
	child_process = require('child_process'),
	fontGenerator = require('./font-generator');

exports.exportJson = function() {
	var currentUnicode = parseInt('f0ff', 16), //fontcustom starts at f100, start one down from actual first number of f100
		svgsFolder = process.env.HOME + '/Desktop/flatified/svg',
		setName = global.setname.toLowerCase(),
		finalJson = [];

	fs.readdir(svgsFolder, function(err, files) {
		if (err) throw err;

		async.eachSeries(files, function(fileNameWithExt, cb) {
			if (!(/\.svg$/).test(fileNameWithExt)) {
				// we only care about SVG files
				cb();
			}

			var fileName = fileNameWithExt.substr(0, fileNameWithExt.lastIndexOf('.svg')),
				dasherizedFileName = fileName.replace(/ /g, '-').toLowerCase();

			finalJson.push({
				"class": 'flaticon ' + setName + ' ' + dasherizedFileName,
				"set": setName,
				"name": dasherizedFileName,
				"unicode": '\\' + (++currentUnicode).toString(16),
				"tags": setName + ' ' + dasherizedFileName
			});

			cb();
		}, function(err) {
			if (err) throw err;

			fs.writeFileSync(process.env.HOME + '/Desktop/flatified/' + setName + '.json', JSON.stringify(finalJson));

			fontGenerator.generateFont(setName);
		});
	});
};
