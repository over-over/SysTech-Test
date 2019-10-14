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
var nunjucks = require('gulp-nunjucks');
var data = require('gulp-data');
var fs = require('fs');
global.Intl = require('intl');

var svgSprite = require('gulp-svg-sprite'),
    svgSprites = require('gulp-svg-sprites'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace');

gulp.task('nunjucks', function(done){
	gulp.src('dev/templates/index.html')
        .pipe(data(function (){
            const data = JSON.parse(fs.readFileSync('dev/data/index.json'));
            const newData = {};
            const dateTimeFormat = new Intl.DateTimeFormat('ru-Ru', { month: 'long', day: 'numeric' });
            data.forEach((item) => {
                const dateKey = item.date.substr(0,10);
                if(newData[dateKey] == undefined){
                    newData[dateKey] = {
                        dateName: dateTimeFormat.format(new Date(dateKey)),
                        docs: {},
                        docsPrice: 0,
                    };
                }
                if(newData[dateKey].docs[item.id] == undefined){
                    newData[dateKey].docs[item.id] = {docName: item.docName, docPrice: 0, products: []};
                }
                const newItem = {
                    productName: item.name,
                    image: item.image,
                    price: item.price,
                    quantity: item.quantity,
                    isRemoved: item.removed,
                }
                newData[dateKey].docs[item.id].products.push(newItem);
                newData[dateKey].docs[item.id].docPrice += item.price * item.quantity;
                newData[dateKey].docsPrice += item.price * item.quantity;
            });
            return {'data': newData};
        }))
		.pipe(nunjucks.compile())
		.pipe(gulp.dest('./'))
    done();
});

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

gulp.task('default', gulp.series('css', 'js', 'nunjucks', function(done){
    gulp.watch(['dev/layout/styles/*.scss', 'dev/lib/**/styles/*.scss'], gulp.series('css'));
    gulp.watch(['dev/layout/js/*.js','dev/lib/**/js/*.js'], gulp.series('js'));
    gulp.watch(['dev/templates/*.html'], gulp.series('nunjucks'));
    done();
}));
