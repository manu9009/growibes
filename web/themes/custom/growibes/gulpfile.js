var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    plumber      = require('gulp-plumber'),
    notify       = require('gulp-notify'),
    autoprefixer = require('autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    postcss = require('gulp-postcss');

 var config = {
     src           : './scss/*.scss',
     dest          : './css/'
 };

 // Error message
 var onError = function (err) {
     notify.onError({
         title   : 'Gulp',
         subtitle: 'Failure!',
         message : 'Error: <%= error.message %>',
         sound   : 'Beep'
     })(err);

     this.emit('end');
 };

 // Compile CSS
   gulp.task('styles', function () {
       var stream = gulp
           .src([config.src])
           .pipe(plumber({errorHandler: onError}))
           .pipe(sass().on('error', sass.logError));

       return stream
           .pipe(sourcemaps.init())
           .pipe(postcss([ autoprefixer() ]))
           .pipe(sourcemaps.write('.'))
           .pipe(gulp.dest([config.dest]));
   });
