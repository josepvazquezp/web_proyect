var watchId;   
var mapa = null;
var mapaMarcador = null;  

let url = "http://localhost:3000/api/users";
let url_login = "http://localhost:3000/api/login";

let flag_user = false;

function loadLogin(urlJSON, user) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', urlJSON);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(user));
    xhr.onload = function () {
        if (xhr.status != 201) { 
            alert("Correo o password incorrecto.");
        } else {
            localStorage.setItem("token", xhr.responseText); 
            alert("Sesion inicada correctamente.");
            showNav();

            let path = window.location.pathname;

            let actual = path.split("/").pop();

            if(localStorage.getItem("token") && (actual == "" || actual == "home")) {
                displayFavoritos();
    }
        }
    };
}

function guardarEnJSON(user, url) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(user));
    localStorage.setItem("register", true);
    localStorage.setItem("correo", user.correo);
    localStorage.setItem("password", user.password);
    xhr.onload = function () {
        if (xhr.status != 201) { 
            console.log("No se pudo generar el archivo.");
            alert("Ya existe un usuario con ese correo.");
        } else { 
            alert("Se creo el usuario correctamente.");
        }
    };
}

window.onload = function () {
    showNav();

    let path = window.location.pathname;

    let actual = path.split("/").pop();

    if(localStorage.getItem("token") && (actual == "" || actual == "home")) {
        displayFavoritos();
    }

    if(localStorage.getItem("register") != undefined) {
        localStorage.removeItem("register");

        let temp = {"correo": localStorage.getItem("correo"), "password": localStorage.getItem("password")};
        console.log(temp);
        loadLogin(url_login, temp);

        localStorage.removeItem("correo");
        localStorage.removeItem("password");
        
        $("#modalFoto").modal();
    }
    else if(localStorage.getItem("extension") != undefined) {
        let extension = localStorage.getItem("extension");
        let xhr = new XMLHttpRequest();
        xhr.open('PUT', "http://localhost:3000/api/users");
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({"usuario_token": localStorage.getItem("token"), "ruta": "uploads/temp" + extension}));
        xhr.onload = function () {
            if (xhr.status != 200) { 
                alert("No se puedo actualizar la foto de perfil.");
            } else {
                // alert("Actrualizando imagen ...");
                showNav();
            }
        };

        localStorage.removeItem("extension");
        // showNav();
    }
}

// function putJSON(user, url) {
//     let xhr = new XMLHttpRequest();
//     xhr.open('PUT', url);
//     xhr.setRequestHeader('Content-Type', 'application/json');
//     xhr.send(JSON.stringify(user));
//     xhr.onload = function () {
//         if (xhr.status != 201) { 
//             console.log("No se pudo generar el archivo.");
//         } else { 
//             loadJSON("http://localhost:3000/api/users", cbOk, cbErr);
//             console.log(xhr.responseText);
//             flag_update = true;
//         }
//     };
// }

// function deleteJSON(url) {
//     let xhr = new XMLHttpRequest();
//     xhr.open('DELETE', url);
//     xhr.send();
//     xhr.onload = function () {
//         if (xhr.status != 201) { 
//             console.log("No se pudo generar el archivo.");
//         } else { 
//             loadJSON("http://localhost:3000/api/users", cbOk, cbErr);
//             console.log(xhr.responseText); 
//         }
//     };
// }

function showMap() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(mostrarPosicion, mostrarErrores, opciones);   
    } else {
        alert("Tu navegador no soporta la geolocalización, actualiza tu navegador.");
    } 
}

function mostrarPosicion(posicion) {
    var latitud = posicion.coords.latitude;
    var longitud = posicion.coords.longitude;
    var precision = posicion.coords.accuracy;

    var miPosicion = new google.maps.LatLng(latitud, longitud);

    // Se comprueba si el mapa se ha cargado ya 
    if (mapa == null) {
        // Crea el mapa y lo pone en el elemento del DOM con ID mapa
        var configuracion = {center: miPosicion, zoom: 16, mapTypeId: google.maps.MapTypeId.HYBRID};
        mapa = new google.maps.Map(document.getElementById("mapa"), configuracion);

        // Crea el marcador en la posicion actual
        mapaMarcador = new google.maps.Marker({position: miPosicion, title:"Esta es tu posición"});
        mapaMarcador.setMap(mapa);
    } else {
        // Centra el mapa en la posicion actual
        mapa.panTo(miPosicion);
        // Pone el marcador para indicar la posicion
        mapaMarcador.setPosition(miPosicion);
    }
}

