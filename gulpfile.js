'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var through2 = require('through2');
var path = require('path');
var browserSync = require('browser-sync');

gulp.task('assets', function() {

  gulp.src('assets/**/*', {base:"./assets"})
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream())

  gulp.src('data/**/*', {base:"."})
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream());

});

gulp.task('sass', function () {
  gulp.src('./lens.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename('lens.css'))
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream());
});

gulp.task('browserify', function () {
    return gulp.src('./boot.js')
        .pipe(through2.obj(function (file, enc, next) {
            browserify(file.path)
                .bundle(function (err, res) {
                    if (err) { return next(err); }
                    file.contents = res;
                    next(null, file);
                });
        }))
        .on('error', function (error) {
            console.log(error.stack);
            this.emit('end');
        })
        .pipe(uglify())
        .pipe(rename('lens.js'))
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream());
});

gulp.task('default', ['assets', 'sass', 'browserify']);

gulp.task('server', function (cb) {
	require('./server');
  cb();
});

gulp.task('watch', ['server'], function () {
	// for more browser-sync config options: http://www.browsersync.io/docs/options/
	browserSync.init({
		// informs browser-sync to proxy our expressjs app which would run at the following location
		proxy: 'http://localhost:4001',
		// informs browser-sync to use the following port for the proxied app
		// notice that the default port is 3000, which would clash with our expressjs
		port: 8000
	});
	gulp.watch(['assets/**/*.js'], ['assets']);
	gulp.watch(['lens.scss'], ['sass']);
	gulp.watch(['src/**/*.js'], ['browserify']);
});
