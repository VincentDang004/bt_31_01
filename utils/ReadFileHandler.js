let fs = require('fs')
module.exports = {
    ReadFileAndRes: function (path, res, status) {
        let data = fs.readFileSync(path, {
            encoding: 'utf-8'

        })
        res.writeHead(status, { 'Content-Type': 'text/html' });
        res.end(data);
    },
    valueConstant: "KEY1"
}