var gulp = require('gulp'),
	cons = require('gulp-consolidate'),
	iconfont = require('gulp-iconfont');

exports.generateFont = function(setName) {
	var homeDir = process.env.HOME,
		fontName = 'flaticons-' + setName;

	gulp.task('default', function() {
		return gulp.src([homeDir + '/Desktop/flatified/svg/*.svg'])
			.pipe(iconfont({
				fontName: fontName,
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
					fontName:  fontName,
					fontPath: '../',
					className: 'flaticon'
				}))
				.pipe(gulp.dest(homeDir + '/Desktop/flatified/font/preview'));

				gulp.src(__dirname + '/preview.html')
				.pipe(cons('lodash', {
					glyphs: glyphs,
					fontName: fontName,
					cssPath: 'preview.css',
					className: 'flaticon'
				}))
				.pipe(gulp.dest(homeDir + '/Desktop/flatified/font/preview'));
			})
			.pipe(gulp.dest(homeDir + '/Desktop/flatified/font/'));
	});

	gulp.run();
};
