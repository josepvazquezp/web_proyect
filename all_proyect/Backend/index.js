var express = require("express");
var app = express();
var http = require("http").createServer(app);
var formidable = require("formidable");
var fs = require("fs");
 
app.set("view engine", "ejs");
 
http.listen(4000, function () {
    app.get("/", function (request, result) {
        result.render("index");
    });

    app.post("/upload", function (request, result) {
        var formData = new formidable.IncomingForm();
        formData.parse(request, function (error, fields, files) {
            var extension = files.file.originalFilename.substr(files.file.originalFilename.lastIndexOf("."));
            var newPath = "uploads/" + fields.fileName + extension;
            fs.rename(files.file.filepath, newPath, function (errorRename) {
                result.send("File saved = " + newPath);
            });
        });
    });
});