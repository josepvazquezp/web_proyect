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
            var newPath = "views/uploads/" + files.file.newFilename + ".jpg";
            fs.rename(files.file.filepath, newPath, function (errorRename) {
                let temp = request.rawHeaders;
                let source = temp[temp.length - 1  - 4];

                if(source == "http://localhost:4000/" || source == "http://localhost:4000/home")
                    result.send(result.render("home"));
                else if(source == "http://localhost:4000/info_empresa")
                    result.send(result.render("info_empresa"));
                else if(source == "http://localhost:4000/marcas")
                    result.send(result.render("marcas"));
                else if(source == "http://localhost:4000/p_bazares")
                    result.send(result.render("p_bazares"));
                else if(source == "http://localhost:4000/producto")
                    result.send(result.render("producto"));
                else if(source == "http://localhost:4000/productos_marca")
                    result.send(result.render("productos_marca"));
                else
                    result.send(result.render("home"));
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