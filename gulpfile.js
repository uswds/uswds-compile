const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const { src, dest, series, parallel, watch } = require("gulp");
const postcss = require("gulp-postcss");
const replace = require("gulp-replace");
const sass = require("gulp-sass")(require("sass-embedded"));
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");
const svgSprite = require("gulp-svgstore");
const rename = require("gulp-rename");
const log = console.log;
const colorBlue = "\x1b[34m%s\x1b[0m";

/*
----------------------------------------
SETTINGS
----------------------------------------
*/
let settings = {
  version: 2,
  compile: {
    paths: {
      src: {
        uswds: null,
        sass: null,
        theme: null,
        fonts: null,
        img: null,
        js: null,
        projectSass: "./sass",
        defaults: {
          v2: {
            uswds: "./node_modules/uswds/dist",
            sass: "./node_modules/uswds/dist/scss",
            theme: "./node_modules/uswds/dist/scss/theme",
            fonts: "./node_modules/uswds/dist/fonts",
            img: "./node_modules/uswds/dist/img",
            js: "./node_modules/uswds/dist/js",
          },
          v3: {
            uswds: "./node_modules/@uswds",
            sass: "./node_modules/@uswds/uswds/packages",
            theme: "./node_modules/@uswds/uswds/dist/theme",
            fonts: "./node_modules/@uswds/uswds/dist/fonts",
            img: "./node_modules/@uswds/uswds/dist/img",
            js: "./node_modules/@uswds/uswds/dist/js",
          }
        }
      },
      /**
       * ? project paths
       * - all paths are relative to the project root
       */
      dist: {
        scss: "./assets/uwds/scss",
        img: "./assets/uswds/img",
        fonts: "./assets/uswds/fonts",
        js: "./assets/uswds/js",
        css: "./assets/uswds/css",
        custom: "./sass"
      },
    },
    browserslist: [
      "> 2%",
      "last 2 versions",
      "IE 11",
      "not dead"
    ],
  },
  sprite: {
    width: 24,
    height: 24,
    separator: "-",
  }
}

let paths = settings.compile.paths;

let getSrcFrom = (key) => {
  if (paths.src[key]) {
    return paths.src[key];
  }
  return paths.src.defaults[`v${settings.version}`][key];
}

/*
----------------------------------------
TASKS
----------------------------------------
*/

/*
----------------------------------------
USWDS specific tasks
----------------------------------------
*/

const copy = {
  scss() {
    log(colorBlue, `Copy USWDS scss files: ${getSrcFrom("theme")} → ${paths.dist.scss}`);
    return src(`${getSrcFrom("theme")}/**/**`.replaceAll("//", "/")).pipe(dest(paths.dist.scss));
  },
  fonts() {
    log(colorBlue, `Copy USWDS fonts: ${getSrcFrom("fonts")} → ${paths.dist.fonts}`);
    return src(`${getSrcFrom("fonts")}/**/**`.replaceAll("//", "/")).pipe(dest(paths.dist.fonts));
  },
  images() {
    log(colorBlue, `Copy USWDS images: ${getSrcFrom("img")} →  ${paths.dist.img}`);
    return src(`${getSrcFrom("img")}/**/**`.replaceAll("//", "/")).pipe(dest(paths.dist.img));
  },
  js() {
    log(colorBlue, `Copy USWDS compiled JS: ${getSrcFrom("js")} →  ${paths.dist.js}`);
    return src(`${getSrcFrom("js")}/**/**`.replaceAll("//", "/")).pipe(dest(paths.dist.js));
  },
};

/*
----------------------------------------
General tasks
----------------------------------------
*/

function handleError(error) {
  log(error.message);
  return this.emit("end");
}

function logVersion() {
  log(colorBlue, `uswds.version: ${settings.version}`);
  return Promise.resolve('logged version');
}

function buildSass() {
  let uswdsPath = "uswds"
  if (settings.version === 3) {
    uswdsPath = "@uswds/uswds";
  }

  const pkg = require(`../../${uswdsPath}/package.json`).version;

  log(colorBlue, `Compiling with USWDS ${pkg}`);
  const buildSettings = {
    plugins: [
      autoprefixer({
        cascade: false,
        grid: true,
        overrideBrowserslist: settings.compile.browserslist
      }),
      csso({ forceMediaMerge: false }),
    ],
    includes: [
      // 1. local theme files
      `${paths.dist.custom}/*.scss`,
      // 2. uswds css files
      paths.dist.scss,
      // 3. uswds organization directory (npm packages)
      getSrcFrom("uswds"),
      // 4. v2 packages directory
      `${getSrcFrom("sass")}/packages`.replaceAll("//", "/"),
      // 5. local uswds package
      getSrcFrom("sass")
    ],
  };

  return (
      src([`${paths.dist.custom}/*.scss`.replaceAll("//", "/")])
          .pipe(sourcemaps.init({ largeFile: true }))
          .pipe(
              sass({ includePaths: buildSettings.includes })
                  .on("error", handleError)
          )
          .pipe(replace(/\buswds @version\b/g, `based on uswds v${pkg}`))
          .pipe(postcss(buildSettings.plugins))
          .pipe(sourcemaps.write("."))
          .pipe(dest(paths.dist.css))
  );
}

function watchSass() {
  return watch(
      [
        `${paths.dist.scss}/**/*.scss`.replaceAll("//", "/"),
        `${paths.src.projectSass}/**/*.scss`.replaceAll("//", "/")
      ], buildSass);
}

function buildSprite() {
  return src(`${paths.dist.img}/usa-icons/**/*.svg`.replaceAll("//", "/"), {
    allowEmpty: true,
  })
    .pipe(svgSprite())
    .on("error", handleError)
    .pipe(dest(`${paths.dist.img}`));
}

function renameSprite() {
  return src(`${paths.dist.img}/usa-icons.svg`.replaceAll("//", "/"), {
    allowEmpty: true,
  })
      .pipe(rename(`${paths.dist.img}/sprite.svg`.replaceAll("//", "/")))
      .pipe(dest(`./`));
}

function cleanSprite() {
  return del(`${paths.dist.img}/usa-icons.svg`.replaceAll("//", "/"));
}

exports.settings = settings;
exports.paths = paths;
exports.copyScss = copy.scss;
exports.copyFonts = copy.fonts;
exports.copyImages = copy.images;
exports.copyJS = copy.js;
exports.copyAssets = series(
    copy.fonts,
    copy.images,
    copy.js,
    copy.scss,
);
exports.copyAll = series(
    this.copyAssets
);
exports.compileSass = series(logVersion, buildSass);
exports.compileIcons = series(buildSprite, renameSprite, cleanSprite);
exports.compile = series(
    logVersion,
    parallel(
        buildSass,
        this.compileIcons
    )
);
exports.updateUswds = series(
    this.copyAssets,
    this.compile
);

exports.init = series(logVersion, this.copyAll, this.compile);
exports.watch = series(logVersion, buildSass, watchSass);
exports.default = this.watch;
