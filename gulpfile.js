const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const nodemon = require('gulp-nodemon');

gulp.task('nodemon', callback => {
    const stream = nodemon({
        script: 'app.js',
        ext: 'js html css',
        done: callback,
    });
    stream
        .on('restart', () => {
            browserSync.reload();
        })
        .on('crash', () => {
            console.error('Application has crashed!\n');
            //stream.emit('restart', 10)  // restart the server in 10 seconds
        });
});

gulp.task('browser-sync', () => {
    browserSync.init({
        proxy: 'http://localhost:3000',
        port: 5000,
    });
});

gulp.task('default', gulp.parallel('browser-sync', 'nodemon'));
