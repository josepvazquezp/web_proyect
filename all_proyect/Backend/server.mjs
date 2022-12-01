import mongoose from "mongoose";
import express from 'express';
import chalk from 'chalk';
import * as fs from 'node:fs';
import cors from 'cors';
import bcrypt from 'bcrypt';
import randomatic from 'randomatic';

const app = express();
const port = 3000;

app.use(cors({
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Raíz del sitio');
    console.log(chalk.blue("Esto es la Práctica 3"));
});

app.listen(port, () => {
    console.log("Aplicación de ejemplo corriendo en puerto " + port);
});

let mongoConnection = "mongodb+srv://admin:bigote1805@myapp.i0dafr4.mongodb.net/PazariDB";
let db = mongoose.connection;

db.on('connecting', () => {
    console.log(chalk.blue('Conectando...'));
    console.log(mongoose.connection.readyState);
});

db.on('connected', () => {
    console.log(chalk.green('¡Conectado exitosamente!'));
    console.log(mongoose.connection.readyState);
});

mongoose.connect(mongoConnection, {useNewUrlParser: true});

let userSchema = mongoose.Schema({
    nombre: {type: String, 
             required: true},
    apellido: {type: String, 
             required: true},
    correo: {type: String, 
             required: true},
    password: {type: String, 
               required: true},  
    fecha: {type: Date,
           required: true},
    categorias: {type: Array,
                 required: true},
    tipo: {type: String,
           required: true},
    carrito: {type: Array,
              required: false},
    historial: {type: Array,
                required: false},
    imagen: {type: String,
            required: false}
});

let User = mongoose.model('users', userSchema);

let brandSchema = mongoose.Schema({
    nombre: {type: String, 
             required: true},
    apellido: {type: String, 
             required: true},
    correo: {type: String, 
             required: true},
    password: {type: String, 
               required: true},  
    fecha: {type: String,
           required: true},
    tipo: {type: String,
           required: true},
    carrito: {type: Array,
              required: false},
    historial: {type: Array,
                required: false},
    marca: {type: String,
            required: true},
    logo: {type: String,
            required: true},
    categoria: {type: String,
                required: true},
    apartado: {type: Array,
               require: false},
    url: {type: String,
          required: true}
});

let Brand = mongoose.model('brands', brandSchema);

let bazaarSchema = mongoose.Schema({
    nombre: {type: String, 
             required: true},
    apellido: {type: String, 
             required: true},
    correo: {type: String, 
             required: true},
    password: {type: String, 
               required: true},  
    fecha: {type: Date,
           required: true},
    tipo: {type: String,
           required: true},
    carrito: {type: Array,
              required: false},
    historial: {type: Array,
                required: false},
    bazar: {type: String,
            required: true},
    logo: {type: String,
            required: true},
    url: {type: String,
                required: true}
});

let Bazaar = mongoose.model('bazaars', bazaarSchema);

let productsSchema = mongoose.Schema({
    local_id: {type: Number,
               required: true}, 
    nombre: {type: String, 
             required: true},
    precio: {type: Number,
             required: true},
    descripcion: {type: String,
                  required: true},
    imagen: {type: String,
            required: false},
    categoria: {type: String,
                required: true},
    stock: {type: Number,
            required: true},
    marca: {type: String,
            required: true},
    logo: {type: String,
           required: true},
    dudas: {type: Array,
            required: false},
    reseñas: {type: Array,
              required: false}
});

let Product = mongoose.model('products', productsSchema);

let doubtsSchema = mongoose.Schema({
    usuario_token: {type: String,
                    required: true},
    duda: {type: String,
            required: true},
    respuesta: {type: Array,
                required: false}
});

let Doubt = mongoose.model('doubts', doubtsSchema);

let reviewsSchema = mongoose.Schema({
    usuario_token: {type: String,
                    required: true},
    estrellas: {type: Number,
                 required: true},
    reseña: {type: String,
             required: false}
});

let Review = mongoose.model('reviews', reviewsSchema);

app.post('/api/users', (req, res) => {
    User.find({
        correo: {$regex: req.body.correo}
    }, function (err, docs) {
        if(docs.length == 0) {
            let flag = true;
            let message = "Hace falta los siguientes parametros: ";

            if(req.body.nombre == undefined) {
                flag = false;
                message += "nombre";
            }

            if(req.body.apellido == undefined) {
                if(flag) {
                    message += "appellido";
                }
                else {
                    message += ", appellido";
                }

                flag = false;
            }

            if(req.body.correo == undefined) {
                if(flag) {
                    message += "correo";
                }
                else {
                    message += ", correo";
                }

                flag = false;
            }

            if(req.body.password == undefined) {
                if(flag) {
                    message += "password";
                }
                else {
                    message += ", password";
                }

                flag = false;
            }

            if(req.body.fecha == undefined) {
                if(flag) {
                    message += "fecha";
                }
                else {
                    message += ", fecha";
                }

                flag = false;
            }

            if(req.body.tipo == undefined) {
                if(flag) {
                    message += "tipo";
                }
                else {
                    message += ", tipo";
                }

                flag = false;
            }

            message += ".";

            if(!flag) {
                res.status(400);
                res.send(message);
            }
            else {
                let hash = bcrypt.hashSync(req.body.password, 10);
                message = "Hace falta los siguientes parametros: ";

                if(req.body.tipo == 'user') {
                    if(req.body.categorias == undefined || req.body.categorias.length == 0) {
                        flag = false;
                        message += "categorias"
                    }

                    message += ".";

                    if(!flag) {
                        res.status(400);
                        res.send(message);
                    }
                    else {
                        let newUser = {nombre: req.body.nombre, apellido: req.body.apellido, correo: req.body.correo, password: hash, fecha: req.body.fecha, categorias: req.body.categorias, tipo: req.body.tipo};
                        let user = User(newUser);
                        user.save().then((doc) => console.log(chalk.green("Usuario creado: ") + doc));
                        res.sendStatus(201);
                    }
                }
                else if(req.body.tipo == 'marca') {
                    if(req.body.marca == undefined) {
                        flag = false;
                        message += "marca";
                    }
        
                    if(req.body.logo == undefined) {
                        if(flag) {
                            message += "logo";
                        }
                        else {
                            message += ", logo";
                        }

                        flag = false;
                    }

                    if(req.body.url == undefined) {
                        if(flag) {
                            message += "url";
                        }
                        else {
                            message += ", url";
                        }

                        flag = false;
                    }

                    if(req.body.categoria == undefined) {
                        if(flag) {
                            message += "categoria";
                        }
                        else {
                            message += ", categoria";
                        }

                        flag = false;
                    }

                    message += ".";

                    if(!flag) {
                        res.status(400);
                        res.send(message);
                    }
                    else {
                        let newUser = {nombre: req.body.nombre, apellido: req.body.apellido, correo: req.body.correo, password: hash, fecha: req.body.fecha, tipo: req.body.tipo, marca: req.body.marca, logo: req.body.logo, categoria: req.body.categoria, url: req.body.url};
                        let user = Brand(newUser);
                        user.save().then((doc) => console.log(chalk.green("Usuario creado: ") + doc));
                        res.sendStatus(201);
                    }
                }
                else if(req.body.tipo == 'bazar') {
                    if(req.body.bazar == undefined) {
                        flag = false;
                        message += "bazar";
                    }
        
                    if(req.body.logo == undefined) {
                        if(flag) {
                            message += "logo";
                        }
                        else {
                            message += ", logo";
                        }

                        flag = false;
                    }

                    if(req.body.url == undefined) {
                        if(flag) {
                            message += "url";
                        }
                        else {
                            message += ", url";
                        }

                        flag = false;
                    }

                    message += ".";

                    if(!flag) {
                        res.status(400);
                        res.send(message);
                    }
                    else {
                        let newUser = {nombre: req.body.nombre, apellido: req.body.apellido, correo: req.body.correo, password: hash, fecha: req.body.fecha, tipo: req.body.tipo, bazar: req.body.bazar, logo: req.body.logo, url: req.body.url};
                        let user = Bazaar(newUser);
                        user.save().then((doc) => console.log(chalk.green("Usuario creado: ") + doc));
                        res.sendStatus(201);
                    }
                }
                else {
                    res.sendStatus(400);
                }
            }
        }
        else {
            res.status(401);
            res.send("Ya existe un usuario con ese correo.");
        }
    });

    
});

app.post('/api/products', (req, res) => {
    let token = req.body.usuario_token;

    let id_token;

    for(let i = 11 ; token[i] != '-' ; i++) {
        id_token = i;
    }

    id_token = token.substring(11, id_token + 1);

    Brand.find({
    }, function (err, docs) {
        let temp_brand;
        for(let i = 0 ; i < docs.length ; i++) {
            if(docs[i].id == id_token) {
                temp_brand = docs[i];
            }
        }

        if(temp_brand != undefined) {
            let marca = temp_brand.marca;
            let logo = temp_brand.logo;

            Product.find({        
            }, function (err, docs) {
                let temp = docs;

                let local_id = temp.length > 0? temp[temp.length - 1].local_id + 1 : 1;

                if(docs.length == 0) {
                    let flag = true;
                    let message = "Hace falta los siguientes parametros: ";
        
                    if(req.body.nombre == undefined) {
                        flag = false;
                        message += "nombre";
                    }
        
                    if(req.body.precio == undefined) {
                        if(flag) {
                            message += "precio";
                        }
                        else {
                            message += ", precio";
                        }
        
                        flag = false;
                    }
        
                    if(req.body.categoria == undefined) {
                        if(flag) {
                            message += "categoria";
                        }
                        else {
                            message += ", categoria";
                        }
        
                        flag = false;
                    }
        
                    if(req.body.stock == undefined) {
                        if(flag) {
                            message += "stock";
                        }
                        else {
                            message += ", stock";
                        }
        
                        flag = false;
                    }
        
                    if(req.body.descripcion == undefined) {
                        if(flag) {
                            message += "descripcion";
                        }
                        else {
                            message += ", descripcion";
                        }
        
                        flag = false;
                    }
        
                    message += ".";
        
                    if(!flag) {
                        res.status(400);
                        res.send(message);
                    }
                    else {
                        let newProduct = {local_id: local_id, nombre: req.body.nombre, precio: req.body.precio, categoria: req.body.categoria, stock: req.body.stock, descripcion: req.body.descripcion, marca: marca, logo: logo};
                        let product = Product(newProduct);
                        product.save().then((doc) => {
                            console.log(chalk.green("Producto creado: ") + doc);
                            res.status(201);
                            res.send(doc.id);
                        });
                    }
                }
                else {
                    res.status(401);
                    res.send("Ya existe ese producto.");
                }
            }); 
        }
        else {
            res.status(400);
            res.send("No se encontro la marca.");
        }
    });
});

app.get('/api/user/:token-:id-:tipo', (req, res) => {
    let id = req.params.id;
    let tipo = req.params.tipo;
    let token = req.params.token;

    if(token.length != 10) {
        res.status(400);
        res.send("Consulta incorrecta.");
    }
    else {
        if(tipo == 'user') {
            User.find({
            }, function (err, docs) {
                let temp;
                for(let i = 0 ; i < docs.length ; i++){
                    if(docs[i].id == id) {
                        temp = docs[i];
                    }
                }
        
                if(temp == undefined) {
                    res.status(400);
                    res.send("No se encontro el usuario.");
                }
                else{
                    res.status(200);
                    res.send(temp);
                }
            });
        }
        else if(tipo == 'marca') {
            Brand.find({
            }, function (err, docs) {
                let temp;
                for(let i = 0 ; i < docs.length ; i++){
                    if(docs[i].id == id) {
                        temp = docs[i];
                    }
                }
        
                if(temp == undefined) {
                    res.status(400);
                    res.send("No se encontro el usuario marca.");
                }
                else{
                    res.status(200);
                    res.send(temp);
                }
            });
        }
        else if(tipo == 'bazar') {
            Bazaar.find({
            }, function (err, docs) {
                let temp;
                for(let i = 0 ; i < docs.length ; i++){
                    if(docs[i].id == id) {
                        temp = docs[i];
                    }
                }
        
                if(temp == undefined) {
                    res.status(400);
                    res.send("No se encontro el usuario bazar.");
                }
                else{
                    res.status(200);
                    res.send(temp);
                }
            });
        }
        else {
            res.status(400);
            res.send("No se encontro la categoria."); 
        }
    }
});

app.get('/api/products', (req, res) => {
    let marca = req.body.marca;
    let categoria = req.body.categoria;
    
    Product.find({
        marca: {$regex: marca},
        categoria: {$regex: categoria}
    }, function (err, docs) {
        res.send(docs);
    });
});

app.post('/api/login', (req, res) => {
    let falta = 'Hacen falta los siguientes parámetros:';
    let mis = false;

    if(req.body.correo == undefined) {
        falta += ' correo';
        mis = true;
    }

    if(req.body.password == undefined) {
        if(mis) {
            falta += ', password';
        }
        else {
            falta += ' pasword';
            mis = true;
        }
    }

    falta += '.';

    if(mis) {
        res.status(400);
        res.send(falta);
    }
    else {
        User.find({
            correo: {$regex: req.body.correo}
        }, function (err, docs) {
            let usuarios = docs;

            if(usuarios.length > 0) {
                if(bcrypt.compareSync(req.body.password, usuarios[0].password)){
                    let token = randomatic('Aa0', '10') + "-" + usuarios[0].id + "-" + usuarios[0].tipo;
                    res.status(201);
                    res.send(token); 
                }
                else {
                    res.status(401);
                    res.send("No se encontro un usuario con ese correo y contraseña");
                }
            }
            else {
                Brand.find({
                    correo: {$regex: req.body.correo}
                }, function (err, docs) {
                    let usuarios = docs;
        
                    if(usuarios.length > 0) {
                        if(bcrypt.compareSync(req.body.password, usuarios[0].password)){
                            let token = randomatic('Aa0', '10') + "-" + usuarios[0].id + "-" + usuarios[0].tipo;
                            res.status(201);
                            res.send(token); 
                        }
                        else {
                            res.status(401);
                            res.send("No se encontro un usuario con ese correo y contraseña");
                        }
                    }
                    else {
                        Bazaar.find({
                            correo: {$regex: req.body.correo}
                        }, function (err, docs) {
                            let usuarios = docs;
                
                            if(usuarios.length > 0) {
                                if(bcrypt.compareSync(req.body.password, usuarios[0].password)){
                                    let token = randomatic('Aa0', '10') + "-" + usuarios[0].id + "-" + usuarios[0].tipo;
                                    res.status(201);
                                    res.send(token); 
                                }
                                else {
                                    res.status(401);
                                    res.send("No se encontro un usuario con ese correo y contraseña");
                                }
                            }
                            else {
                                res.status(401);
                                res.send("No se encontro un usuario con ese correo y contraseña");
                            }
                
                            
                        });
                    }
                    
                });
            }

        });
    }
});

app.post('/api/doubts', (req, res) => {
    let complete_token = req.body.usuario_token;
    let texto_duda = req.body.duda;
    let imagen = req.body.imagen;
    
    if(complete_token == undefined || texto_duda == undefined || imagen == undefined) {
        res.sendStatus(400);
    }
    else {
        let id_token;

        for(let i = 11 ; complete_token[i] != '-' ; i++) {
            id_token = i;
        }

        id_token = complete_token.substring(11, id_token + 1);

        Product.find({
            imagen: {$regex: imagen}
        }, function (err, docs) {
            let temp = docs[0];

            if(temp == undefined) {
                res.status(400);
                res.send("Usuario invalido para agregar producto.");
            }
            else {
                let newDoubt = {usuario_token: id_token, duda: texto_duda};
                let doubt = Doubt(newDoubt);
                doubt.save().then((doc) => {
                    console.log(chalk.green("Duda creada: ") + doc);
                
                    if(temp.dudas == undefined) {
                        temp.dudas = [];
                    } 

                    temp.dudas.push(doc.id);
                    console.log(temp);

                    Product.findByIdAndUpdate(temp.id, temp, {new: true}, (err, doc) => {
                        if(err) {
                            console.log("Error: " + err);
                            res.send(err);
                        }
                        else {
                            console.log(chalk.green("Producto actualizado:"));
                            console.log(doc);
                            res.status(201);
                            res.send(doc);
                        }
                    });
                });
            }
        });
    } 
});

app.post('/api/reviews', (req, res) => {
    let complete_token = req.body.usuario_token;
    let estrellas = req.body.estrellas;
    let imagen = req.body.imagen;
    let reseña = req.body.reseña;
    
    if(complete_token == undefined || estrellas == undefined || imagen == undefined || reseña == undefined) {
        res.sendStatus(400);
    }
    else {
        let id_token;

        for(let i = 11 ; complete_token[i] != '-' ; i++) {
            id_token = i;
        }

        id_token = complete_token.substring(11, id_token + 1);

        Product.find({
            imagen: {$regex: imagen}
        }, function (err, docs) {
            let temp = docs[0];

            if(temp == undefined) {
                res.status(400);
                res.send("Usuario invalido para agregar producto.");
            }
            else {
                let newReview = {usuario_token: id_token, estrellas: estrellas, reseña: reseña};
                let review = Review(newReview);
                review.save().then((doc) => {
                    console.log(chalk.green("Reseña creada: ") + doc);
                
                    if(temp.reseñas == undefined) {
                        temp.reseñas = [];
                    } 

                    temp.reseñas.push(doc.id);
                    console.log(temp);

                    Product.findByIdAndUpdate(temp.id, temp, {new: true}, (err, doc) => {
                        if(err) {
                            console.log("Error: " + err);
                            res.send(err);
                        }
                        else {
                            console.log(chalk.green("Producto actualizado:"));
                            console.log(doc);
                            res.status(201);
                            res.send(doc);
                        }
                    });
                });
            }
        });
    } 
});

app.post('/api/carrito', (req, res) => {
    let complete_token = req.body.usuario_token;
    let imagen = req.body.imagen;
    
    if(complete_token == undefined || imagen == undefined) {
        res.sendStatus(400);
    }
    else {
        let id_token, index;

        for(let i = 11 ; complete_token[i] != '-' ; i++) {
            index = i;
        }

        id_token = complete_token.substring(11, index + 1);
        let tipo = complete_token.substring(index + 2, complete_token.length);

        Product.find({
            imagen: {$regex: imagen}
        }, function (err, docs) {
            let temp = docs[0];

            if(temp == undefined || temp.stock == 0) {
                res.status(400);
                res.send("Usuario invalido para agregar a carrito.");
            }
            else {
                if(tipo == 'user') {
                    User.findById(id_token, (err, docs) => {
                        if(err) {
                            console.log("Error: " + err);
                            res.send(err);
                        }
                        else {
                            let user = docs;
    
                            temp.stock -= 1;
                            
                            Product.findByIdAndUpdate(temp.id, temp, {new: true}, (err, doc) => {
                                if(err) {
                                    console.log("Error: " + err);
                                    res.send(err);
                                }
                                else {
                                    console.log(chalk.green("Producto actualizado:"));
                                    console.log(doc);
                                    if(user.carrito == undefined) {
                                        user.carrito = [];
                                    } 
            
                                    user.carrito.push(temp.id);
            
                                    if(user.tipo == 'user') {
                                        User.findByIdAndUpdate(user.id, user, {new: true}, (err, doc) => {
                                            if(err) {
                                                console.log("Error: " + err);
                                                res.send(err);
                                            }
                                            else {
                                                console.log(chalk.green("Usuario actualizado:"));
                                                console.log(doc);
                                                res.status(200);
                                                res.send(doc);
                                            }
                                        });
                                    }
                                    else {
                                        res.sendStatus(400);
                                    }     
                                }
                            });
                        }
                    });
                }
                else if(tipo == 'marca') {
                    Brand.findById(id_token, (err, docs) => {
                        if(err) {
                            console.log("Error: " + err);
                            res.send(err);
                        }
                        else {
                            let user = docs;
    
                            temp.stock -= 1;
                            
                            Product.findByIdAndUpdate(temp.id, temp, {new: true}, (err, doc) => {
                                if(err) {
                                    console.log("Error: " + err);
                                    res.send(err);
                                }
                                else {
                                    console.log(chalk.green("Producto actualizado:"));
                                    console.log(doc);
                                    if(user.carrito == undefined) {
                                        user.carrito = [];
                                    } 
            
                                    user.carrito.push(temp.id);
            
                                    if(user.tipo == 'marca') {
                                        Brand.findByIdAndUpdate(user.id, user, {new: true}, (err, doc) => {
                                            if(err) {
                                                console.log("Error: " + err);
                                                res.send(err);
                                            }
                                            else {
                                                console.log(chalk.green("Marca actualizada:"));
                                                console.log(doc);
                                                res.status(200);
                                                res.send(doc);
                                            }
                                        });
                                    }
                                    else {
                                        res.sendStatus(400);
                                    }     
                                }
                            });
                        }
                    });
                }
                else if(tipo == 'bazar') {
                    Bazaar.findById(id_token, (err, docs) => {
                        if(err) {
                            console.log("Error: " + err);
                            res.send(err);
                        }
                        else {
                            let user = docs;
    
                            temp.stock -= 1;
                            
                            Product.findByIdAndUpdate(temp.id, temp, {new: true}, (err, doc) => {
                                if(err) {
                                    console.log("Error: " + err);
                                    res.send(err);
                                }
                                else {
                                    console.log(chalk.green("Producto actualizado:"));
                                    console.log(doc);
                                    if(user.carrito == undefined) {
                                        user.carrito = [];
                                    } 
            
                                    user.carrito.push(temp.id);
            
                                    if(user.tipo == 'bazar') {
                                        Bazaar.findByIdAndUpdate(user.id, user, {new: true}, (err, doc) => {
                                            if(err) {
                                                console.log("Error: " + err);
                                                res.send(err);
                                            }
                                            else {
                                                console.log(chalk.green("Bazar actualizado:"));
                                                console.log(doc);
                                                res.status(200);
                                                res.send(doc);
                                            }
                                        });
                                    }
                                    else {
                                        res.sendStatus(400);
                                    }     
                                }
                            });
                        }
                    });
                } 
                else {
                    res.sendStatus(400);
                }
            }
        });
    } 
});

app.post('/api/apartar', (req, res) => {
    let complete_token = req.body.usuario_token;
    let imagen = req.body.imagen;
    
    if(complete_token == undefined || imagen == undefined) {
        res.sendStatus(400);
    }
    else {
        let id_token;

        for(let i = 11 ; complete_token[i] != '-' ; i++) {
            id_token = i;
        }

        id_token = complete_token.substring(11, id_token + 1);

        Product.find({
            imagen: {$regex: imagen}
        }, function (err, docs) {
            let temp = docs[0];

            if(temp == undefined || temp.stock == 0) {
                res.status(400);
                res.send("Usuario invalido para agregar a carrito.");
            }
            else {
                Brand.find({
                    marca: {$regex: temp.marca}
                }, function (err, docs) {
                    let marca = docs[0];

                    temp.stock -= 1;

                    if(marca.apartado == undefined) {
                        marca.apartado = [];
                    } 

                    marca.apartado.push({"producto": temp.id, "usuario": id_token});
                    console.log(marca);

                    Brand.findByIdAndUpdate(marca.id, marca, {new: true}, (err, doc) => {
                        if(err) {
                            console.log("Error: " + err);
                            res.send(err);
                        }
                        else {
                            console.log(chalk.green("Marca actualizada:"));
                            console.log(doc);

                            Product.findByIdAndUpdate(temp.id, temp, {new: true}, (err, doc) => {
                                if(err) {
                                    console.log("Error: " + err);
                                    res.send(err);
                                }
                                else {
                                    console.log(chalk.green("Producto actualizado:"));
                                    console.log(doc);
                                    res.status(200);
                                    res.send(doc);
                                }
                            });
                        }
                    });
                });
            }
        });
    } 
});

app.put('/api/comprar', (req, res) => {
    let complete_token = req.body.usuario_token;

    if(complete_token == undefined) {
        res.sendStatus(400);
    }
    else {
        let id_token, index;

        for(let i = 11 ; complete_token[i] != '-' ; i++) {
            index = i;
        }

        id_token = complete_token.substring(11, index + 1);

        let tipo = complete_token.substring(index + 2, complete_token.length);
        console.log(tipo);

        if(tipo == 'user') {
            User.findById(id_token, (err, docs) => {
                if(err) {
                    console.log("Error: " + err);
                    res.send(err);
                }
                else {
                    let user = docs;

                    if(user.historial == undefined) {
                        user.historial = [];
                    }

                    for(let i = 0 ; i < user.carrito.length ; i++) {
                        user.historial.push(user.carrito[i]);
                    }
    
                    user.carrito = [];

                    User.findByIdAndUpdate(user.id, user, {new: true}, (err, doc) => {
                        if(err) {
                            console.log("Error: " + err);
                            res.send(err);
                        }
                        else {
                            console.log(chalk.green("Carrito actualizado:"));
                            console.log(doc);
                            res.status(200);
                            res.send(doc);
                        }
                    });
                }
            });
        }
        else if(tipo == 'marca') {
            Brand.findById(id_token, (err, docs) => {
                if(err) {
                    console.log("Error: " + err);
                    res.send(err);
                }
                else {
                    let user = docs;
    
                    if(user.historial == undefined) {
                        user.historial = [];
                    }

                    for(let i = 0 ; i < user.carrito.length ; i++) {
                        user.historial.push(user.carrito[i]);
                    }
    
                    user.carrito = [];

                    Brand.findByIdAndUpdate(user.id, user, {new: true}, (err, doc) => {
                        if(err) {
                            console.log("Error: " + err);
                            res.send(err);
                        }
                        else {
                            console.log(chalk.green("Carrito actualizado:"));
                            console.log(doc);
                            res.status(200);
                            res.send(doc);
                        }
                    });
                }
            });
        }
        else if(tipo == 'bazar') {
            Bazaar.findById(id_token, (err, docs) => {
                if(err) {
                    console.log("Error: " + err);
                    res.send(err);
                }
                else {
                    let user = docs;
    
                    if(user.historial == undefined) {
                        user.historial = [];
                    }

                    for(let i = 0 ; i < user.carrito.length ; i++) {
                        user.historial.push(user.carrito[i]);
                    }
    
                    user.carrito = [];

                    Bazaar.findByIdAndUpdate(user.id, user, {new: true}, (err, doc) => {
                        if(err) {
                            console.log("Error: " + err);
                            res.send(err);
                        }
                        else {
                            console.log(chalk.green("Carrito actualizado:"));
                            console.log(doc);
                            res.status(200);
                            res.send(doc);
                        }
                    });
                }
            });
        }
        else {
            ServerResponse.sendStatus(400);
        }
    }
});

app.put('/api/users', (req, res) => {
    console.log(chalk.blue("Actualizando información..."));

    let complete_token = req.body.usuario_token;
    let ruta = req.body.ruta;

    if(complete_token == undefined || ruta == undefined) {
        res.sendStatus(400);
    }
    else {
        let id_token, index;

        for(let i = 11 ; complete_token[i] != '-' ; i++) {
            index = i;
        }

        id_token = complete_token.substring(11, index + 1);

        let tipo = complete_token.substring(index + 2, complete_token.length);

        let extension = ruta.substr(ruta.lastIndexOf("."))

        let new_path = "images/" + id_token + extension;
        let complete_path = "views/" + new_path;
        ruta = "views/" + ruta;

        fs.rename(ruta, complete_path, function (errorRename) {
            if(errorRename) {
                throw errorRename;
                // console.log("No se pudo actualizar");
                // res.status(400);
                // res.send(errorRename);
            }
            else {
                if(tipo == 'user') {
                    User.findById(id_token, (err, docs) => {
                        if(err) {
                            console.log("Error: " + err);
                            res.send(err);
                        }
                        else {
                            let user = docs;
        
                            user.imagen = new_path;
        
                            User.findByIdAndUpdate(user.id, user, {new: true}, (err, doc) => {
                                if(err) {
                                    console.log("Error: " + err);
                                    res.send(err);
                                }
                                else {
                                    console.log(chalk.green("Perfil actualizado:"));
                                    console.log(doc);
                                    res.status(200);
                                    res.send(doc);
                                }
                            });
                        }
                    });
                }
                else if(tipo == 'marca') {
                    Brand.findById(id_token, (err, docs) => {
                        if(err) {
                            console.log("Error: " + err);
                            res.send(err);
                        }
                        else {
                            let user = docs;
            
                            user.logo = new_path;
        
                            Brand.findByIdAndUpdate(user.id, user, {new: true}, (err, doc) => {
                                if(err) {
                                    console.log("Error: " + err);
                                    res.send(err);
                                }
                                else {
                                    console.log(chalk.green("Perfil actualizado:"));
                                    console.log(doc);
                                    res.status(200);
                                    res.send(doc);
                                }
                            });
                        }
                    });
                }
                else if(tipo == 'bazar') {
                    Bazaar.findById(id_token, (err, docs) => {
                        if(err) {
                            console.log("Error: " + err);
                            res.send(err);
                        }
                        else {
                            let user = docs;
            
                            user.logo = new_path;
        
                            Bazaar.findByIdAndUpdate(user.id, user, {new: true}, (err, doc) => {
                                if(err) {
                                    console.log("Error: " + err);
                                    res.send(err);
                                }
                                else {
                                    console.log(chalk.green("Perfil actualizado:"));
                                    console.log(doc);
                                    res.status(200);
                                    res.send(doc);
                                }
                            });
                        }
                    });
                }
                else {
                    res.sendStatus(400);
                }
            }
        });
    }
});

app.put('/api/products', (req, res) => {
    console.log(chalk.blue("Actualizando información..."));

    let id = req.body.product;
    let ruta = req.body.ruta;

    if(id == undefined || ruta == undefined) {
        res.sendStatus(400);
    }
    else {
        let extension = ruta.substr(ruta.lastIndexOf("."))

        let new_path = "images/" + id + extension;
        let complete_path = "views/" + new_path;
        ruta = "views/" + ruta;

        fs.rename(ruta, complete_path, function (errorRename) {
            if(errorRename) {
                throw errorRename;
            }
            else {
                Product.findById(id, (err, docs) => {
                    if(err) {
                        console.log("Error: " + err);
                        res.send(err);
                    }
                    else {
                        let product = docs;
    
                        product.imagen = new_path;
    
                        Product.findByIdAndUpdate(product.id, product, {new: true}, (err, doc) => {
                            if(err) {
                                console.log("Error: " + err);
                                res.send(err);
                            }
                            else {
                                console.log(chalk.green("Producto actualizado:"));
                                console.log(doc);
                                res.status(200);
                                res.send(doc);
                            }
                        });
                    }
                });
            }
        });
    }
});

app.post('/api/categorias', (req, res) => {
    let complete_token = req.body.usuario_token;

    if(complete_token == undefined) {
        res.sendStatus(400);
    }
    else {
        let id_token, index;

        for(let i = 11 ; complete_token[i] != '-' ; i++) {
            index = i;
        }

        id_token = complete_token.substring(11, index + 1);

        let tipo = complete_token.substring(index + 2, complete_token.length);

        if(tipo == 'user') {
            User.find({
            }, function (err, docs) {
                let temp;
                for(let i = 0 ; i < docs.length ; i++){
                    if(docs[i].id == id_token) {
                        temp = docs[i];
                    }
                }
        
                if(temp == undefined) {
                    res.status(400);
                    res.send("No se encontro el usuario.");
                }
                else{
                    res.status(200);
                    res.send(temp.categorias);
                }
            });
        }
        else {
            res.status(200);
            res.send("No es un tipo user."); 
        }
    }
});

app.get('/api/productos/:nombre', (req, res) => {
    let texto = req.params.nombre;
    if(texto != undefined){
        let arregloProductos = [];

        Product.find({
            
        }, function (err, docs){
            if(err){
                console.log(chalk.red("NO SE ENCONTRARON PRODUCTOS CON EL FILTRO"));
                res.sendStatus(404);

            }else{
                for(let i = 0; i < docs.length; i++) {
                    if(docs[i].nombre.toLowerCase().includes(texto.toLowerCase()))
                        arregloProductos.push(docs[i]);
                }
                res.status(200);
                res.send(arregloProductos);
            }
        });

    }else{
        console.log(chalk.red("NO SE INGRESÓ UN TEXTO!!"));
        res.sendStatus(401);
    }
});

app.get('/api/productos_:categoria', (req, res) => {
    let categoria = req.params.categoria;
    if(categoria != undefined){
        Brand.find({
            categoria: {$regex: categoria}
        }, function (err, docs){
            if(err){
                console.log(chalk.red("NO SE ENCONTRARON BRANDS DE ESA CATEGORÍA"));
                res.sendStatus(404);

            }else{
                res.status(200);
                res.send(docs);
            }
        });

    }else{
        console.log(chalk.red("NO SE INGRESÓ CATEGORÍA!!"));
        res.sendStatus(401);
    }
});
