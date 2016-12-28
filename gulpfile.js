/**
 * 编写lib时，gulp打包配置
 */
var gulp = require("gulp"),
	concat = require("gulp-concat"),
	jshint = require("gulp-jshint"),
	uglify = require("gulp-uglify"),
	cleanCSS = require('gulp-clean-css'),
	del = require("del"),
	runSequence = require("run-sequence"),
	connect = require("gulp-connect"),
	header = require('gulp-header'),
	replace = require('gulp-replace'),
	gulpif = require("gulp-if"),
	rename = require("gulp-rename");

var pkg = require("./package.json");

// 这里其实也可以用 process.env 或 gulp-env 去设定运行环境
// 不过我还是喜欢运行命令尽量精简，所以写在gulp配置文件中
var env = "dev"; // 环境, 默认开发环境
var PORT = 3000; // 端口

// 判定环境
var condition = function (param) {
	return param === env ? true : false;
};

/**
 * 清理
 */
gulp.task("clean", function(cb){
	return del("./" + env + "/**/*", cb);
});

/**
 * connect
 * 此处需要搭配livereload来实现热加载
 * 建议web应用项目开启
 */
gulp.task("connect",function(){
	connect.server({
		root: "./" + env,
		port: PORT,
		livereload: true
	});
});
//监听打包中的文件变化，实时刷新预览
gulp.task("reload-app",function(){
	gulp.src("./"+ env +"/**/*.*")
		.pipe(connect.reload());
});

/**
 * 注释头
 */
var banner = ['/*!*',
	' * <%= pkg.name %> - <%= pkg.description %>',
	' * @version v<%= pkg.version %>',
	' * @author <%= pkg.author %>',
	' * @homeage <%= pkg.homepage %>',
	' * @license <%= pkg.license %>',
	' */',
	''].join('\n');

/**
 * copy
 */
gulp.task("copy:img", function () {
	return gulp.src("./src/images/**")
		.pipe(gulp.dest("./" + env + "/demo/images"));
});
gulp.task("copy:demo", function () {
	return gulp.src(["./src/demo/*.html"])
		.pipe(gulp.dest("./" + env + "/demo"));
});
gulp.task("copy", ["copy:img","copy:demo"]);

/**
 * css 打包
 */
gulp.task("css", function () {
	return gulp.src("./src/demo/css/*.css")
		.pipe(concat("index.min.css"))
		.pipe(cleanCSS())
		.pipe(header(banner, { pkg : pkg }))
		.pipe(gulp.dest("./" + env + "/demo/css"));
});

/**
 * js 打包
 */
gulp.task("js", function(){
	var env_replace;
	env_replace = env;
	return gulp.src([
		"./lib/head.js",
			"./lib/main.js",
		"./lib/footer.js"
	])
		.pipe(concat("index.js"))
		.pipe(jshint())
		.pipe(jshint.reporter("jshint-stylish"))
		.pipe(gulpif(condition("dist"), uglify()))
		.pipe(gulpif(condition("dist"), header(banner, { pkg : pkg })))
		.pipe(replace(/__ENV__/g, env_replace))
		.pipe(gulp.dest("./"+ env +"/"));
});


/**
 * watch
 */
gulp.task("watch", function(){
	gulp.watch("./lib/*.js", ["js"]);
	gulp.watch("./src/demo/css/*.css", ["css"]);
	gulp.watch("./src/demo/*.html", ["copy:demo"]);
	gulp.watch("./src/images/*", ["copy:img"]);
	gulp.watch("./dev/**/*", ["reload-app"]);
});


// 默认开发模式
gulp.task("default", ["d"]);

// 开发模式
gulp.task("d", function(){
	runSequence(
		"clean",
		["copy","js","css"],
		["connect"],
		["watch"],
		function(){
			console.log("开发模式，测试打开：//localhost:" + PORT);
		}
	);
});

// 生产模式
gulp.task("p", function(){
	env = "dist";
	runSequence(
		"clean",
		["copy","js","css"],
		function () {
			console.log("生产模式,打包完成");
		}
	);
});