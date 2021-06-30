'use strict';
 
const gulp = require('gulp');
const sass = require('gulp-sass')(require('node-sass'));
const browserify = require('browserify');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const through2 = require('through2');

function assets() {
  return gulp.src('assets/**/*', {base:"./assets"})
    .pipe(gulp.dest('dist'));
};

function data() {
  return gulp.src('data/**/*', {base:"."})
    .pipe(gulp.dest('dist'));
};

function css() {
  return gulp.src('./lens.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename('lens.css'))
    .pipe(gulp.dest('./dist'));
};

function build() {
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
    .pipe(gulp.dest('./dist'));
};

exports.default = gulp.series(assets, data, css, build);