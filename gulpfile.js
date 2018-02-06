const gulp = require('gulp');
const browserSync = require('browser-sync');
const rename = require('gulp-rename');
const svgStore = require('gulp-svgstore');
const inject = require('gulp-inject');
const handlebars = require('handlebars');
const hb = require('gulp-hb');
const through = require('through2');
const svgmin = require('gulp-svgmin');


function compileHbs() {
	return gulp.src('./templates/*.hbs')
	.pipe(hb({debug: true})
		.partials('./templates/partials/**/*.hbs')
		.data('./data/*.json')
		.data({"bar":"foo"})
	)
	.pipe(rename({extname: '.html'}))
	.pipe(gulp.dest('./build'))
	.pipe(browserSync.stream())
}

function watch() {
	return gulp.watch(['./data/*.json', './templates/**/*.hbs'], compileHbs)
}

function svg() {
	return gulp.src('./icons/*.svg')
		.pipe(svgStore({ inlineSvg: true }))
		.pipe(gulp.dest('./data/'));
}

function storeToHbs() {
	return gulp.src('./data/svgsprite.hbs')
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
exports.storeToHbs = storeToHbs;
exports.compileHbs = compileHbs;

gulp.task('serve', 	gulp.parallel([watch, browserSyncInit]));

exports.watch = watch;
exports.browserSyncInit = browserSyncInit;

