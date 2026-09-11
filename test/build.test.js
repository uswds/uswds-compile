const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const uswds = require("../gulpfile.js");

const fixturesDir = path.join(__dirname, "fixtures");

test("compiled CSS output matches checked-in snapshot", async () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "uswds-compile-test-"));

  uswds.settings.version = 3;
  uswds.settings.compile.sassSourcemaps = false;
  uswds.paths.dist.theme = fixturesDir;
  uswds.paths.dist.css = outDir;

  await new Promise((resolve, reject) => {
    uswds.compileSass((error) => (error ? reject(error) : resolve()));
  });

  const actual = fs.readFileSync(path.join(outDir, "styles.css"), "utf8");
  const expected = fs.readFileSync(
    path.join(fixturesDir, "expected.css"),
    "utf8"
  );

  fs.rmSync(outDir, { recursive: true, force: true });

  assert.equal(
    actual,
    expected,
    "Compiled CSS changed. If this is expected (e.g. a USWDS or PostCSS " +
      "dependency bump), regenerate the snapshot with: " +
      "npm run test:update-snapshot"
  );
});
