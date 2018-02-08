const path = require('path')
const fs = require('fs');
const glob = require('glob');
const gulp = require('gulp');
const gutil = require('gulp-util')
const merge = require('merge-stream');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const cssnano = require('gulp-cssnano');
const browserSync = require('browser-sync');
const rename = require('gulp-rename');
const svgStore = require('gulp-svgstore');
const inject = require('gulp-inject');
const handlebars = require('handlebars');
const hb = require('gulp-hb');
const through = require('through2');
const svgmin = require('gulp-svgmin');
const webpack = require('webpack');

const webpackConfig = require('./webpack.config.js');

const autoprefixerOptions = {
	browsers: ['last 3 versions', '> 5%', 'Firefox ESR']
}

const onError = function (err) {
	console.log(err.toString());
	this.emit('end');
};

function compileHbs() {
	const tasks = [];

	glob.sync('./data/*.json').forEach(function(filePath) {
		const data = JSON.parse(fs.readFileSync(filePath));
		const hbStream = hb();
		const name = path.parse(filePath).name;

		const currentTask = gulp.src('./templates/index.hbs')
			.pipe(plumber(onError))
			.pipe(hbStream
				.partials('./templates/partials/**/*.hbs'))
				.data(data)
				.pipe(rename({
					basename: name,
					extname: '.html'
				}))
			.pipe(gulp.dest('./build'))
			.pipe(browserSync.stream())

		tasks.push(currentTask);
	});
	return merge(tasks);
}

function bundle(done) {
	webpack(webpackConfig).run(onBuild(done))
}

function onBuild(done) {
	return function(err, stats) {
		if (err) {
			gutil.log('Error', err);
			if (done) {
				done();
			}
		} else {
			Object.keys(stats.compilation.assets).forEach(function(key) {
				gutil.log('Webpack: output ', gutil.colors.green(key));
			});
			if (done) {
				done();
			}
		}
	}
}

function styles() {
	return gulp.src('./sass/main.scss')
		.pipe(plumber(onError))
		.pipe(sourcemaps.init())
		.pipe(sass({includePaths: ['scss']}))
		.pipe(autoprefixer({autoprefixerOptions}))
		.pipe(cssnano())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./build/css'))
		.pipe(browserSync.stream())
}

function watch() {
	gulp.watch(['./data/*.json', './templates/**/*.hbs'], compileHbs)
	gulp.watch('./sass/**/*.scss', styles)
	gulp.watch('./js/**/*.js', bundle)
}

function svg() {
	return gulp.src('./icons/*.svg')
		.pipe(svgStore({ inlineSvg: true }))
		.pipe(rename({extname: '.hbs'}))
		.pipe(gulp.dest('./templates/partials/'))
}

function browserSyncInit(done) {
	browserSync.init({
		server: {
			baseDir: './build',
			index: 'index.html'
		}
	}, done);
}

exports.svg = svg;
exports.compileHbs = compileHbs;
exports.styles = styles;
exports.bundle = bundle;

gulp.task('serve', gulp.parallel([watch, browserSyncInit]));

exports.watch = watch;
exports.browserSyncInit = browserSyncInit;
