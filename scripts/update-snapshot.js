const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const uswds = require("../gulpfile.js");

const fixturesDir = path.join(__dirname, "..", "test", "fixtures");
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "uswds-compile-snap-"));

uswds.settings.version = 3;
uswds.settings.compile.sassSourcemaps = false;
uswds.paths.dist.theme = fixturesDir;
uswds.paths.dist.css = outDir;

uswds.compileSass((error) => {
  if (error) throw error;

  fs.copyFileSync(
    path.join(outDir, "styles.css"),
    path.join(fixturesDir, "expected.css")
  );
  fs.rmSync(outDir, { recursive: true, force: true });

  console.log(`Updated ${path.join(fixturesDir, "expected.css")}`);
});
