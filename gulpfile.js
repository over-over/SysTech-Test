var gulp = require('gulp');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var autoPrefixer = require('gulp-autoprefixer');
var cssComb = require('gulp-csscomb');
var cmq = require('gulp-merge-media-queries');
var cleanCss = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var babel = require('gulp-babel');

var svgSprite = require('gulp-svg-sprite'),
    svgSprites = require('gulp-svg-sprites'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace');

gulp.task('svgMin', function () {
    return gulp.src('dev/svg/*.svg')
        // minify svg
        .pipe(svgmin(function getOptions (file) {
            var prefix = file.relative.slice(0, -4);
            return {
                plugins: [{cleanupIDs: {
                    prefix: prefix + '-',
                    minify: true
                }}],
                js2svg: {
                    pretty: true
                }
            }
        }))
        .pipe(gulp.dest('dev/svg/min/'))
});

gulp.task('svgMinMonocolor', function () {
    return gulp.src('dev/svg/monocolor/*.svg')
        // minify svg
        .pipe(svgmin(function getOptions (file) {
            var prefix = file.relative.slice(0, -4);
            return {
                plugins: [{cleanupIDs: {
                    prefix: prefix + '-',
                    minify: true
                }}],
                js2svg: {
                    pretty: true
                }
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[styles]').removeAttr('style');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(gulp.dest('dev/svg/min/'))
});


gulp.task('svgSpriteBuild', gulp.series('svgMin', 'svgMinMonocolor', function() {
    return gulp.src('dev/svg/min/*.svg')
        .pipe(svgSprites({
            mode: "symbols",
            preview: false,
            selector: "i-%f",
            svg: {
                symbols: 'symbol_sprite.svg'
            }
        }))
        .pipe(gulp.dest('svg/'));
}))


gulp.task('svgSpriteSass', gulp.series('svgMin', 'svgMinMonocolor', function () {
    return gulp.src('dev/svg/min/*.svg')
        .pipe(svgSprites({
                preview: false,
                selector: "i-%f",
                svg: {
                    sprite: 'svg_sprite.svg'
                },
                cssFile: '../dev/layout/styles/_svg_sprite.scss',
                templates: {
                    css: require("fs").readFileSync('dev/svg/scss/_sprite-template.scss', "utf-8")
                }
            }
        ))
        .pipe(gulp.dest('svg/'));
}));

gulp.task('svgSprite', gulp.series('svgMin', 'svgMinMonocolor', 'svgSpriteBuild', 'svgSpriteSass'));

gulp.task('sass',function(done){
    gulp.src(['dev/layout/styles/screen.scss', 'dev/lib/**/styles/*.scss'])
        .pipe(plumber({
            handleError: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(concat('screen.scss'))
        .pipe(gulp.dest('dev/scss'));
    done();
});

gulp.task('css', gulp.series('sass',  function(done){
    gulp.src(['dev/scss/screen.scss'])
        .pipe(plumber({
            handleError: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(sass())
        .pipe(autoPrefixer({
            browsers: ">0.1%",
        }))
        .pipe(cmq({log:true}))
        .pipe(concat('screen.css'))
        .pipe(cssComb())
        .pipe(gulp.dest('css/'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cleanCss())
        .pipe(gulp.dest('css/'));
    done();
}));

gulp.task('js', function(done) {
    gulp.src(['dev/layout/js/*.js', 'dev/lib/**/js/*.js'])
        .pipe(plumber({
            handleError: function(err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(babel({presets: ['@babel/env']}))
        .pipe(concat('myscript.js'))
        .pipe(gulp.dest('js/'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify({
            mangle: true
        }))
        .pipe(gulp.dest('js/'));
    done();
});

gulp.task('default', gulp.series('css', 'js', function(done){
    gulp.watch(['dev/layout/styles/*.scss', 'dev/lib/**/styles/*.scss'], gulp.series('css'));
    gulp.watch(['dev/layout/js/*.js','dev/lib/**/js/*.js'], gulp.series('js'));
    done();
}));
