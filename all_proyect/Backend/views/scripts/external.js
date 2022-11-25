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

// function loginJSON(data, url) {
//     let xhr = new XMLHttpRequest();
//     xhr.open('POST', url);
//     xhr.setRequestHeader('Content-Type', 'application/json');
//     xhr.send(JSON.stringify(data));
//     xhr.onload = function () {
//         if (xhr.status == 201 || xhr.status == 200) { 
//             localStorage.setItem("token", xhr.responseText);
//             let temp = "http://localhost:3000/api/users/";
//             temp += data.correo;
//             localStorage.setItem("temp", temp);
//             window.location.href = "index.html";
            
//         } else {
//             alert("No se pudo iniciar sesión.");
//         }
//     };
// }

// function loadLoginUser(urlJSON, cbOk, cbErr) {
//     let xhr = new XMLHttpRequest();
//     xhr.open('GET', urlJSON);
//     xhr.send();
//     xhr.onload = function () {
//         if (xhr.status != 200) { 
//             cbErr();
//             info.innerHTML = "";
//         } else {
//             let datos = [];
//             datos.push(JSON.parse(xhr.response)); 
//             cbOk(datos);
//             console.log(datos); 
//         }
//     };
// }

window.onload = function () {
    showNav();

    if(localStorage.getItem("register") != undefined) {
        localStorage.removeItem("register");

        let temp = {"correo": localStorage.getItem("correo"), "password": localStorage.getItem("password")};
        console.log(temp);
        loadLogin(url_login, temp);

        localStorage.removeItem("correo");
        localStorage.removeItem("password");
        
        $("#modalFoto").modal();
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
        console.log(url_temp);
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
                    user.image = user.image == null? "images/kirby_logo.png" : user.image;
                    show.innerHTML = '<ul class="navbar-nav navbar-right mt-2 mt-lg-0"><li class="nav-item"><table width="100%"><tr><td><li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + user.correo + '&nbsp; &nbsp;<img class="rounded-circle" src="' + user.image + '" height="30" widht="15"></a><div class="dropdown-menu" aria-labelledby="navbarDropdown2"><a class="dropdown-item" href="#" data-toggle="modal" data-target="#modalFoto">Cambiar foto de perfil</a><a class="dropdown-item" href="#" onclick="logOut();">Cerrar sesión</a></div></li></td><td><li class="nav-item dropdown"><a class="nav-link" href="#" id="navbarDropdown2" role="button" aria-haspopup="true" aria-expanded="false"  data-toggle="modal" data-target="#modalShop"><i class="fa fa-shopping-cart" aria-hidden="true"></i></a></li></td></tr></table></li></ul>';
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
    let logo_m = document.getElementById("account_logo_m");
    let url_m = document.getElementById("account_insta");

    let nombre_b = document.getElementById("account_bazar");
    let logo_b = document.getElementById("account_logo_b");
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

        if(logo_m.hasAttribute("required")) {
            logo_m.removeAttribute("required");
        }

        if(nombre_b.hasAttribute("required")) {
            nombre_b.removeAttribute("required");
        }

        if(url_b.hasAttribute("required")) {
            url_b.removeAttribute("required");
        }

        if(logo_b.hasAttribute("required")) {
            logo_b.removeAttribute("required");
        }
    }
    else if(marca.checked) {
        element.style.display='none';
        el_marca.style.display="block";
        el_bazar.style.display='none';

        nombre_m.setAttribute('required', '');
        logo_m.setAttribute('required', '');
        url_m.setAttribute('required', '');

        if(nombre_b.hasAttribute("required")) {
            nombre_b.removeAttribute("required");
        }

        if(url_b.hasAttribute("required")) {
            url_b.removeAttribute("required");
        }

        if(logo_b.hasAttribute("required")) {
            logo_b.removeAttribute("required");
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

        if(logo_m.hasAttribute("required")) {
            logo_m.removeAttribute("required");
        }

        nombre_b.setAttribute('required', '');
        logo_b.setAttribute('required', '');
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
            let logo_m = document.getElementById("account_logo_m").value;
            let url_m = document.getElementById("account_insta").value;
            let categoria = document.getElementById("account_c_m").value;

            let user = {"nombre": nombre, 
                        "apellido": apellido, 
                        "correo": correo,
                        "password": password,
                        "fecha": fecha,
                        "marca": nombre_m,
                        "logo": logo_m,
                        "categoria": categoria,
                        "url": url_m,
                        "tipo": "marca"};

            alert(JSON.stringify(user));
        }
        else if(bazar.checked) {
            let nombre_b = document.getElementById("account_bazar").value;
            let logo_b = document.getElementById("account_logo_b").value;
            let url_b = document.getElementById("account_url_b").value;

            let user = {"nombre": nombre, 
                        "apellido": apellido, 
                        "correo": correo,
                        "password": password,
                        "fecha": fecha,
                        "bazar": nombre_b,
                        "logo": logo_b,
                        "url": url_b,
                        "tipo": "bazar"};

            alert(JSON.stringify(user));

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
    console.log(localStorage);
}