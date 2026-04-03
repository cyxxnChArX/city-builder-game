import City from "../Modelos/City.js";
import Resources from "../Modelos/Resources.js";
import Map from "../Modelos/Map.js";
import StorageService from "../Datos/StorageService.js";
import MapController from "./MapController.js";
import TurnBasedSystem from "./TurnBasedSystem.js";
import UIController from "./UIController.js";
import RankingService from "./RankingService.js";


document.addEventListener("DOMContentLoaded", function () {

    let currentCity = null;
    let turnSystem = null;

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
        currentCity = city;
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
        turnSystem = new TurnBasedSystem(city, turnDuration, min, max);
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
    
    //boton de parametros configurables en cualquier momento de la partida
    const btnConfig = document.getElementById("btnConfig");
    const configModalElement = document.getElementById("configModal");

    if (btnConfig && configModalElement) {
        btnConfig.addEventListener("click", () => {

    if (!currentCity.config) {
        // valores por defecto si no existe config
        currentCity.config = {
            turnDuration: 10000,
            minGrowth: 1,
            maxGrowth: 3
        };
    }

    document.getElementById("configTurnDuration").value = currentCity.config.turnDuration / 1000;
    document.getElementById("configMinGrowth").value = currentCity.config.minGrowth;
    document.getElementById("configMaxGrowth").value = currentCity.config.maxGrowth;

            const modal = new bootstrap.Modal(configModalElement);
            modal.show();
        });
    }
    const configForm = document.getElementById("configForm");

    if (configForm) {
        configForm.addEventListener("submit", (e) => {
            e.preventDefault();

            if (!currentCity || !turnSystem) {
                alert("No hay sistema activo");
                return;
            }

            const turnDuration = parseInt(document.getElementById("configTurnDuration").value) * 1000;
            const min = parseInt(document.getElementById("configMinGrowth").value);
            const max = parseInt(document.getElementById("configMaxGrowth").value);

            if (min > max) {
                alert("El mínimo no puede ser mayor que el máximo");
                return;
            }

            //  actualizar config de la ciudad
            currentCity.config.turnDuration = turnDuration;
            currentCity.config.minGrowth = min;
            currentCity.config.maxGrowth = max;

            //  reiniciar sistema de turnos
            turnSystem.stop();

            turnSystem = new TurnBasedSystem(currentCity, turnDuration, min, max);
            turnSystem.start();

            // guardar cambios
            StorageService.saveGame(currentCity);

            alert("Configuración actualizada correctamente");
        });
    }

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

    //boton dle ranking 
    const btnOpenRanking = document.getElementById("btnOpenRanking");
    const rankingModalElement = document.getElementById("rankingModal");

    if (btnOpenRanking && rankingModalElement) {
        btnOpenRanking.addEventListener("click", () => {

            const ranking = RankingService.getRanking();

            UIController.renderRanking(
                ranking,
                currentCity ? currentCity.id : null
            );

            const modal = new bootstrap.Modal(rankingModalElement);
            modal.show();
        });
    }
    const btnResetRanking = document.getElementById("btnResetRanking");

    if (btnResetRanking) {
        btnResetRanking.addEventListener("click", () => {

            if (!confirm("¿Seguro que quieres borrar el ranking?")) return;

            RankingService.clearRanking();

            UIController.renderRanking([], null);
        });
    }
    const btnExportRanking = document.getElementById("btnExportRanking");

    if (btnExportRanking) {
        btnExportRanking.addEventListener("click", () => {
            RankingService.downloadRankingJSON();
        });
    }

    //  CARGAR CIUDAD GUARDADA
    const savedCity = StorageService.loadActiveGame();

    if (savedCity) {
        currentCity = savedCity;
        UIController.update(savedCity);
        RankingService.updateCityRanking(currentCity);
        MapController.renderMap(savedCity.map, savedCity);
        MapController.initUI();

        //el tiempo correra de nuevo cada vez que se cargue la ciudad para que turno avance
        // Tomara los alores min max y turn duracion para que no se conserven con cada carga
        turnSystem = new TurnBasedSystem(
            savedCity,
            savedCity.config?.turnDuration || 10000,
            savedCity.config?.minGrowth || 1,
            savedCity.config?.maxGrowth || 3
        );
        turnSystem.start();
    }

    const btnOpenCitizensModal = document.getElementById("btnOpenCitizensModal");
    const citizensModalElement = document.getElementById("citizensModal");

    if (btnOpenCitizensModal && citizensModalElement) {
        btnOpenCitizensModal.addEventListener("click", () => {
            if (!currentCity) {
                alert("No hay una ciudad cargada.");
                return;
            }

            UIController.renderCitizensTable(currentCity);

            const modal = new bootstrap.Modal(citizensModalElement);
            modal.show();
        });
    }

});