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

            if(actual == "producto") {
                let temp_product = localStorage.getItem("producto_id");
                displayProducto(temp_product);
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

    if(actual == "marcas") {
        displayMarcas();
    }

    if(actual == 'p_bazares') {
        displayBazares();
    }

    if(actual == 'productos_marca') {
        displayProductos();
    }

    if(actual == 'producto') {
        let temp_product = localStorage.getItem("producto_id");
        displayProducto(temp_product);
    }

    if(localStorage.getItem("product") != undefined) {
        let p = localStorage.getItem("product");
        postProduct(p);
        $("#modalImageP").modal();
        localStorage.removeItem("product");
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
    else if(localStorage.getItem("extension") != undefined && localStorage.getItem("product_id")) {
        let extension = localStorage.getItem("extension");
        let xhr = new XMLHttpRequest();
        xhr.open('PUT', "http://localhost:3000/api/products");
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({"product": localStorage.getItem("product_id"), "ruta": "uploads/temp" + extension}));
        xhr.onload = function () {
            if (xhr.status != 200) { 
                alert("No se puedo actualizar la foto de perfil.");
            } else {
                alert("Se ha agregado el producto");
            }
        };

        localStorage.removeItem("extension");
        localStorage.removeItem("product_id");
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
    // alert(token);

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
    localStorage.removeItem("token");
    
    let path = window.location.pathname;
    let actual = path.split("/").pop();

    if(actual == "" || actual == "home") {
        let busqueda = document.getElementById("busqueda");
        busqueda.innerHTML = "";
        let favoritos = document.getElementById("favoritos");
        favoritos.innerHTML = "";
    }

    if(actual == "producto") {
        let temp_product = localStorage.getItem("producto_id");
        displayProducto(temp_product);
    }

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

            categoria = Number(categoria);

            switch(categoria) {
                case 1: categoria = "hogar";
                        break;
                case 2: categoria = "belleza";
                        break;
                case 3: categoria = "calzado";
                        break;
                case 4: categoria = "ropa";
                        break;
                case 5: categoria = "joyeria";
                        break;
                case 6: categoria = "deporte";
                        break;
                case 7: categoria = "arte";
                        break;
                case 8: categoria = "cocina";
                        break;
                case 9: categoria = "bebe";
                        break;
                case 10: categoria = "mascotas";
                        break;
                default: categoria = "hogar";
            }

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
    if(extension == "") {
        extension = document.getElementById("archive_p").value;
    }

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

function busquedaHome(){
    let texto = document.getElementById("TextoBusqueda").value;
    if(texto != undefined && texto != ""){

        let xhr = new XMLHttpRequest();
        xhr.open('GET', "http://localhost:3000/api/productos/" + texto);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send();
        xhr.onload = function(){
            if(xhr.status == 200){
                let productos = [];
                productos = JSON.parse(xhr.responseText);
                let l = productos.length;
                let busqueda = document.getElementById("busqueda");
                busqueda.innerHTML = "";

                let title = document.createElement("h4");
                title.className = "cat";
                title.align = "center";
                

                if(l == 0) {
                    title.innerHTML = "No se encontro ningún producto con ese nombre. <br> <br>";
                    busqueda.appendChild(title);
                }
                else {
                    title.innerHTML = "Productos encontrados <br> <br>";
                    busqueda.appendChild(title);

                    let table = document.createElement("table");
                    table.width = "90%";

                    let tr = document.createElement("tr");
                    
                    for(let i = 0; i < l; i++){
                        if(i % 3 == 0){
                            table.appendChild(tr);
                            tr = document.createElement("tr");
                        }

                        let td = document.createElement("td");
                        td.align = "center";
                        //Extender
                        let table_temp = document.createElement("table");
                        table_temp.align = "left";

                        if(productos.length >= 3)
                            table_temp.width = "90%";

                        let tr_temp = document.createElement("tr");

                        let td_in_1 = document.createElement("td");
                        td_in_1.innerHTML = "<h5>" + productos[i].nombre + "</h5><p>" + (productos[i].stock > 0? "Disponible" : "No disponible") + "</p>";
                        tr_temp.appendChild(td_in_1);

                        let td_in_2 = document.createElement("td");
                        td_in_2.align = "right";
                        td_in_2.innerHTML = '<a name="" id="" class="btn" href="producto" role="button"><img src="' + productos[i].imagen + '" width="200"></a>';
                        tr_temp.appendChild(td_in_2);

                        table_temp.appendChild(tr_temp);

                        td.appendChild(table_temp);

                        tr.appendChild(td);
                    }

                    table.appendChild(tr);

                    busqueda.appendChild(table);
                }
            }
        }
    }else{
        alert("Inserte minimo una letra chingada madre");
    }
}

function readProduct() {
    let name = document.getElementById("product_name").value;
    let price = document.getElementById("product_price").value;
    let cat = document.getElementById("product_cat").value;
    let stock = document.getElementById("product_stock").value;
    let des = document.getElementById("product_des").value;

    let temp = "";
    for(let i = 0, ac = 0 ; i < des.length ; i++) {
        if(des[i] == ' ')
            ac++;

        if(ac == 6) {
            ac = 0;
            temp += "<br>";
            i++;
        }

        temp += des[i];
    }

    let categoria;

    cat = Number(cat);

    switch(cat) {
        case 1: categoria = "hogar";
                break;
        case 2: categoria = "belleza";
                break;
        case 3: categoria = "calzado";
                break;
        case 4: categoria = "ropa";
                break;
        case 5: categoria = "joyeria";
                break;
        case 6: categoria = "deporte";
                break;
        case 7: categoria = "arte";
                break;
        case 8: categoria = "cocina";
                break;
        case 9: categoria = "bebe";
                break;
        case 10: categoria = "mascotas";
                break;
        default: categoria = "hogar";
    }

    let product = {"nombre": name, "precio": price, "categoria": categoria, "stock": stock, "descripcion": temp, "usuario_token": localStorage.getItem("token")};
    localStorage.setItem("product", JSON.stringify(product));

}

function postProduct(product) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', "http://localhost:3000/api/products");
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(product);
    xhr.onload = function () {
        if (xhr.status != 201) { 
            console.log("Un parametro del producto esta mal.");
        } else { 
            let id = xhr.responseText; 
            localStorage.setItem("product_id", id);
        }
    };
}

function imageProduct() {
    localStorage.setItem("extension", extension);
}

function displayMarcas() {
    let title = document.getElementById("t_pestana");
    let categoria = localStorage.getItem("categoria");
    title.innerHTML = "Marcas " + categoria;

    let xhr = new XMLHttpRequest();
    xhr.open('GET', "http://localhost:3000/api/marcas_" + categoria.toLowerCase());
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) { 
            console.log("No se encontraron marcas.");
        } else { 
            let array = JSON.parse(xhr.response);
            let marcas = document.getElementById("marcas");
            marcas.innerHTML = "";
            
            let table, tr;
            for(let i = 0 ; i < array.length ; i++) {
                if(i % 3 == 0 || i == 0) {
                    if(i > 0) {
                        table.appendChild(tr);
                        marcas.appendChild(table);

                        for(let j = 0 ; j < 3 ; j++) {
                            let br = document.createElement("br");
                            marcas.appendChild(br);
                        }
                    }

                    table = document.createElement("table");
                    table.width = "98%";

                    tr = document.createElement("tr");
                }

                let td = document.createElement("td");
                td.align = "center";

                let h = document.createElement("h5");
                h.className = "font_art";
                h.innerHTML = array[i].marca;

                td.appendChild(h);

                let a = document.createElement("a");
                a.className = "btn btn-primary rounded-circle";
                a.href = "productos_marca";
                a.role = "button";
                a.id = array[i].marca; 
                a.addEventListener("click", saveMarca);

                let img = document.createElement("img");
                img.src = array[i].logo;
                img.className = "rounded-circle";
                img.height = "200";

                a.appendChild(img);

                td.appendChild(a);
                
                tr.appendChild(td);
            }

            table.appendChild(tr);
            marcas.appendChild(table);
            
        }
    };
}

