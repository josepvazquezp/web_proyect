var watchId;   
var mapa = null;
var mapaMarcador = null;  

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

function showNav(flag) {
    if(flag) {
        let email = document.getElementById("email").value;
        show.innerHTML = '<ul class="navbar-nav navbar-right mt-2 mt-lg-0"><li class="nav-item"><table width="100%"><tr><td><li class="nav-item dropdown"><a class="nav-link" href="#" id="navbarDropdown2" role="button" aria-haspopup="true" aria-expanded="false"  data-toggle="modal" data-target="#modalProduct"><i class="fa fa-upload" aria-hidden="true"></i> Agregar producto</a></li></td><td><li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + email + '&nbsp; &nbsp;<img src="images/kirby_logo.png" height="30" widht="15"></a><div class="dropdown-menu" aria-labelledby="navbarDropdown2"><a class="dropdown-item" href="#" data-toggle="modal" data-target="#modalFoto">Cambiar foto de perfil</a><a class="dropdown-item" href="#" onclick="showNav(false);">Cerrar sesión</a></div></li></td><td><li class="nav-item dropdown"><a class="nav-link" href="#" id="navbarDropdown2" role="button" aria-haspopup="true" aria-expanded="false"  data-toggle="modal" data-target="#modalShop"><i class="fa fa-shopping-cart" aria-hidden="true"></i></a></li></td></tr></table></li></ul>';
    }
    else {
        show.innerHTML = '<ul class="navbar-nav navbar-right mt-2 mt-lg-0"><li class="nav-item"><a class="nav-link" href="#" data-toggle="modal" data-target="#modalAccount"><i class="fa fa-user-circle"></i> Registrarse</a></li><li class="nav-item"><a class="nav-link" href="#" data-toggle="modal" data-target="#modalLogin"><i class="fa fa-sign-in"></i> Iniciar Sesión</a></li></ul>';
    }
}

function showContent() {
    element = document.getElementById("m_categories");
    el_marca = document.getElementById("m_marcas");
    el_bazar = document.getElementById("m_bazar");
    user = document.getElementById("user_count");
    bazar = document.getElementById("bazar_count");
    marca = document.getElementById("marca_count");

    if(user.checked) {
        element.style.display='block';
        el_marca.style.display='none';
        el_bazar.style.display='none';
    }
    else if(marca.checked) {
        element.style.display='none';
        el_marca.style.display="block";
        el_bazar.style.display='none';
    }
    else if(bazar.checked) {
        element.style.display='none';
        el_marca.style.display="none";
        el_bazar.style.display='block';
    }
}