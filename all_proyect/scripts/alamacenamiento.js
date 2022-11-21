"use strict";
let url = "http://localhost:3000/api/users";
let url_login = "http://localhost:3000/api/login";

function loadJSON(urlJSON, cbOk, cbErr) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', urlJSON);
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) { 
            cbErr();
            info.innerHTML = "";
        } else {
            let datos = JSON.parse(xhr.response); 
            cbOk(datos);
            console.log(datos); 
        }
    };
}

function guardarEnJSON(user, url) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(user));
    xhr.onload = function () {
        if (xhr.status != 201) { 
            console.log("No se pudo generar el archivo.");
            alert("Ya existe un usuario con ese correo.");
        } else { 
            // loadJSON(url, cbOk, cbErr);
            console.log(xhr.responseText); 
            localStorage.setItem("token", xhr.responseText);
            alert("Se creo el usuario correctamente.");
        }
    };
}

function loginJSON(data, url) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
    xhr.onload = function () {
        if (xhr.status == 201 || xhr.status == 200) { 
            localStorage.setItem("token", xhr.responseText);
            let temp = "http://localhost:3000/api/users/";
            temp += data.correo;
            localStorage.setItem("temp", temp);
            window.location.href = "index.html";
            
        } else {
            alert("No se pudo iniciar sesión.");
        }
    };
}

function loadLoginUser(urlJSON, cbOk, cbErr) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', urlJSON);
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) { 
            cbErr();
            info.innerHTML = "";
        } else {
            let datos = [];
            datos.push(JSON.parse(xhr.response)); 
            cbOk(datos);
            console.log(datos); 
        }
    };
}

window.onload = function () {
    var path = window.location.pathname;
    var page = path.split("/").pop();

    if(page == 'login.html') {
        localStorage.clear();
    }
    else if(localStorage.token != undefined) {
        loadLoginUser(localStorage.temp, cbOk, cbErr);
        alert("Se inicio sesión correctamente.");
    }
}

function putJSON(user, url) {
    let xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(user));
    xhr.onload = function () {
        if (xhr.status != 201) { 
            console.log("No se pudo generar el archivo.");
        } else { 
            loadJSON("http://localhost:3000/api/users", cbOk, cbErr);
            console.log(xhr.responseText);
            flag_update = true;
        }
    };
}

function deleteJSON(url) {
    let xhr = new XMLHttpRequest();
    xhr.open('DELETE', url);
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 201) { 
            console.log("No se pudo generar el archivo.");
        } else { 
            loadJSON("http://localhost:3000/api/users", cbOk, cbErr);
            console.log(xhr.responseText); 
        }
    };
}