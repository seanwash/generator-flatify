// JSON example:
// [
// 	{
// 		"name": "grid-1", // for generating urls and whatnot
// 		"size": '24x24', // Used for sizing in the search app since AI doens't expose the non responsive export option
// 		"tags": "grid-1 grid" // for searching
// 	}
// ]

var fs = require('fs'),
	async = require('async'),
	child_process = require('child_process');

exports.exportJson = function(setName) {
	var svgsFolder = process.env.HOME + '/Desktop/flatified/svg',
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
				"name": dasherizedFileName,
				"tags": setName + ' ' + dasherizedFileName
			});

			cb();

		}, function(err) {
			if (err) throw err;
			fs.writeFileSync(process.env.HOME + '/Desktop/flatified/icons.json', JSON.stringify(finalJson));
		});
	});
};
