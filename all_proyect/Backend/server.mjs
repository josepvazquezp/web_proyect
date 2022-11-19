import mongoose from "mongoose";
import express from 'express';
import chalk from 'chalk';
import * as fs from 'node:fs';
import cors from 'cors';

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
               require: false}
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
    image: {type: String,
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
            if(req.body.tipo == 'user') {
                let newUser = {nombre: req.body.nombre, apellido: req.body.apellido, correo: req.body.correo, password: req.body.password, fecha: req.body.fecha, categorias: req.body.categorias, tipo: req.body.tipo};
                let user = User(newUser);
                user.save().then((doc) => console.log(chalk.green("Usuario creado: ") + doc));
            }
            else if(req.body.tipo == 'marca') {
                let newUser = {nombre: req.body.nombre, apellido: req.body.apellido, correo: req.body.correo, password: req.body.password, fecha: req.body.fecha, tipo: req.body.tipo, marca: req.body.marca, logo: req.body.logo, categoria: req.body.categoria};
                let user = Brand(newUser);
                user.save().then((doc) => console.log(chalk.green("Usuario creado: ") + doc));
            }
            else if(req.body.tipo == 'bazar'){
                let newUser = {nombre: req.body.nombre, apellido: req.body.apellido, correo: req.body.correo, password: req.body.password, fecha: req.body.fecha, tipo: req.body.tipo, bazar: req.body.bazar, logo: req.body.logo, url: req.body.url};
                let user = Bazaar(newUser);
                user.save().then((doc) => console.log(chalk.green("Usuario creado: ") + doc));
            }
            else {
                res.sendStatus(401);
            }
            
        }
        else {
            res.sendStatus(401);
        }
    });

    
});

app.get('/api/users/:email', (req, res) => {
    let email = req.params.email;
    
    User.find({
        correo: {$regex: email}
    }, function (err, docs) {
        res.send(docs);
    });
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
