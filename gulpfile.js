const gulp = require('gulp')
const clean = require('gulp-clean')
const fileinclude = require('gulp-file-include')
const htmlmin = require('gulp-htmlmin')
const cleanCSS = require('gulp-clean-css')
const sass = require('gulp-sass')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const imagemin = require('gulp-imagemin')
const webpack = require('webpack')
const gulpWebpack = require('gulp-webpack')
const runSequence = require('run-sequence')
const connect = require('gulp-connect')
const rev = require('gulp-rev')
const revCollector = require('gulp-rev-collector')
const proxy = require('http-proxy-middleware')
const stylelint = require('gulp-stylelint')
const ejs = require('gulp-ejs')
const gutil = require('gulp-util')

const webpackconfig = require('./webpack.config.js')

/* ----------------------------------------处理html---------------------------------------- */
// 处理ejs模板
gulp.task('ejsInclude', () => {
    return gulp.src('src/html/*.ejs')
        .pipe(ejs({}, {}, {ext: '.html'}).on('error', gutil.log))
        .pipe(gulp.dest('dist/html'))
        .pipe(connect.reload())
})
// 合并html
gulp.task('htmlInclude', () => {
    return gulp.src('src/html/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('dist/html'))
        .pipe(connect.reload())
})
// 压缩HTML
gulp.task('minifyHtml', ['ejsInclude', 'htmlInclude'], () => {
    const options = {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyJS: true,
        minifyCSS: true
    }
    return gulp.src('dist/html/*.html')
        .pipe(htmlmin(options))
        // .pipe(rev())
        .pipe(gulp.dest('build/html'))
        // .pipe(rev.manifest())
        // .pipe(gulp.dest('rev/html'))
})

/* ----------------------------------------处理css---------------------------------------- */
// stylelint检测
gulp.task('lintCss', () => {
    return gulp
        .src(['src/css/*.scss', 'src/css/*/*.scss'])
        .pipe(stylelint({
            reporters: [
                {formatter: 'string', console: true}
            ]
        }))
})
// sass处理
gulp.task('sass', ['lintCss'], () => {
    return gulp.src('src/css/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css'))
        .pipe(connect.reload())
})
// postcss处理css
gulp.task('postcss', ['sass'], () => {
    const plugins = [
        autoprefixer({browsers: ['last 2 versions', 'ie >= 8', '> 5% in CN']})
    ]
    return gulp.src('dist/css/*.css')
        .pipe(sourcemaps.init())
        .pipe(postcss(plugins))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css'))
        .pipe(connect.reload())
})
// 压缩css并添加hash值
gulp.task('minifyCss', ['lintCss', 'sass', 'postcss'], () => {
    return gulp.src('dist/css/*.css')
        .pipe(rev())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('build/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css'))
})

/* ----------------------------------------处理js---------------------------------------- */
// 引用webpack对js进行操作
gulp.task('buildJs', () => {
    return gulp.src('src/js/*.js')
        .pipe(gulpWebpack(webpackconfig, webpack))
        .pipe(gulp.dest('dist'))
        .pipe(connect.reload())
})
// 添加js的hash值
gulp.task('hashJs', ['buildJs'], () => {
    return gulp.src(['dist/js/*.js'])
        .pipe(rev())
        .pipe(gulp.dest('build/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js'))
})

/* ----------------------------------------处理img---------------------------------------- */
// 拷贝图片至dist
gulp.task('copyImg', () => {
    return gulp.src(['src/img/*', 'src/img/*/*.*', 'src/img-not-hash/*', 'src/img-not-hash/*/*.*'])
        .pipe(gulp.dest('dist/img'))
        .pipe(connect.reload())
})
// 拷贝不用加hash值图片至build
gulp.task('minifyImg', () => {
    return gulp.src(['src/img-not-hash/*', 'src/img-not-hash/*/*.*'])
        .pipe(imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true,
            multipass: true
        }))
        .pipe(gulp.dest('build/img'))
})
// 压缩图片并添加img hash值
gulp.task('minifyHashImg', () => {
    return gulp.src(['src/img/*', 'src/img/*/*.*'])
        .pipe(rev())
        .pipe(imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true,
            multipass: true
        }))
        .pipe(gulp.dest('build/img'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/img'))
})

/* ----------------------------------------清除dist/rev/build---------------------------------------- */
// 清除dist目录
gulp.task('cleanDist', () => {
    return gulp.src('dist', {read: false})
        .pipe(clean({force: true}))
})
// 清除build\rev目录
gulp.task('cleanBuildRev', () => {
    return gulp.src(['build', 'rev'], {read: false})
        .pipe(clean({force: true}))
})

/* ----------------------------------------替换hash文件及路径---------------------------------------- */
const publicPath = '..'