function mostrarErrores(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert('Permiso denegado por el usuario'); 
            break;
        case error.POSITION_UNAVAILABLE:
            alert('Posición no disponible');
            break; 
        case error.TIMEOUT:
            alert('Tiempo de espera agotado');
            break;
        default:
            alert('Error de Geolocalización desconocido :' + error.code);
    }
}

var opciones = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 1000
};

function detener() {
    navigator.geolocation.clearWatch(watchId);
}

function showNav() {
    let token = localStorage.getItem("token");

    if(token == undefined) {
        show.innerHTML = '<ul class="navbar-nav navbar-right mt-2 mt-lg-0"><li class="nav-item"><a class="nav-link" href="#" data-toggle="modal" data-target="#modalAccount"><i class="fa fa-user-circle"></i> Registrarse</a></li><li class="nav-item"><a class="nav-link" href="#" data-toggle="modal" data-target="#modalLogin"><i class="fa fa-sign-in"></i> Iniciar Sesión</a></li></ul>';   
        
        if(flag_user) {
            flag_user = false;

            setTimeout(function() {
                alert("Se ha cerrado tu sesion.");
            }, 2000);
        }
    }
    else {
        let url_temp = "http://localhost:3000/api/user/" + token;
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url_temp);
        xhr.send();
        xhr.onload = function () {
            if (xhr.status != 200) { 
                alert("Hubo un error intenta más tarde.");
            } 
            else {
                let user = JSON.parse(xhr.responseText);
                flag_user = true;

                if(user.tipo == 'marca') {
                    show.innerHTML = '<ul class="navbar-nav navbar-right mt-2 mt-lg-0"><li class="nav-item"><table width="100%"><tr><td><li class="nav-item dropdown"><a class="nav-link" href="#" id="navbarDropdown2" role="button" aria-haspopup="true" aria-expanded="false"  data-toggle="modal" data-target="#modalProduct"><i class="fa fa-upload" aria-hidden="true"></i> Agregar producto</a></li></td><td><li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + user.marca + '&nbsp; &nbsp;<img class="rounded-circle" src="' + user.logo + '" height="30" widht="15"></a><div class="dropdown-menu" aria-labelledby="navbarDropdown2"><a class="dropdown-item" href="#" data-toggle="modal" data-target="#modalFoto">Cambiar foto de perfil</a><a class="dropdown-item" href="#" onclick="logOut();">Cerrar sesión</a></div></li></td><td><li class="nav-item dropdown"><a class="nav-link" href="#" id="navbarDropdown2" role="button" aria-haspopup="true" aria-expanded="false"  data-toggle="modal" data-target="#modalShop"><i class="fa fa-shopping-cart" aria-hidden="true"></i></a></li></td></tr></table></li></ul>';
                }
                else if(user.tipo == 'bazar') {
                    show.innerHTML = '<ul class="navbar-nav navbar-right mt-2 mt-lg-0"><li class="nav-item"><table width="100%"><tr><td><li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + user.bazar + '&nbsp; &nbsp;<img class="rounded-circle" src="' + user.logo + '" height="30" widht="15"></a><div class="dropdown-menu" aria-labelledby="navbarDropdown2"><a class="dropdown-item" href="#" data-toggle="modal" data-target="#modalFoto">Cambiar foto de perfil</a><a class="dropdown-item" href="#" onclick="logOut();">Cerrar sesión</a></div></li></td><td><li class="nav-item dropdown"><a class="nav-link" href="#" id="navbarDropdown2" role="button" aria-haspopup="true" aria-expanded="false"  data-toggle="modal" data-target="#modalShop"><i class="fa fa-shopping-cart" aria-hidden="true"></i></a></li></td></tr></table></li></ul>'; 
                }
                else if(user.tipo == 'user') {
                    user.imagen = user.imagen == null? "images/kirby_logo.png" : user.imagen;
                    show.innerHTML = '<ul class="navbar-nav navbar-right mt-2 mt-lg-0"><li class="nav-item"><table width="100%"><tr><td><li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + user.correo + '&nbsp; &nbsp;<img class="rounded-circle" src="' + user.imagen + '" height="30" widht="15"></a><div class="dropdown-menu" aria-labelledby="navbarDropdown2"><a class="dropdown-item" href="#" data-toggle="modal" data-target="#modalFoto">Cambiar foto de perfil</a><a class="dropdown-item" href="#" onclick="logOut();">Cerrar sesión</a></div></li></td><td><li class="nav-item dropdown"><a class="nav-link" href="#" id="navbarDropdown2" role="button" aria-haspopup="true" aria-expanded="false"  data-toggle="modal" data-target="#modalShop"><i class="fa fa-shopping-cart" aria-hidden="true"></i></a></li></td></tr></table></li></ul>';
                }
            }
        };
    }
    
}

