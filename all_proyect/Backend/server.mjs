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
    image: {type: String,
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
            required: true},
    categoria: {type: String,
                required: true},
    stock: {type: Number,
            required: true},
    marca: {type: String,
            required: true},
    logo: {type: String,
           required: true}
});

let Product = mongoose.model('products', productsSchema);

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

app.post('/api/products/:email', (req, res) => {
    let email = req.params.email;

    Brand.find({
        correo: {$regex: email}
    }, function (err, docs) {
        if(docs.length == 1) {
            let marca = docs[0].marca;
            let logo = docs[0].logo;

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
        
                    if(req.body.imagen == undefined) {
                        if(flag) {
                            message += "imagen";
                        }
                        else {
                            message += ", imagen";
                        }
        
                        flag = false;
                    }
        
                    message += ".";
        
                    if(!flag) {
                        res.status(400);
                        res.send(message);
                    }
                    else {
                        let newUser = {local_id: local_id, nombre: req.body.nombre, precio: req.body.precio, categoria: req.body.categoria, stock: req.body.stock, descripcion: req.body.descripcion, imagen: req.body.imagen, marca: marca, logo: logo};
                        let user = Product(newUser);
                        user.save().then((doc) => console.log(chalk.green("Producto creado: ") + doc));
                        res.sendStatus(201);
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

app.get('/api/login', (req, res) => {
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

// actualización de usuario pendiente
app.put('/api/users', (req, res) => {
    console.log(chalk.blue("Actualizando información..."));

    let nombre = req.body.nombre,
        correo = req.body.correo,
        sexo = req.body.sexo,
        object_to_update = {},
        flag_updated = false;
    
    if(nombre != undefined) {
        object_to_update.nombre = nombre;
        flag_updated = true;
    }

    if(correo != undefined) {
        object_to_update.correo = correo;
        flag_updated = true;
    }

    if(sexo != undefined) {
        object_to_update.sexo = sexo;
        flag_updated = true;
    }

    if(flag_updated) {
        User.findByIdAndUpdate(id, object_to_update, {new: true}, (err, doc) => {
            if(err) {
                console.log("Error: " + err);
                res.send(err);
            }
            else {
                console.log(chalk.green("Usuario actualizado:"));
                console.log(doc);
                res.send(doc);
            }
        });
    }
    else {
        res.send("No se ha actualizado");
    }
});

// delete pendiente
app.delete('/api/users', (req, res) => {
    console.log(chalk.blue("Actualizando información..."));

    let id = req.body.id;
    
    User.findByIdAndDelete(id, (err, doc) => {
        if(err) {
            console.log("Error: " + err);
            res.send(err);
        }
        else {
            console.log(chalk.green("Usuario eliminado:"));
            console.log(doc);
            res.send(doc);
        }
    });
});
