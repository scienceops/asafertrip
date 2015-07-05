var gulp = require('gulp'),
	less = require('gulp-less'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss = require('gulp-minify-css'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
	connect = require('gulp-connect'),
	usemin = require('gulp-usemin'),
	rename = require('gulp-rename'),
	open = require('gulp-open'),
	eslint = require('gulp-eslint'),
	concat = require('gulp-concat'),
	notify = require('gulp-notify'),
	cache = require('gulp-cache'),
	rev = require('gulp-rev'),
	minifyHTML = require('gulp-minify-html'),
	wiredep = require('wiredep').stream,
	livereload = require('gulp-livereload'),
	del = require('del'),

	// Config object gathering generic values needed across the gulp file.
 	config = (function () {
		var basenames = {
			fonts: 'fonts',
			styles: 'styles',
			scripts: 'scripts',
			resources: 'resources',
			images: 'images'
		};

		var env = {
			dev: 'app',
			test: '.tmp',
			prod: 'dist'
		};

		return {
			env: env,
			basenames: basenames,
			scripts: env.dev + '/**/*.js',
			styles: env.dev + '/**/*.less',
			fonts: env.dev + '/fonts/**/*',
			resources: env.dev + '/resources/**/*',
			images: env.dev + '/images/**/*',
			html: env.dev + '/components/**/*.html',
			host: '0.0.0.0',
			port: {
				app: 9090,
				lvd: 35729
			}
		}
	})();

/**************************************************************/
/*********************** DEV RELATED TASKS ********************/
/**************************************************************/


/**
 * dev-styles: stylesheet related task for dev
 * compile LESS files across the app/ folder.
 * then rename the main file according to config name
 * then move file to .tmp folder
 * to finally livereload
 **/
gulp.task('dev-styles', function () {
	return gulp.src(config.env.dev + '/app.less')
		.pipe(less())
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(rename({basename: config.basenames.styles}))
		.pipe(gulp.dest(config.env.test + '/' + config.basenames.styles))
		.pipe(livereload())
		.pipe(notify({message: 'Styles task complete'}));
});


/**
 * dev-scripts: scripts related task for dev
 * make sure scripts are jshint compliant across app/ folder
 * make sure they are also eslint compliant
 * to finally livereload
 **/
gulp.task('dev-scripts', function () {
	return gulp.src(config.scripts)
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('default'))
		.pipe(eslint('.eslintrc'))
		.pipe(eslint.format())
		.pipe(livereload())
		.pipe(notify({message: 'Scripts task complete'}));
});


/**
 * dev-gulpfile: gulfile related task for dev
 * livereload the app
 **/
gulp.task('dev-gulpfile', function () {
	return gulp.src('gulpfile.js')
		.pipe(livereload())
		.pipe(notify({message: 'Gulpfile task complete'}));
});

/**
 * dev-html: html related task for dev
 * livereload the app
 **/
gulp.task('dev-html', function () {
	return gulp.src(config.env.dev + '/index.html')
		.pipe(livereload())
});

/**
 * dev-images: image related task for dev
 * livereload the app
 **/
gulp.task('dev-images', function () {
	return gulp.src(config.images)
		.pipe(livereload())
		.pipe(notify({message: 'Images task complete'}));
});


/**
 * dev-btstp-fonts: bootstrap fonts related tasks
 * will copy fonts beeded by bootstrap to the app/ folder
 **/
gulp.task('dev-bstp-fonts', function () {
	return gulp.src('bower_components/bootstrap/fonts/**.*')
		.pipe(gulp.dest(config.env.dev + '/' + config.basenames.fonts));
});


/**
 * watch: looks up for file changes when on dev mode
 * starts up livereload, will look for below files and kick off a task accordingly
 **/
gulp.task('watch', function () {

	livereload.listen();

	// Watch .scss files
	gulp.watch(config.styles, ['dev-styles']);

	// Watch .js files
	gulp.watch(config.scripts, ['dev-scripts']);

	// Watch .html files
	gulp.watch(config.html, ['dev-html']);

	// Watch image files
	gulp.watch(config.images, ['dev-images']);

	// Watch gulp file
	gulp.watch('gulpfile.js', ['dev-gulpfile']);
});


/**
 * connect: kicks off a Node JS server to serve the application in dev mode
 * @root: app folder by default
 * also connect to .tmp folder to look for generated files
 * as well as the bower_components folder for all vendor resources
 **/
gulp.task('connect', function () {
	connect.server({
		root: config.env.dev,
		host: config.host,
		port: config.port.app,
		livereload: {
			port: config.port.lvd
		},
		middleware: function(connect) {
			return [
				connect.static('./.tmp'),
				connect().use(
					'/bower_components',
					connect.static('./bower_components')
				),
				connect.static('/bower_components/bootstrap/fonts')
			]
		}
	});
});


/**
 * open: opens the browser to the given URL
 * pointing by default to index.html in app/
 */
gulp.task('open', function () {
	var options = {
		url: 'http://' + config.host + ':' + config.port.app,
		app: 'google chrome'
	};

	gulp.src(config.env.dev + '/index.html')
		.pipe(open('', options));
});


/****************************************************************/
/*********************** BUILD RELATED TASKS ********************/
/****************************************************************/

gulp.task('build-images', function () {
	return gulp.src(config.images)
		.pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
		.pipe(gulp.dest(config.env.prod + '/' + config.basenames.images));
});

gulp.task('build-fonts', function () {
	return gulp.src(config.fonts)
		.pipe(gulp.dest(config.env.prod + '/' + config.basenames.fonts));
});

gulp.task('build-resources', function () {
	return gulp.src(config.resources)
		.pipe(gulp.dest(config.env.prod + '/' + config.basenames.resources));
});

gulp.task('build-html', function () {
	console.log(config.html);
	return gulp.src(config.html)
		.pipe(minifyHTML())
		.pipe(gulp.dest(config.env.prod + '/components'));
});

gulp.task('build-static', function () {
	return gulp.src([
		config.env.dev + '/*.{ico,txt}',
		config.env.dev + '/.htaccess',
		config.env.dev + '/404.html'
	]).pipe(gulp.dest(config.env.prod));
});

gulp.task('connect-dist', function () {
	connect.server({
		root: 'dist',
		host: config.host,
		port: config.port.app
	});
});

gulp.task('open-dist', function () {
	var options = {
		url: 'http://' + config.host + ':' + config.port.app,
		app: 'google chrome'
	};

	gulp.src(config.env.prod + '/index.html')
		.pipe(open('', options));
});

gulp.task('usemin', function () {
	return gulp.src(config.env.dev + '/index.html')
		.pipe(usemin({
			html: [minifyHTML()],
			js: [uglify(), rev()],
			vendorjs: [uglify(), rev()],
			css: [minifycss(), rev()]
		}))
		.pipe(gulp.dest(config.env.prod))
		.pipe(notify({message: 'Build Task Successful'}));
});


/**************************************************************/
/*********************** HELPER TASKS *************************/
/**************************************************************/

gulp.task('wiredep', function () {
	gulp.src(config.env.dev + '/index.html')
		.pipe(wiredep({
			ignorePath: /\.\.\//,
			exclude: [
				/jquery/,
				'bower_components/bootstrap/dist/js/bootstrap.js'
			]
		}))
		.pipe(gulp.dest(config.env.dev));
});

/**
 * Application Clean
 * Will ensure that all assets will be cleaned before any task is called
 */
gulp.task('clean', function (cb) {
	del([
		config.env.prod,
		config.env.test
	], cb);
});



/**************************************************************/
/*********************** RUNNER TASKS *************************/
/**************************************************************/


/**
 * Default Task
 * Clean will be called before executing any task regarding assets
 */
gulp.task('default', ['clean'], function () {
	gulp.start('wiredep', 'dev-styles', 'dev-bstp-fonts', 'dev-scripts', 'dev-images');
});

gulp.task('serve', ['default'], function () {
	gulp.start('connect', 'open', 'watch');
});

gulp.task('build', ['clean', 'dev-styles', 'dev-bstp-fonts'], function () {
	gulp.start(
		'build-html',
		'wiredep',
		'build-images',
		'build-fonts',
		'build-static',
		'build-resources',
		'usemin');
});

gulp.task('serve-dist', ['build'], function () {
	gulp.start('connect-dist', 'open-dist');
});

