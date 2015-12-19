var fs = require('fs'),
	async = require('async'),
	child_process = require('child_process'),
	parameterize = require('parameterize');

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

			var fileName = fileNameWithExt.substr(0, fileNameWithExt.lastIndexOf('.svg'));
			fileName = parameterize(fileName);

			finalJson.push({
				'name': fileName,
				'tags': setName + ' ' + fileName
			});

			cb();

		}, function(err) {
			if (err) throw err;
			fs.writeFileSync(process.env.HOME + '/Desktop/flatified/icons.json', JSON.stringify(finalJson));
		});
	});
};
