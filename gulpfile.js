var gulp = require('gulp');

var webserver = require('gulp-webserver');

gulp.task('serve', function() {
    gulp.src('./').pipe(webserver({
        open: true,
        directoryListing: true
    }));
})

gulp.task('default', function() {
    gulp.start('serve');
})