gulp.task('revHtmlCss', () => { // 替换html中的css为hash css
    return gulp.src(['rev/css/*.json', 'build/html/*.html'])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                '../../css': publicPath + '/css',
                '../css': publicPath + '/css'
            }
        }))
        .pipe(gulp.dest('build/html'))
})
gulp.task('revHtmlJs', () => { // 替换html中的js为hash js
    return gulp.src(['rev/js/*.json', 'build/html/*.html'])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                '../../js': publicPath + '/js',
                '../js': publicPath + '/js'
            }
        }))
        .pipe(gulp.dest('build/html'))
})
gulp.task('revHtmlImg', () => { // 替换html中的img为hash img
    return gulp.src(['rev/img/*.json', 'build/html/*.html'])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                '../../img': publicPath + '/img',
                '../img': publicPath + '/img'
            }
        }))
        .pipe(gulp.dest('build/html'))
})
gulp.task('revCssImg', () => { // 替换css中的img为hash img
    return gulp.src(['rev/img/*.json', 'build/css/*.css'])
        .pipe(revCollector({
            replaceReved: true,
            dirReplacements: {
                '../../img': publicPath + '/img',
                '../img': publicPath + '/img'
            }
        }))
        .pipe(gulp.dest('build/css'))
})

/* ----------------------------------------拷贝公共图片---------------------------------------- */
// 移动端
gulp.task('mCopyDist', () => {
    return gulp.src('libs/img/util-m/*.*').pipe(gulp.dest('dist/img')).pipe(connect.reload())
})
gulp.task('mCopyBuild', () => {
    return gulp.src('libs/img/util-m/*.*').pipe(gulp.dest('build/img')).pipe(connect.reload())
})
// PC端
gulp.task('pcCopyDist', () => {
    return gulp.src('libs/img/util-pc/*.*').pipe(gulp.dest('dist/img')).pipe(connect.reload())
})
gulp.task('pcCopyBuild', () => {
    return gulp.src('libs/img/util-pc/*.*').pipe(gulp.dest('build/img')).pipe(connect.reload())
})

/* ----------------------------------------监控与启动服务---------------------------------------- */
gulp.task('connect', () => {
    connect.server({
        root: ['dist'],
        port: 8020,
        host: '192.168.84.25',
        livereload: true,
        middleware: (connect, opt) => {
            return [
                proxy('/api', {
                    target: 'http://localhost:8020',
                    changeOrigin: true
                }),
                proxy('/otherServer', {
                    target: 'http://IP:Port',
                    changeOrigin: true
                })
            ]
        }
    })
})
gulp.task('watch', () => {
    gulp.watch(['src/html/*.html', 'src/html/*/*.html'], ['htmlInclude'])
    gulp.watch(['src/html/*.ejs', 'src/html/*/*.ejs'], ['ejsInclude'])
    gulp.watch(['src/css/*.scss', 'src/css/*/*.scss'], ['sass', 'postcss'])
    gulp.watch(['src/js/*.js', 'src/js/*/*.js'], ['buildJs'])
    gulp.watch(['src/img/*.*', 'src/img/*/*.*'], ['copyImg'])
})

/* ----------------------------------------开发与打包---------------------------------------- */
// 移动端
gulp.task('devM', (callback) => runSequence(
    'cleanDist',
    ['lintCss', 'mCopyDist'],
    ['htmlInclude', 'ejsInclude', 'buildJs', 'copyImg', 'sass'],
    ['postcss'],
    ['watch', 'connect'],
    callback
))
gulp.task('buildM', (callback) => runSequence(
    'cleanBuildRev',
    ['lintCss', 'mCopyBuild'],
    ['htmlInclude', 'ejsInclude', 'buildJs', 'minifyHashImg', 'minifyImg', 'sass'],
    ['postcss', 'hashJs'],
    ['minifyHtml', 'minifyCss'],
    ['revHtmlCss', 'revCssImg'],
    'revHtmlImg',
    'revHtmlJs',
    callback
))
// PC端
gulp.task('devPc', (callback) => runSequence(
    'cleanDist',
    ['lintCss', 'pcCopyDist'],
    ['htmlInclude', 'ejsInclude', 'buildJs', 'copyImg', 'sass'],
    ['postcss'],
    ['watch', 'connect'],
    callback
))
gulp.task('buildPc', (callback) => runSequence(
    'cleanBuildRev',
    ['lintCss', 'pcCopyBuild'],
    ['htmlInclude', 'ejsInclude', 'buildJs', 'minifyHashImg', 'minifyImg', 'sass'],
    ['postcss', 'hashJs'],
    ['minifyHtml', 'minifyCss'],
    ['revHtmlCss', 'revCssImg'],
    'revHtmlImg',
    'revHtmlJs',
    callback
))
