let gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    jsonSass = require('gulp-json-sass')
    plumber = require('gulp-plumber'),
    postcss = require('gulp-postcss'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    stylelint = require('gulp-stylelint'),
    ts = require('gulp-typescript'),
    uglify = require('gulp-uglify'),
    prefixer = require('autoprefixer'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    browserSync = require('browser-sync'),
    cssnano = require('cssnano'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    tsify = require('tsify');

/**
 * Notify
 * 
 * Show a notification in the browser's corner.
 * 
 * @param {*} message 
 */
function notify(message) {
  browserSync.notify(message);
}

/**
 * Paths
 * 
 * Return paths configuration.
 */
let paths = (function () {
  this.basePath = '.'
  return {
    templates: `${this.basePath}`,
    src: `${this.basePath}/src`,
    lib: `${this.basePath}/scrollxp`,
    build: `${this.basePath}/assets`
  }
})();

/**
 * Vendors
 * 
 * List of modules to get bundled into vendors minified file.
 */
let vendors = [
  'lazysizes',
  'lazysizes/plugins/object-fit/ls.object-fit',
  'lazysizes/plugins/unveilhooks/ls.unveilhooks',
  'gsap'
];

/**
 * Server Task
 *
 * Launch server using BrowserSync.
 *
 * @param {*} done
 */
function server(done) {
  browserSync({
    server: {
      baseDir: "./",
      open: false
    }
  });
  done();
}

/**
 * Reload Task
 * 
 * Reload page with BrowserSync.
 * 
 * @param {*} done 
 */
function reload(done) {
  notify('Reloading...');
  browserSync.reload();
  done();
}

/**
 * Breakpoints Task
 * 
 * Create SCSS breakpoints file from JSON, so they can be used as variables.
 */
function breakpoints() {
  notify('Generating breakpoints...');
  return gulp.src(`${paths.src}/breakpoints.json`)
    .pipe(jsonSass({
      sass: false
    }))
    .pipe(rename('_breakpoints.scss'))
    .pipe(gulp.dest(`${paths.src}/scss/`));
}

/**
 * CSS Task
 *
 * The SASS files are run through postcss/autoprefixer and placed into one
 * single main styles.min.css file (and sourcemap)
 */
function css() {
  notify('Compiling styles...');
  return gulp.src(`${paths.src}/scss/main.scss`)
    .pipe(plumber())
    .pipe(stylelint({
      reporters: [
        { formatter: 'string', console: true }
      ]
    }))
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: [
        'node_modules/'
      ]
    }))
    .pipe(postcss([
      prefixer,
      cssnano
    ]))
    .pipe(rename('styles.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${paths.build}/css/`))
    .pipe(browserSync.reload({ stream: true }));
}

/**
 * JS Task
 *
 * All regular .js files are collected, minified and concatonated into one
 * single scripts.min.js file (and sourcemap)
 */
function js() {
  notify('Building scripts...');
  return browserify({
    entries: `${paths.src}/js/app.js`,
    debug: true
  })
  .external(vendors.map(vendor => {
    if (vendor.expose) {
      return vendor.expose;
    }
    return vendor;
  }))
  .transform(babelify, {
    presets: ['@babel/preset-env'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { 'legacy': true }]
    ],
    sourceMaps: true
  })
  .bundle()
  .on('error', function (err) {
    console.error(err);
    this.emit('end');
  })
  .pipe(source('scripts.js'))
  .pipe(buffer())
  .pipe(rename('scripts.min.js'))
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(uglify())
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(`${paths.build}/js/`))
  .pipe(browserSync.reload({ stream: true }));
}

exports.js = js;

/**
 * Vendor Task
 *
 * All vendor .js files are collected, minified and concatonated into one
 * single vendor.min.js file (and sourcemap)
 */
