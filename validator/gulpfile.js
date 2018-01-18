const gulp = require('gulp'),
  path = require('path'),
  browserify = require('browserify')
  buffer = require('vinyl-buffer')
  source = require('vinyl-source-stream')
  rename = require('gulp-rename')
  sourcemaps = require('gulp-sourcemaps')
  uglify = require('gulp-uglify')
  ;

var cfg = {
  files: [], //leave this blank to build the whole directory in opts.basedir
  presets: ['es2015'],
  dest: 'build/js',
  name: 'bundle.min.js',
  opts: {
    debug: true,
    standalone: '',
    basedir: 'src/js',
    paths: []
  }
};

function logErrors(err){
  console.log(`Error: ${err}`);
}

gulp.task('build-js', () => {
  return browserify(cfg.files, cfg.opts)
    .transform('babelify', { presets: cfg.presets })
    .bundle()
      .on('error', logErrors)
    .pipe(source(cfg.name))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps:true }))
    .pipe(uglify())
      .on('error', logErrors)
    .pipe(sourcemaps.write( './' ))
    .pipe(gulp.dest(cfg.dest))
});

gulp.task('watch', ['build-js'], () => {
  gulp.watch(path.join(cfg.opts.basedir, '*.js'), ['build-js'])
});

//run using 'gulp default', good for testing if gulp runs
gulp.task('default', function(){
  console.log('gulp is running');
});