function saveCat(object) {
    localStorage.setItem("categoria", object.id);
}

function displayBazares() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', "http://localhost:3000/api/bazares");
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    xhr.onload = function () {
        if (xhr.status != 200) { 
            console.log("No se encontraron bazares.");
        } else { 
            let array = JSON.parse(xhr.response);
            let bazares = document.getElementById("bazares");
            bazares.innerHTML = "";
            
            let table, tr;
            for(let i = 0 ; i < array.length ; i++) {
                if(i % 3 == 0 || i == 0) {
                    if(i > 0) {
                        table.appendChild(tr);
                        bazares.appendChild(table);

                        for(let j = 0 ; j < 3 ; j++) {
                            let br = document.createElement("br");
                            bazares.appendChild(br);
                        }
                    }

                    table = document.createElement("table");
                    table.width = "60%";
                    table.align = "center";

                    tr = document.createElement("tr");
                }

                let td = document.createElement("td");
                td.align = "center";

                let h = document.createElement("h5");
                h.className = "font_art";
                h.innerHTML = array[i].bazar;

                td.appendChild(h);

                let a = document.createElement("a");
                a.className = "btn rounded-circle";
                a.href = array[i].url;
                a.role = "button";

                let img = document.createElement("img");
                img.src = array[i].logo;
                img.className = "rounded-circle";
                img.height = "150";

                a.appendChild(img);

                td.appendChild(a);
                
                tr.appendChild(td);
            }

            table.appendChild(tr);
            bazares.appendChild(table);
            
        }
    };
}