function vendor() {
  const b = browserify({
    debug: true
  });

  vendors.forEach(lib => {
    if (lib.expose) {
      b.require(lib.path, { expose: lib.expose })
    } else {
      b.require(lib);
    }
  });

  return b.bundle()
    .on('error', function (err) {
      console.error(err);
      this.emit('end');
    })
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe(rename('vendor.min.js'))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${paths.build}/js/`));
}

exports.vendor = vendor;

// function typescript() {
//   return browserify({
//     entries: `./scrollxp/index.ts`,
//     debug: true,
//     cache: {},
//     packageCache: {}
//   })
  // .plugin(tsify)
  // .transform(babelify, {
  //   presets: ['@babel/preset-env'],
  //   extensions: ['.ts']
  // })
//   .bundle()
//   .on('error', function (err) {
//     console.error(err);
//     this.emit('end');
//   })
//   .pipe(source('lib.js'))
//   .pipe(buffer())
//   .pipe(rename('lib.min.js'))
//   .pipe(sourcemaps.init({ loadMaps: true }))
//   .pipe(uglify())
//   .pipe(sourcemaps.write('.'))
//   .pipe(gulp.dest(`${paths.build}/js/`))
//   .pipe(browserSync.reload({ stream: true }));
// }

// function typescript() {
//   return browserify({
//     entries: `./scrollxp/index.ts`,
//     debug: true,
//     cache: {},
//     packageCache: {}
//   })
//   .plugin(tsify)
//   .bundle()
//   .on('error', function (err) {
//     console.error(err);
//     this.emit('end');
//   })
//   .pipe(source('scrollxp.js'))
//   .pipe(gulp.dest(`${paths.lib}/dist/`));
// }

// function bundleTS() {
//   return browserify({
//     entries: `${paths.lib}/build/index.js`,
//     debug: true
//   })
//   .transform(babelify, {
//     presets: ['@babel/preset-env']
//   })
//   .bundle()
//   .on('error', function (err) {
//     console.error(err);
//     this.emit('end');
//   })
//   .pipe(source('scrollxp.js'))
//   .pipe(buffer())
//   .pipe(sourcemaps.init({ loadMaps: true }))
//   .pipe(uglify())
//   .pipe(sourcemaps.write('.'))
//   .pipe(gulp.dest(`${paths.lib}/dist/`));
// }

function lib() {
  notify('Building lib...');
  let tsProject = ts.createProject('tsconfig.json');
  return tsProject.src()
    .pipe(tsProject())
    .pipe(gulp.dest(`${paths.lib}/dist/`));
}

exports.lib = lib;

/**
 * Images Task
 *
 * All images are optimized and copied to assets folder.
 */
function images() {
  notify('Copying image files...');
  return gulp.src(`${paths.src}/images/**/*.{jpg,png,gif,svg}`)
    .pipe(plumber())
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest(`${paths.build}/images/`));
}

/**
 * Watch Task
 * 
 * Watch files to run proper tasks.
 */
function watch() {
  // Watch breakpoints file for changes & recompile
  gulp.watch(`${paths.src}/breakpoints.json`, gulp.series(breakpoints, js));

  // Watch SCSS files for changes & rebuild styles
  gulp.watch(`${paths.src}/scss/**/*.scss`, css);

  // Watch JS files for changes & recompile
  gulp.watch(`${paths.src}/js/**/*.js`, js);

  // Watch images for changes, optimize & recompile
  gulp.watch(`${paths.src}/images/**/*`, gulp.series(images, reload));

  // Watch HTML files & reload
  gulp.watch(`${paths.templates}/index.html`, reload);

  // Watch TS files & recompile
  gulp.watch(`${paths.lib}/src/**/*.ts`, gulp.series(lib, js));
}

/**
 * Default Task
 *
 * Running just `gulp` will:
 * - Compile JS and SCSS files
 * - Optimize and copy images to assets folder
 * - Copy fonts to assets folder
 * - Launch BrowserSync & watch files
 */
exports.default = gulp.series(vendor, breakpoints, lib, gulp.parallel(js, css, images), gulp.parallel(server, watch));

/**
 * Build Task
 * 
 * Running just `gulp build` will:
 * - Compile JS and SCSS files
 * - Optimize and copy images to assets folder
 * - Copy fonts to assets folder
 */
exports.build = gulp.series(vendor, breakpoints, lib, gulp.parallel(js, css, images));
