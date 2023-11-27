# USWDS Compile

Simple [Gulp 4.0](https://gulpjs.com/) functions for copying USWDS static assets and transforming USWDS Sass into browser-readable CSS.

## Requirements

- [Node.js (v20 or higher)](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com/get-npm)
- [uswds](https://www.npmjs.com/package/uswds)

## Installation

Install `@uswds/compile` in the project root:

```bash
npm install @uswds/compile --save-dev
```

## Usage

### Overview

1. Create a `gulpfile.js` file in the project root that includes the following:
   - Imported `@uswds/compile` package
   - Any project path settings you wish to modify (see [Path settings](#path-settings), below)
   - Exports for the functions/tasks you need (see [Functions](#functions), below)
1. In the terminal run `npx gulp [function]`

### Gulpfile setup

Create a file called `gulpfile.js` at the root of your project (or use an existing Gulpfile if one already exists). It needs to do the following

- Import the `@uswds/compile` package
- Set any project settings
- Export the functions/tasks you need

Here's an example of how your `gulpfile.js` might look:

```js
/* gulpfile.js */

const uswds = require("@uswds/compile");

/**
 * USWDS version
 */

uswds.settings.version = 3;

/**
 * Path settings
 * Set as many as you need
 */

uswds.paths.dist.css = "./assets/css";
uswds.paths.dist.theme = "./sass";

/**
 * Exports
 * Add as many as you need
 */

exports.init = uswds.init;
exports.compile = uswds.compile;
```

### USWDS version setting

USWDS is changing its file structure and package naming convention starting with USWDS 3.0. Use the USWDS version key to compile properly with the version of USWDS you're using.

**When migrating from USWDS 2.x to USWDS 3.x, simply update the value of `settings.version` to `3` once you've installed `@uswds/uswds` with npm.**

| Setting            | Default | Description                                                                                                                             |
| ------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `settings.version` | `2`     | The major version of the `uswds` package used in the project. USWDS 2.x projects should use `2` and USWDS 3.x+ projects should use `3`. |

### Path settings

Use path settings to customize where USWDS Compile looks for USWDS source and outputs processed files. **The value of the default may depend on the USWDS version you've defined in `settings.version`.** When applicable, the relevant value of `settings.version` precedes the default.

| Setting                   | Default                                                                                            | Description                                                                                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `paths.src.uswds`         | `2`: `"./node_modules/uswds/dist"`<br />`3`: `"./node_modules/@uswds"`                             | Source location of the `uswds` package                                                                                                                                        |
| `paths.src.sass`          | `2`: `"./node_modules/uswds/dist/scss"`<br />`3`: `"./node_modules/@uswds/uswds/packages"`         | Source location of the USWDS Sass                                                                                                                                             |
| `paths.src.theme`         | `2`: `"./node_modules/uswds/dist/scss/theme"`<br />`3`: `"./node_modules/@uswds/uswds/dist/theme"` | Source location of the USWDS theme files (Sass entry point and starter settings files)                                                                                        |
| `paths.src.fonts`         | `2`: `"./node_modules/uswds/dist/fonts"`<br />`3`: `"./node_modules/@uswds/uswds/dist/fonts"`      | Source location of the USWDS fonts                                                                                                                                            |
| `paths.src.img`           | `2`: `"./node_modules/uswds/dist/img"`<br />`3`: `"./node_modules/@uswds/uswds/dist/img"`          | Source location of the USWDS images                                                                                                                                           |
| `paths.src.js`            | `2`: `"./node_modules/uswds/dist/js"`<br />`3`: `"./node_modules/@uswds/uswds/dist/js"`            | Source location of the USWDS compiled JavaScript files                                                                                                                        |
| `paths.src.projectSass`   | `"./sass"`                                                                                         | Source location of any existing project Sass files outside of `paths.dist.theme`. The `watch` script will watch this directory for changes.                                   |
| `paths.src.projectIcons`  | `""`                                                                                               | Source location of any additional project icons to include in the icon sprite. (Use _only_ these project icons in the sprite by setting `sprite.projectIconsOnly` to `true`.) |
| `paths.dist.theme`        | `"./sass"`                                                                                         | Project destination for theme files (Sass entry point and settings)                                                                                                           |
| `paths.dist.img`          | `"./assets/uswds/images"`                                                                          | Project destination for images                                                                                                                                                |
| `paths.dist.fonts`        | `"./assets/uswds/fonts"`                                                                           | Project destination for fonts                                                                                                                                                 |
| `paths.dist.js`           | `"./assets/uswds/js"`                                                                              | Project destination for compiled JavaScript                                                                                                                                   |
| `paths.dist.css`          | `"./assets/uswds/css"`                                                                             | Project destination for compiled CSS                                                                                                                                          |
| `sprite.projectIconsOnly` | `false`                                                                                            | Include _only_ the icons in `paths.src.projectIcons` in the icon sprite.                                                                                                      |

### Functions

Export USWDS Compile functions in your project's `gulpfile.js` to use them in your project.

| Function       | Description                                                                                                      |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `compile`      | `compileSass` + `compileIcons`                                                                                   |
| `compileIcons` | Build the USWDS icon sprite into `paths.dist.img`                                                                |
| `compileSass`  | Compile Sass into `paths.dist.css`                                                                               |
| `default`      | `watch`                                                                                                          |
| `copyAll`      | `copyTheme` + `copyAssets`                                                                                       |
| `copyAssets`   | Copies all static assets: `copyFonts` + `copyImages` + `copyJS`                                                  |
| `copyFonts`    | Copy USWDS fonts to `paths.dist.fonts`                                                                           |
| `copyImages`   | Copy USWDS images to `paths.dist.img`                                                                            |
| `copyJS`       | Copy USWDS compiled JavaScript to `paths.dist.js`                                                                |
| `copyTheme`    | Copy USWDS theme files (Sass entry point and settings files) from the `uswds` package to `paths.dist.theme`      |
| `init`         | `copyAll` + `compile`                                                                                            |
| `updateUswds`  | `copyAssets` + `compile`                                                                                         |
| `watch`        | Compiles, then recompiles when there are changes to Sass files in `paths.dist.theme` and `paths.src.projectSass` |

### Running the compile functions

For any function you defined as an `export` in your `gulpfile.js` you can run `npx gulp [function]`

For example, if you have the following `gulpfile.js`:

```
/* gulpfile,js */

...

exports.compile = uswds.compile;
exports.watch = uswds.watch;
exports.init = uswds.init;
exports.update = uswds.updateUswds;
exports.default = uswds.watch;
```

With that setup, you could do the following in the terminal:

- **Compile Sass:** `npx gulp compile` or `npx gulp`
- **Watch for changes and recompile:** `npx gulp watch`
- **Initialize a new project:** `npx gulp init`
- **Update USWDS static assets and recompile:** `npx gulp update`

### Usage tips

- **Use `init` only once.** The `init` task is meant for initializing the design system on a project. Since it will overwrite project files (like settings files and the Sass entry point), use it sparingly and don't use it for updating the design system on a project, or at any point after you've customized your settings files.
- **Update USWDS assets with `copyAssets`.** Don't update assets with `init`, use the `copyAssets` task. This task updates static assets (like images, fonts, and compiled JavaScript) only and you don't risk clobbering your customizations.
- **Compile only from a single Sass entry point.** Define the location of this entry point with `paths.dist.theme`. If you have project Sass files outside the `paths.dist.theme` directory, load these files into your single entry point via `@forward`, `@use`, or `@import`. To include these project Sass files in your `gulp watch` task, set `paths.src.projectSass` to your project Sass directory. The Sass will still compile from the single entry point located in `paths.dist.theme`.
- **Only check theme files and custom icons into version control.** You should have a build process that copies static assets like images, fonts, and compiled JavaScript from the `uswds` package. This assures that these assets are up-to-date with whatever version of USWDS you're using. You only need to track your customizations (like settings, theme files, custom icons, and your gulpfile) in version control.

### Updating the USWDS icon sprite

After running either `init` or `copyAssets`, you'll find USWDS images in the `paths.dist.img` directory. Any icon SVG file in `usa-icons` directory within the `paths.dist.img` directory will compile into the icon sprite when running the `compileIcons` function.

#### Add icons to the icon sprite

1. Create a directory for the new icons anywhere in your project
1. Add icons (typically from either `uswds-icons` or `material-icons`) to this directory. **These icons will be added to the default USWDS icons in the sprite.**
1. In your project Gulpfile, set `uswds.paths.src.projectIcons` to this new directory. For example
   ```js
   uswds.paths.src.projectIcons = "./assets/img/my-icons";
   ```
1. Run either the `compile` or the `compileIcons` function to compile a new sprite. This sprite includes the USWDS default icons and the new project icons.

#### Use only project icons in the icon sprite

1. Create a directory for the new icons anywhere in your project
1. Add icons (typically from either `usa-icons`, `uswds-icons`, or `material-icons`) to this directory. **These will be the only icons included in the sprite.**
1. In your project Gulpfile, set `uswds.paths.src.projectIcons` to this new directory. For example
   ```js
   uswds.paths.src.projectIcons = "./assets/img/my-icons";
   ```
1. In your project Gulpfile, set `uswds.sprite.projectIconsOnly` to `true`. For example
   ```js
   uswds.sprite.projectIconsOnly = true;
   ```
1. Run either the `compile` or the `compileIcons` function to compile a new sprite. This sprite will include only the new project icons.

## Autoprefixer

We use Autoprefixer for maximum browser compatibility. We target the the following browsers. When you compile with the USWDS compiler, we will apply Autoprefixer to all compiled code.

```bash
> 2%
last 2 versions
IE 11
not dead
```

---

:rocket:
