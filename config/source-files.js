const path = require('path');
const fs = require('fs');
const includeExt = ['js', 'scss', 'html'];

function walkSync(currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach(function (name) {
    let filepath = path.join(currentDirPath, name);
    let stat = fs.statSync(filepath, { withFileTypes: true });
    if (stat.isFile()) {
      let ext = path.extname(filepath);
      let filename = path.basename(filepath);
      let basename = path.basename(filepath, ext);
      ext = ext.split('.')[ext.split('.').length - 1];
      if (includeExt.includes(ext)) {
        let chunks =
          path.dirname(filepath).split(`${ext}/`).length === 1
            ? basename
            : `${
                path.dirname(filepath).split(`${ext}/`)[path.dirname(filepath).split(`${ext}/`).length - 1]
              }/${basename}`;
        callback({ filename, filepath, ext, chunks }, stat);
      }
    } else if (stat.isDirectory()) {
      walkSync(filepath, callback);
    }
  });
}

module.exports = walkSync;
