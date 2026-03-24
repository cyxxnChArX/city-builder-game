import City from "../Modelos/City.js";
import Resources from "../Modelos/Resources.js";
import Map from "../Modelos/Map.js";
import StorageService from "../Datos/StorageService.js";
import MapController from "./MapController.js";
import CitizensSystem from "./CitizensSystem.js";

document.addEventListener("DOMContentLoaded", function () {

    //  FORMULARIO
    const form = document.getElementById("citySetupForm");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const nombre = document.getElementById("cityNameInput").value.trim();
        const alcalde = document.getElementById("mayorNameInput").value.trim();
        const region = document.getElementById("regionSelect").value;
        const size = parseInt(document.getElementById("mapSizeSelect").value);
        //parametros configurables
        const min = parseInt(document.getElementById("citizenGrowthMinInput").value);
        const max = parseInt(document.getElementById("citizenGrowthMaxInput").value);
        const citizenSystem = new CitizensSystem(min, max);

        if (!nombre || !alcalde || !region || !size) {
            alert("Completa todos los campos");
            return;
        }

        const map = new Map(size, size);
        const resources = new Resources(50000, 0, 0, 0);

        const city = new City(null, nombre, map, resources, alcalde);
        city.region = region;

        StorageService.saveGame(city);
        // MOSTRAR DATOS EN LA INTERFAZ
        document.getElementById("cityNameDisplay").textContent = city.nombre;
        document.getElementById("mayorNameDisplay").textContent = city.alcalde;
        document.getElementById("regionDisplay").textContent = city.region;
        document.getElementById("mapSizeDisplay").textContent = `${size} x ${size}`;

        MapController.renderMap(city.map, city);
        console.log("Ciudad creada:", city);

        alert("Ciudad creada correctamente");
    });

    //  BOTÓN NUEVA CIUDAD
    const btnNewCity = document.getElementById("btnNewCity");
    const modalElement = document.getElementById("citySetupModal");

    btnNewCity.addEventListener("click", () => {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    });

    const regionSelect = document.getElementById("regionSelect");

    const ciudades = [
        "Bogotá",
        "Medellín",
        "Cali",
        "Barranquilla",
        "Cartagena",
        "Bucaramanga",
        "Pereira",
        "Manizales"
    ];

    ciudades.forEach(ciudad => {
        const option = document.createElement("option");
        option.value = ciudad;
        option.textContent = ciudad;
        regionSelect.appendChild(option);
    });
    // CARGAR CIUDAD ACTIVA AL INICIAR
    const savedCity = StorageService.loadActiveGame();

    if (savedCity) {
        document.getElementById("cityNameDisplay").textContent = savedCity.nombre;
        document.getElementById("mayorNameDisplay").textContent = savedCity.alcalde;
        document.getElementById("regionDisplay").textContent = savedCity.region;
        document.getElementById("mapSizeDisplay").textContent =
            `${savedCity.map.ancho} x ${savedCity.map.alto}`;

        MapController.renderMap(savedCity.map, savedCity);
    }

});