function saveMarca() {
    localStorage.setItem("marca", this.id);
}

function displayProductos() {
    let title = document.getElementById("t_pestana");
    let marca = localStorage.getItem("marca");
    title.innerHTML = "Productos " + marca;

    let xhr = new XMLHttpRequest();
    xhr.open('PUT', "http://localhost:3000/api/marca");
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({"marca": marca}));
    xhr.onload = function () {
        if (xhr.status != 200) { 
            console.log("No se encontro la marca.");
        } else { 
            let brand = JSON.parse(xhr.response);
            let m_logo = document.getElementById("marca_and_logo");

            let m_table = document.createElement("table");
            m_table.width = "90%";

            let m_tr = document.createElement("tr");

            let m_th = document.createElement("th");

            let m_inner_table = document.createElement("table");
            let m_inner_tr = document.createElement("tr");
            let m_innner_td_1 = document.createElement("td");
            
            let m_a = document.createElement("a");
            m_a.className = "btn btn-primary rounded-circle";
            m_a.href = brand.url;
            m_a.role = "button";
            
            let m_img = document.createElement("img");
            m_img.src = brand.logo;
            m_img.className = "rounded-circle"
            m_img.height = "200";

            m_a.appendChild(m_img);

            m_innner_td_1.appendChild(m_a);

            m_inner_tr.appendChild(m_innner_td_1);

            let m_innner_td_2 = document.createElement("td");

            let m_h = document.createElement("h1");
            m_h.innerHTML = " &nbsp; &nbsp;" + brand.marca;

            m_innner_td_2.appendChild(m_h);

            m_inner_tr.appendChild(m_innner_td_2);

            m_inner_table.appendChild(m_inner_tr);

            m_th.appendChild(m_inner_table);

            m_tr.appendChild(m_th);

            m_table.appendChild(m_tr);

            m_logo.appendChild(m_table);

            let inner_xhr = new XMLHttpRequest();
            inner_xhr.open('PUT', "http://localhost:3000/api/products_display");
            inner_xhr.setRequestHeader('Content-Type', 'application/json');
            inner_xhr.send(JSON.stringify({"marca": marca}));
            inner_xhr.onload = function () {
                if (xhr.status != 200) { 
                    console.log("No se encontraron productos.");
                } else { 
                    let productos = [];
                    productos = JSON.parse(inner_xhr.responseText);
                    let l = productos.length;
                    let busqueda = document.getElementById("busqueda");
                    busqueda.innerHTML = "";

                    let table = document.createElement("table");
                    table.width = "90%";

                    let tr = document.createElement("tr");
                    
                    for(let i = 0; i < l; i++){
                        if(i % 3 == 0){
                            table.appendChild(tr);
                            tr = document.createElement("tr");
                        }

                        let td = document.createElement("td");
                        td.align = "center";
                        //Extender
                        let table_temp = document.createElement("table");
                        table_temp.align = "left";

                        if(productos.length >= 3)
                            table_temp.width = "90%";

                        let tr_temp = document.createElement("tr");

                        let td_in_1 = document.createElement("td");
                        td_in_1.innerHTML = "<h5>" + productos[i].nombre + "</h5><p>" + (productos[i].stock > 0? "Disponible" : "No disponible") + "</p>";
                        tr_temp.appendChild(td_in_1);

                        let td_in_2 = document.createElement("td");
                        td_in_2.align = "right";
                        td_in_2.innerHTML = '<a name="" id="' + productos[i]._id + '" class="btn" href="producto" role="button" onclick="saveProducto(this);"><img src="' + productos[i].imagen + '" width="200"></a>';
                        tr_temp.appendChild(td_in_2);

                        table_temp.appendChild(tr_temp);

                        td.appendChild(table_temp);

                        tr.appendChild(td);
                    }

                    table.appendChild(tr);

                    busqueda.appendChild(table);
                }       
            };
        }
    };
}

function saveProducto(object) {
    localStorage.setItem("producto_id", object.id);
}

