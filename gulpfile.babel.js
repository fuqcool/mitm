import gulp from 'gulp'
import eslint from 'gulp-eslint'


gulp.task('lint', () => {
	return gulp.src(['./lib/**/*.js', './*.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
})
