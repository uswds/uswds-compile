const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const { src, dest, series, parallel, watch } = require("gulp");
const path = require("path");
const postcss = require("gulp-postcss");
const replace = require("gulp-replace");
const sass = require("gulp-sass")(require("sass-embedded"));
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");
const svgSprite = require("gulp-svgstore");
const rename = require("gulp-rename");
const log = console.log;
const colors = {
  red: "\x1b[31m%s\x1b[0m",
  blue: "\x1b[34m%s\x1b[0m",
  yellow: "\x1b[33m%s\x1b[0m",
};

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
        projectIcons: "",
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
          },
        },
      },
      /**
       * ? project paths
       * - all paths are relative to the project root
       */
      dist: {
        theme: "./sass",
        img: "./assets/uswds/img",
        fonts: "./assets/uswds/fonts",
        js: "./assets/uswds/js",
        css: "./assets/uswds/css",
      },
    },
    browserslist: ["> 2%", "last 2 versions", "IE 11", "not dead"],
  },
  sprite: {
    width: 24,
    height: 24,
    separator: "-",
    projectIconsOnly: false,
  },
};

let paths = settings.compile.paths;

let getSrcFrom = (key) => {
  if (paths.src[key]) {
    return paths.src[key];
  }
  return paths.src.defaults[`v${settings.version}`][key];
};

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
  theme() {
    log(
      colors.blue,
      `Copy USWDS theme files: ${getSrcFrom("theme")} → ${paths.dist.theme}`
    );
    return src(`${getSrcFrom("theme")}/**/**`.replace("//", "/")).pipe(
      dest(paths.dist.theme)
    );
  },
  fonts() {
    log(
      colors.blue,
      `Copy USWDS fonts: ${getSrcFrom("fonts")} → ${paths.dist.fonts}`
    );
    return src(`${getSrcFrom("fonts")}/**/**`.replace("//", "/")).pipe(
      dest(paths.dist.fonts)
    );
  },
  images() {
    log(
      colors.blue,
      `Copy USWDS images: ${getSrcFrom("img")} →  ${paths.dist.img}`
    );
    return src(`${getSrcFrom("img")}/**/**`.replace("//", "/")).pipe(
      dest(paths.dist.img)
    );
  },
  js() {
    log(
      colors.blue,
      `Copy USWDS compiled JS: ${getSrcFrom("js")} →  ${paths.dist.js}`
    );
    return src(`${getSrcFrom("js")}/**/**`.replace("//", "/")).pipe(
      dest(paths.dist.js)
    );
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
  log(colors.blue, `uswds.version: ${settings.version}`);
  return Promise.resolve("logged version");
}

function getUswdsVersion() {
  let uswdsPackage = "uswds";
  if (settings.version === 3) {
    uswdsPackage = "@uswds/uswds";
  }
  const packagePath = path.join(path.dirname(require.resolve(uswdsPackage)), '../../');
  const version = require(`${packagePath}/package.json`).version;
  return version;
}

function buildSass() {
  const pkg = getUswdsVersion();

  log(colors.blue, `Compiling with USWDS ${pkg}`);
  const buildSettings = {
    plugins: [
      autoprefixer({
        cascade: false,
        grid: true,
        overrideBrowserslist: settings.compile.browserslist,
      }),
      csso({ forceMediaMerge: false }),
    ],
    includes: [
      // 1. local theme files
      paths.dist.theme,
      // 2. uswds organization directory (npm packages)
      getSrcFrom("uswds"),
      // 3. v2 packages directory
      `${getSrcFrom("sass")}/packages`.replace("//", "/"),
      // 4. local uswds package
      getSrcFrom("sass"),
    ],
  };

  return src([`${paths.dist.theme}/*.scss`.replace("//", "/")])
    .pipe(sourcemaps.init({ largeFile: true }))
    .pipe(
      sass({
        outputStyle: "compressed",
        includePaths: buildSettings.includes,
      }).on("error", handleError)
    )
    .pipe(replace(/\buswds @version\b/g, `based on uswds v${pkg}`))
    .pipe(postcss(buildSettings.plugins))
    .pipe(sourcemaps.write("."))
    .pipe(dest(paths.dist.css));
}

function watchSass() {
  return watch(
    [
      `${paths.dist.theme}/**/*.scss`.replace("//", "/"),
      `${paths.src.projectSass}/**/*.scss`.replace("//", "/"),
    ],
    buildSass
  );
}

function getSpritePaths(spritePaths = []) {
  const defaultSpritePath = `${paths.dist.img}/usa-icons/**/*.svg`.replace(
    "//",
    "/"
  );

  const customSpritePath = paths.src.projectIcons.length
    ? `${paths.src.projectIcons}/**/*.svg`.replace("//", "/")
    : "";

  if (customSpritePath) {
    spritePaths.push(customSpritePath);

    if (settings.sprite.projectIconsOnly) {
      return spritePaths;
    }
  }

  if (settings.sprite.projectIconsOnly && !customSpritePath) {
    log(
      colors.yellow,
      `You've set sprite.projectIconsOnly to true, but haven't defined a custom project icon path directory (paths.src.projectIcons). Using default: "${defaultSpritePath}"`
    );
  }

  spritePaths.push(defaultSpritePath);

  return spritePaths;
}

function buildSprite() {
  const spritePaths = getSpritePaths();

  return src(spritePaths, {
    allowEmpty: true,
  })
    .pipe(svgSprite())
    .pipe(rename("usa-icons.svg"))
    .on("error", handleError)
    .pipe(dest(`${paths.dist.img}`));
}

function renameSprite() {
  return src(`${paths.dist.img}/usa-icons.svg`.replace("//", "/"), {
    allowEmpty: true,
  })
    .pipe(rename(`${paths.dist.img}/sprite.svg`.replace("//", "/")))
    .pipe(dest(`./`));
}

function cleanSprite() {
  return del(`${paths.dist.img}/usa-icons.svg`.replace("//", "/"));
}

exports.settings = settings;
exports.paths = paths;
exports.sprite = settings.sprite;
exports.copyTheme = copy.theme;
exports.copyFonts = copy.fonts;
exports.copyImages = copy.images;
exports.copyJS = copy.js;
exports.copyAssets = series(copy.fonts, copy.images, copy.js);
exports.copyAll = series(copy.theme, this.copyAssets);
exports.compileSass = series(logVersion, buildSass);
exports.compileIcons = series(buildSprite, renameSprite, cleanSprite);
exports.compile = series(logVersion, parallel(buildSass, this.compileIcons));
exports.updateUswds = series(this.copyAssets, this.compile);

exports.init = series(logVersion, this.copyAll, this.compile);
exports.watch = series(logVersion, buildSass, watchSass);
exports.default = this.watch;
