import City from "../Modelos/City.js";
import Resources from "../Modelos/Resources.js";
import Map from "../Modelos/Map.js";
import StorageService from "../Datos/StorageService.js";
import MapController from "./MapController.js";
import TurnBasedSystem from "./TurnBasedSystem.js";
import UIController from "./UIController.js";
import RankingService from "./RankingService.js";


document.addEventListener("DOMContentLoaded", function () {

    //formulario
    const form = document.getElementById("citySetupForm");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const nombre = document.getElementById("cityNameInput").value.trim();
        const alcalde = document.getElementById("mayorNameInput").value.trim();
        const region = document.getElementById("regionSelect").value;
        const size = parseInt(document.getElementById("mapSizeSelect").value);

        //  PARAMETROS CONFIGURABLES
        const min = parseInt(document.getElementById("citizenGrowthMinInput").value);
        const max = parseInt(document.getElementById("citizenGrowthMaxInput").value);
        const turnDuration = parseInt(document.getElementById("turnDurationInput").value) * 1000;

        //  RECURSOS DESDE FORMULARIO
        const money = parseInt(document.getElementById("initialMoneyInput").value);
        const electricity = parseInt(document.getElementById("initialElectricityInput").value);
        const water = parseInt(document.getElementById("initialWaterInput").value);
        const food = parseInt(document.getElementById("initialFoodInput").value);

        if (!nombre || !alcalde || !region || !size) {
            alert("Completa todos los campos");
            return;
        }

        const map = new Map(size, size);
        const resources = new Resources(money, electricity, water, food);

        const city = new City(null, nombre, map, resources, alcalde);
        city.region = region;

        //para que se guarden estos valores de min y max aparte de la duracion del sistema al cargar
        city.config = {
            minGrowth: min,
            maxGrowth: max,
            turnDuration: turnDuration
        };       

        StorageService.saveGame(city);
        RankingService.updateCityRanking(city);

        //  CREAR SISTEMA DE TURNOS DESPUÉS DE CREAR CITY
        const turnSystem = new TurnBasedSystem(city, turnDuration, min, max);
        turnSystem.start();

        //  ACTUALIZAR UI COMPLETA
        UIController.update(city);

        MapController.renderMap(city.map, city);
        MapController.initUI();

        console.log("Ciudad creada:", city);

        alert("Ciudad creada correctamente");
    });

    // BOTÓN NUEVA CIUDAD
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

    //  CARGAR CIUDAD GUARDADA
    const savedCity = StorageService.loadActiveGame();

    if (savedCity) {
        UIController.update(savedCity);
        MapController.renderMap(savedCity.map, savedCity);
        MapController.initUI();

        //el tiempo correra de nuevo cada vez que se cargue la ciudad para que turno avance
        // Tomara los alores min max y turn duracion para que no se conserven con cada carga
        const turnSystem = new TurnBasedSystem(
            savedCity,
            savedCity.config?.turnDuration || 10000,
            savedCity.config?.minGrowth || 1,
            savedCity.config?.maxGrowth || 3
        );
        turnSystem.start();
    }

});