const path = require("path");
const fs = require("fs");
const includeExt = ["js", "scss", "html"];

function walkSync(currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach(function (name) {
    let filePath = path.join(currentDirPath, name);
    let stat = fs.statSync(filePath, { withFileTypes: true });
    if (stat.isFile()) {
      let ext = path.extname(filePath);
      let basename = path.basename(filePath, ext);
      ext = ext.split(".")[ext.split(".").length - 1];
      if (includeExt.includes(ext)) {
        let chunkname =
          path.dirname(filePath).split(`${ext}/`).length === 1
            ? basename
            : `${
                path.dirname(filePath).split(`${ext}/`)[
                  path.dirname(filePath).split(`${ext}/`).length - 1
                ]
              }/${basename}`;
        callback({ filePath, ext, chunkname }, stat);
      }
    } else if (stat.isDirectory()) {
      walkSync(filePath, callback);
    }
  });
}

module.exports = walkSync;