function logOut() {
    localStorage.clear();
    showNav();
}

function showContent() {
    let element = document.getElementById("m_categories");
    let el_marca = document.getElementById("m_marcas");
    let el_bazar = document.getElementById("m_bazar");
    let user = document.getElementById("user_count");
    let bazar = document.getElementById("bazar_count");
    let marca = document.getElementById("marca_count");

    let nombre_m = document.getElementById("account_marca");
    let url_m = document.getElementById("account_insta");

    let nombre_b = document.getElementById("account_bazar");
    let url_b = document.getElementById("account_url_b");

    if(user.checked) {
        element.style.display='block';
        el_marca.style.display='none';
        el_bazar.style.display='none';

        if(nombre_m.hasAttribute("required")) {
            nombre_m.removeAttribute("required");
        }

        if(url_m.hasAttribute("required")) {
            url_m.removeAttribute("required");
        }

        if(nombre_b.hasAttribute("required")) {
            nombre_b.removeAttribute("required");
        }

        if(url_b.hasAttribute("required")) {
            url_b.removeAttribute("required");
        }
    }
    else if(marca.checked) {
        element.style.display='none';
        el_marca.style.display="block";
        el_bazar.style.display='none';

        nombre_m.setAttribute('required', '');
        url_m.setAttribute('required', '');

        if(nombre_b.hasAttribute("required")) {
            nombre_b.removeAttribute("required");
        }

        if(url_b.hasAttribute("required")) {
            url_b.removeAttribute("required");
        }
    }
    else if(bazar.checked) {
        element.style.display='none';
        el_marca.style.display="none";
        el_bazar.style.display='block';

        if(nombre_m.hasAttribute("required")) {
            nombre_m.removeAttribute("required");
        }

        if(url_m.hasAttribute("required")) {
            url_m.removeAttribute("required");
        }

        nombre_b.setAttribute('required', '');
        url_b.setAttribute('required', '');
    }
}

function readRegister() {
    let nombre = document.getElementById("account_nombre").value;
    let apellido = document.getElementById("account_apellido").value;
    let correo = document.getElementById("account_correo").value;
    let password = document.getElementById("account_password_1").value;
    let comp_password = document.getElementById("account_password_2").value;
    let fecha = document.getElementById("account_fecha").value;

    if(password == comp_password) {
        let user = document.getElementById("user_count");
        let bazar = document.getElementById("bazar_count");
        let marca = document.getElementById("marca_count");

        if(user.checked) {
            let hogar = document.getElementById("exCheck1");
            let belleza = document.getElementById("exampleCheck2");
            let calzado = document.getElementById("exampleCheck3");
            let ropa = document.getElementById("exampleCheck4");
            let joyeria = document.getElementById("exampleCheck5");
            let deporte = document.getElementById("exampleCheck6");
            let arte = document.getElementById("exampleCheck7");
            let cocina = document.getElementById("exampleCheck8");
            let bebe = document.getElementById("exampleCheck9");
            let mascotas = document.getElementById("exampleCheck10");

            if( hogar.checked || belleza.checked || calzado.checked || 
                ropa.checked || joyeria.checked || deporte.checked ||
                arte.checked || cocina.checked || bebe.checked ||
                mascotas.checked) {
                let temp = [];

                if(hogar.checked) {
                    temp.push("hogar");
                }

                if(belleza.checked){
                    temp.push("belleza");
                }

                if(calzado.checked){
                    temp.push("calzado");
                }

                if(ropa.checked){
                    temp.push("ropa");
                }

                if(joyeria.checked){
                    temp.push("joyeria");
                }

                if(deporte.checked){
                    temp.push("deporte");
                }

                if(arte.checked){
                    temp.push("arte");
                }

                if(cocina.checked){
                    temp.push("cocina");
                }

                if(bebe.checked){
                    temp.push("bebe");
                }

                if(mascotas.checked){
                    temp.push("mascotas");
                }

                let user = {"nombre": nombre, 
                            "apellido": apellido, 
                            "correo": correo,
                            "password": password,
                            "fecha": fecha,
                            "categorias": temp,
                            "tipo": "user"};

                guardarEnJSON(user, url);

                alert("Procesando datos...");
            }
        }
        else if(marca.checked) {
            let nombre_m = document.getElementById("account_marca").value;
            let url_m = document.getElementById("account_insta").value;
            let categoria = document.getElementById("account_c_m").value;

            let user = {"nombre": nombre, 
                        "apellido": apellido, 
                        "correo": correo,
                        "password": password,
                        "fecha": fecha,
                        "marca": nombre_m,
                        "logo": "images/kirby_logo.png",
                        "categoria": categoria,
                        "url": url_m,
                        "tipo": "marca"};

            guardarEnJSON(user, url);
        }
        else if(bazar.checked) {
            let nombre_b = document.getElementById("account_bazar").value;
            let url_b = document.getElementById("account_url_b").value;

            let user = {"nombre": nombre, 
                        "apellido": apellido, 
                        "correo": correo,
                        "password": password,
                        "fecha": fecha,
                        "bazar": nombre_b,
                        "logo": "images/kirby_logo.png",
                        "url": url_b,
                        "tipo": "bazar"};

            guardarEnJSON(user, url);
        }
        else {
            alert("datos de usuario mal ingresados");    
        }
    }
    else {
        alert("Las contraseñas no coinciden.");
    }

}

