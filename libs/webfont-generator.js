var fs = require('fs'),
	path = require('path'),
	parameterize = require('parameterize'),
	webfontsGenerator = require('webfonts-generator');

exports.generateFont = function(setName) {
	var homeDir = process.env.HOME,
		iconsPath = homeDir + '/Desktop/flatified/svg/',
		files = [];

	 fs.readdir(iconsPath, function(err, svgs) {
		 if (err) throw err;

		svgs.forEach(function(svg) {
			files.push(path.join(iconsPath, svg));
		});

		webfontsGenerator(
			{
				fontName: setName,
				files: files,
				dest: homeDir + '/Desktop/flatified/font',
				types: ['svg', 'ttf', 'woff', 'eot'],
				startCodePoint:  '0xF100',
				rename: function(iconPath) {
					return parameterize(path.basename(iconPath, 'svg'));
			}
		}, function(error) {
			if (error) { console.log('Fail!', error); }
		});
	});
};
