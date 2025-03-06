const urlAPI = "https://www.el-tiempo.net/api/json/v2/";
const h1 = document.getElementById("cabecera2");
const p1 = document.getElementById("text1");
const p2 = document.getElementById("text2");
const wait = document.getElementById("wait");
const selectProvincias = document.getElementById("provincias");
const selectMunicipios = document.getElementById("municipios");
let idProv = null;
let idMun = null;

// Oculta el select de municipios inicialmente
selectMunicipios.style.display = "none";

fetch(urlAPI + "home")
  .then((res) => res.json())
  .then((home) => {
    showHome(home);
  })
  .catch((error) => {
    console.error("Error al obtener datos de la página de inicio:", error);
    wait.textContent = "Hubo un problema al cargar la información de la página de inicio. Inténtalo de nuevo más tarde.";
  });

function showHome(home) {
  h1.textContent = "El Tiempo";
  p1.innerHTML = "";
  p2.innerHTML = "";
  home.today.p.forEach((texto) => {
    // Decodifica el texto para que llegue bien al cliente (tildes, etc.)
    texto = new TextDecoder("utf-8").decode(new Uint8Array(texto.split('').map(char => char.charCodeAt(0))));
    // Reemplaza los \n por <br> para que innerHTML pueda usar los saltos de línea
    p1.innerHTML += texto.replace(/\n/g, "<br>");
  });
  home.tomorrow.p.forEach((texto) => {
    // Decodifica el texto para que llegue bien al cliente (tildes, etc.)
    texto = new TextDecoder("utf-8").decode(new Uint8Array(texto.split('').map(char => char.charCodeAt(0))));
    // Reemplaza los \n por <br> para que innerHTML pueda usar los saltos de línea
    p2.innerHTML += texto.replace(/\n/g, "<br>");
  });
}

fetch(urlAPI + "provincias")
  .then((res) => res.json())
  .then((provincia) => {
    showProv(provincia);
  })
  .catch((error) => {
    console.error("Error al obtener datos de las provincias:", error);
    wait.textContent = "Hubo un problema al cargar la lista de provincias. Inténtalo de nuevo más tarde.";
  });

function showProv(provincia) {
  provincia.provincias.forEach((prov) => {
    const option = document.createElement("option");
    option.textContent = prov.NOMBRE_PROVINCIA;
    option.value = prov.CODPROV;
    selectProvincias.append(option);
  });
}

selectProvincias.addEventListener("change", (e) => {
  wait.textContent = "Cargando...";
  // Obtengo el id de la opción seleccionada usando selectedIndex
  idProv = e.target.value;
  fetch(urlAPI + "provincias/" + idProv)
    .then((res) => res.json())
    .then((infoProv) => {
      showInfoProv(infoProv);
    })
    .catch((error) => {
      console.error("Error al obtener la información de la provincia:", error);
      wait.textContent = "Hubo un problema al cargar la información de la provincia. Inténtalo de nuevo más tarde.";
    });

  fetch(urlAPI + "provincias/" + idProv + "/municipios")
    .then((res) => res.json())
    .then((mun) => {
      showMun(mun);
      // Muestra el select de municipios cuando se selecciona una provincia
      selectMunicipios.style.display = "block";
    })
    .catch((error) => {
      console.error("Error al obtener la lista de municipios:", error);
      wait.textContent = "Hubo un problema al cargar la lista de municipios. Inténtalo de nuevo más tarde.";
    });
});

function showInfoProv(infoProv) {
  h1.textContent = infoProv.title;
  const decoder = new TextDecoder("utf-8");
  p1.innerHTML = decoder.decode(new Uint8Array(infoProv.today.p.split('').map(char => char.charCodeAt(0)))).replace(/\n/g, "<br>");
  p2.innerHTML = decoder.decode(new Uint8Array(infoProv.tomorrow.p.split('').map(char => char.charCodeAt(0)))).replace(/\n/g, "<br>");
  wait.textContent = "";
}

function showMun(mun) {
  selectMunicipios.innerHTML = `<option value="" disabled selected>Elige un municipio</option>`;
  mun.municipios.forEach((muni) => {
    const option = document.createElement("option");
    option.textContent = muni.NOMBRE;
    // Uso un substring para pillar los 5 primeros números del id
    option.value = muni.CODIGOINE.substring(0, 5);
    selectMunicipios.append(option);
  });
}

selectMunicipios.addEventListener("change", (e) => {
  wait.textContent = "Cargando...";
  idMun = e.target.value
  // console.log(urlAPI + "provincias/" + idProv + "/municipios/" + idMun);
  fetch(urlAPI + "provincias/" + idProv + "/municipios/" + idMun)
    .then((res) => res.json())
    .then((infoMun) => {
      showInfoMun(infoMun);
    })
    .catch((error) => {
      console.error("Error al obtener la información del municipio:", error);
      wait.textContent = "Hubo un problema al cargar la información del municipio. Inténtalo de nuevo más tarde.";
    });
});

function showInfoMun(infoMun) {
  h1.textContent = infoMun.municipio.NOMBRE;
  // console.log(infoMun);

  p1.innerHTML =
    infoMun.stateSky.description +
    (infoMun.temperatura_actual ? " " + infoMun.temperatura_actual + "ºC" : "") +
    " (max: " +
    infoMun.temperaturas.max +
    "ºC | min: " +
    infoMun.temperaturas.min +
    "ºC)";

  p2.innerHTML =
    "(max: " +
    infoMun.proximos_dias[0].temperatura.maxima +
    "ºC | min: " +
    infoMun.proximos_dias[0].temperatura.minima +
    "ºC)";

  wait.textContent = "";
}
