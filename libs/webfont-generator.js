var homeDir = process.env.HOME,
	gulp = require('gulp'),
	iconfont = require('gulp-iconfont'),
	cons = require('gulp-consolidate');

exports.generateFont = function(setName) {
	gulp.task('default', function() {
		return gulp.src([homeDir + '/Desktop/flatified/svg/*.svg'])
			.pipe(iconfont({
				fontName: setName,
				formats: ['ttf', 'eot', 'woff', 'svg'],
				normalize: true,
				centerHorizontally: true,
				descent: 0,
				fontHeight: 512,
				fixedWidth: true
			}))
			.on('glyphs', function(glyphs, options) {
				gulp.src(__dirname + '/preview.css')
				.pipe(cons('lodash', {
					glyphs: glyphs,
					fontName: setName,
					fontPath: '../',
					className: 'flaticon'
				}))
				.pipe(gulp.dest(homeDir + '/Desktop/flatified/font/preview'));

				gulp.src(__dirname + '/preview.html')
				.pipe(cons('lodash', {
					glyphs: glyphs,
					fontName: setName,
					cssPath: 'preview.css',
					className: 'flaticon'
				}))
				.pipe(gulp.dest(homeDir + '/Desktop/flatified/font/preview'));
			})
			.pipe(gulp.dest(homeDir + '/Desktop/flatified/font/'));
	});

	gulp.run();
};