function readLogin() {
    let email = document.getElementById("login_email").value;
    let password = document.getElementById("login_password").value;

    let user = {"correo": email,
                "password": password};

    loadLogin(url_login, user);
}

function readFoto() {
    let extension = document.getElementById("archive").value;
    extension = extension.substr(extension.lastIndexOf("."));
    localStorage.setItem("extension", extension);
}

function displayFavoritos() {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', "http://localhost:3000/api/categorias");
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({"usuario_token": localStorage.getItem("token")}));
    xhr.onload = function () {
        if (xhr.status != 200) { 
            console.log("No es tipo user.");
        } else { 
            let categorias = JSON.parse(xhr.responseText); 
            showFavoritos(categorias);        
        }
    };
}

function showFavoritos(categorias) {
    let l = categorias.length;
    console.log(l);
    let favoritos = document.getElementById("favoritos");
    favoritos.innerHTML = "";

    let title = document.createElement("h4");
    title.className = "cat";
    title.align = "center";
    title.innerHTML = "Favoritos <br> <br>";

    favoritos.appendChild(title);

    let table = document.createElement("table");
    table.width = "98%";
    let tr = document.createElement("tr");

    for(let i = 0 ; i < l ; i++) {
        if( i == 5) {
            table.appendChild(tr);
            tr = document.createElement("tr");
        }

        let td = document.createElement("td");
        td.align = "center";
        
        switch(categorias[i]) {
            case "hogar": td.innerHTML = "<h5>Hogar</h5><a href='marcas'><img src='images/c1.jpg' height='300' width='200'></a>";
                          break;
            case "belleza": td.innerHTML = "<h5>Belleza y cuidado</h5><a href='marcas'><img src='images/c2.jpg' height='300' width='200'></a>";
                            break;
            case "calzado": td.innerHTML = "<h5>Calzado</h5><a href='marcas'><img src='images/c3.jpg' height='300' width='200'></a>";
                            break;
            case "ropa": td.innerHTML = "<h5>Ropa</h5><a href='marcas'><img src='images/c4.jpg' height='300' width='200'></a>";
                         break;       
            case "joyeria": td.innerHTML = "<h5>Joyería</h5><a href='marcas'><img src='images/c5.jpg' height='300' width='200'></a>";
                            break;
            case "deporte": td.innerHTML = "<h5>Deporte, al aire libre</h5><a href='marcas'><img src='images/c6.jpg' height='300' width='200'></a>";
                            break;
            case "arte": td.innerHTML = "<h5>Arte</h5><a href='marcas'><img src='images/c7.jpg' height='300' width='200'></a>";
                         break;
            case "cocina": td.innerHTML = "<h5>Cocina</h5><a href='marcas'><img src='images/c8.jpg' height='300' width='200'></a>";
                           break;
            case "bebe": td.innerHTML = "<h5>Bebe</h5><a href='marcas'><img src='images/c9.jpg' height='300' width='200'></a>";
                         break;
            case "mascotas": td.innerHTML = "<h5>Mascotas</h5><a href='marcas'><img src='images/c10.jpg' height='300' width='200'></a>";
                             break;
            default: td.innerHTML = "";
        }

        tr.appendChild(td);
    }

    table.appendChild(tr);

    favoritos.appendChild(table);
}