function displayProducto(id) {
    let xhr = new XMLHttpRequest();
    xhr.open('PUT', "http://localhost:3000/api/display_producto");
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({"id": id}));
    xhr.onload = function () {
        if (xhr.status != 200) { 
            console.log("No se encontro la marca.");
        } else {
            let producto = JSON.parse(xhr.response);

            let title = document.getElementById("t_pestana");
            title.innerHTML = "Producto " + producto.nombre;

            let producto_d = document.getElementById("producto_d");
            producto_d.innerHTML = "";
            
            let table = document.createElement("table");
            table.width ="80%";
            
            let tr = document.createElement("tr");

            let td = document.createElement("td");

            let inner_table = document.createElement("table");
            inner_table.width ="90%";

            let inner_tr = document.createElement("tr");

            let inner_td_1 = document.createElement("td");

            let img = document.createElement("img");
            img.src = producto.imagen;
            img.width = "500";

            inner_td_1.appendChild(img);

            inner_tr.appendChild(inner_td_1);

            let inner_td_2 = document.createElement("td");
            inner_td_2.valign="top";

            let h_1 = document.createElement("h1");

            let temp_name = "";
            for(let i = 0, ac = 0 ; i < producto.nombre.length ; i++) {
                if(producto.nombre[i] == " ") {
                    ac++;
                }

                if(ac == 2) {
                    temp_name += "<br>";
                    i++;
                    ac = 0;
                }

                temp_name += producto.nombre[i];
            }

            h_1.innerHTML = temp_name;

            inner_td_2.appendChild(h_1);

            let br = document.createElement("br");
            inner_td_2.appendChild(br);

            let h_3 = document.createElement("h3");
            
            let inner_t = document.createElement("table");
            let inner_t_tr = document.createElement("tr");
            let inner_t_td_1 = document.createElement("td");

            let inner_img = document.createElement("img");
            inner_img.src = producto.logo;
            inner_img.className = "rounded-circle";
            inner_img.height = "50";
            
            inner_t_td_1.appendChild(inner_img);

            inner_t_tr.appendChild(inner_t_td_1);

            let inner_t_td_2 = document.createElement("td");

            let inner_h_3 = document.createElement("h3");
            inner_h_3.innerHTML = " &nbsp; &nbsp;" + producto.marca;

            inner_t_td_2.appendChild(inner_h_3);

            inner_t_tr.appendChild(inner_t_td_2);

            inner_t.appendChild(inner_t_tr);

            h_3.appendChild(inner_t);

            inner_td_2.appendChild(h_3);

            br = document.createElement("br");
            inner_td_2.appendChild(br);

            br = document.createElement("br");
            inner_td_2.appendChild(br);

            let p = document.createElement("p");
            p.innerHTML = producto.descripcion;

            inner_td_2.appendChild(p);

            br = document.createElement("br");
            inner_td_2.appendChild(br);

            br = document.createElement("br");
            inner_td_2.appendChild(br);

            let h_2 = document.createElement("h2");
            h_2.innerHTML = producto.precio;

            inner_td_2.appendChild(h_2);

            br = document.createElement("br");
            inner_td_2.appendChild(br);

            let h_5 = document.createElement("h5");
            h_5.innerHTML = producto.stock > 0? "Disponible" : "No disponible";

            inner_td_2.appendChild(h_5);

            br = document.createElement("br");
            inner_td_2.appendChild(br);

            br = document.createElement("br");
            inner_td_2.appendChild(br);

            br = document.createElement("br");
            inner_td_2.appendChild(br);

            if(localStorage.getItem("token") && producto.stock > 0) {
                let in_in_t = document.createElement("table");
                in_in_t.width = "60%";

                let in_in_tr = document.createElement("tr");

                let in_in_td_1 = document.createElement("td");

                let in_in_btn_1 = document.createElement("button");
                in_in_btn_1.type = "button";
                in_in_btn_1.className = "btn btn-primary";
                in_in_btn_1.addEventListener("click", apartar);
                in_in_btn_1.innerHTML = "Apartar";

                in_in_td_1.appendChild(in_in_btn_1);

                in_in_tr.appendChild(in_in_td_1);

                let in_in_td_2 = document.createElement("td");

                let in_in_btn_2 = document.createElement("button");
                in_in_btn_2.type = "button";
                in_in_btn_2.className = "btn btn-primary";
                in_in_btn_2.addEventListener("click", addCarrito);
                in_in_btn_2.innerHTML = '<i class="fa fa-shopping-cart" aria-hidden="true"></i> +';

                in_in_td_2.appendChild(in_in_btn_2);

                in_in_tr.appendChild(in_in_td_2);

                in_in_t.appendChild(in_in_tr);

                inner_td_2.appendChild(in_in_t);
            }

            inner_tr.appendChild(inner_td_2);

            inner_table.appendChild(inner_tr);

            td.appendChild(inner_table);

            tr.appendChild(td);

            table.appendChild(tr);

            producto_d.appendChild(table);
        }
    };
}

function apartar() {
    alert('Producto apartado\nRECUERDA: Tienes 48 horas para recoger el producto.');
}

function addCarrito() {
    alert('Producto agregado al carrito.');
}