var express = require("express");
var app = express();
var http = require("http").createServer(app);
var formidable = require("formidable");
var fs = require("fs");

app.set("view engine", "ejs")
app.use(express.static("views"));
 
http.listen(4000, function () {
    app.get("/", function (request, result) {
        result.render("home");
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

    app.get("/info_empresa", function (request, result) {
        result.render("info_empresa");
    });

    app.get("/home", function (request, result) {
        result.render("home");
    });

    app.get("/marcas", function (request, result) {
        result.render("marcas");
    });

    app.get("/p_bazares", function (request, result) {
        result.render("p_bazares");
    });


    app.get("/producto", function (request, result) {
        result.render("producto");
    });

    app.get("/productos_marca", function (request, result) {
        result.render("productos_marca");
    });

});