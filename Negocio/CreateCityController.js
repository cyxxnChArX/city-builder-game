import City from "../Modelos/City.js";
import Resources from "../Modelos/Resources.js";
import Map from "../Modelos/Map.js";
import StorageService from "../Datos/StorageService.js";
import MapController from "./MapController.js";
import TurnBasedSystem from "./TurnBasedSystem.js";
import UIController from "./UIController.js";
import RankingService from "./RankingService.js";
import ScoringSystem from "./ScoringSystem.js";
import WeatherService from "../Datos/API's/WeatherService.js";
import UbicationService from "../Datos/API's/UbicationService.js";
import NewsService from "../Datos/API's/NewsService.js";
import MapImportService from "../Datos/MapImportService.js";


document.addEventListener("DOMContentLoaded", function () {

    let currentCity = null;
    let turnSystem = null;
    let weatherInterval = null;
    let newsService = new NewsService();
    let pendingMapText = null;

    function renderLoadedCity(city) {
        if (!city) return;

        currentCity = city;

        MapController.modo = null;
        MapController.routeModeActive = false;
        MapController.routeOriginBuilding = null;
        MapController.routeDestinationBuilding = null;
        MapController.currentRouteCells = [];
        MapController.selectedBuilding = null;
        UIController.updateCurrentMode("Ninguno");
        UIController.updateRouteInfo("sin seleccionar", "sin seleccionar", "inactivo");

        UIController.update(city);
        UIController.updatePauseButton(false);

        RankingService.updateCityRanking(currentCity);

        MapController.renderMap(city.map, city);
        MapController.initUI();

        if (turnSystem) {
            turnSystem.stop();
        }

        turnSystem = new TurnBasedSystem(
            city,
            city.config?.turnDuration || 10000,
            city.config?.minGrowth || 1,
            city.config?.maxGrowth || 3
        );

        turnSystem.start();
    }

    function startWeatherAutoUpdate() {
        updateWeather();

        if (weatherInterval) {
            clearInterval(weatherInterval);
        }

        weatherInterval = setInterval(updateWeather, 60000);
    }

    function stopCurrentTurnSystem() {
        if (turnSystem) {
            turnSystem.stop();
        }
    }

    //formulario
    const form = document.getElementById("citySetupForm");
    const mapFileInput = document.getElementById("mapFileInput");
    const mapLoadStatus = document.getElementById("mapLoadStatus");
    const importSavedGameFileInput = document.getElementById("importSavedGameFileInput");

    if (mapFileInput) {
        mapFileInput.addEventListener("change", async (event) => {
            const file = event.target.files ? event.target.files[0] : null;
            if (!file) {
                if (mapLoadStatus) mapLoadStatus.textContent = "No se seleccionó ningún archivo.";
                pendingMapText = null;
                return;
            }

            try {
                const text = await MapImportService.readTextFile(file);
                const matrix = MapImportService.parseTextToMatrix(text);
                MapImportService.validateMatrix(matrix);

                pendingMapText = text;
                if (mapLoadStatus) {
                    mapLoadStatus.textContent = `Mapa cargado: ${file.name} (${matrix[0].length} x ${matrix.length})`;
                }

                const mapSizeElement = document.getElementById("mapSizeSelect");
                if (mapSizeElement) {
                    const width = matrix[0].length.toString();
                    if (mapSizeElement.querySelector(`option[value="${width}"]`)) {
                        mapSizeElement.value = width;
                    }
                }
            } catch (error) {
                console.error("Error cargando mapa .txt:", error);
                pendingMapText = null;
                if (mapLoadStatus) mapLoadStatus.textContent = "Archivo de mapa inválido.";
                alert("No se pudo cargar el mapa. Verifica que el archivo .txt sea válido.");
            }
        });
    }

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            try {
                const nombre = document.getElementById("cityNameInput").value.trim();
                const alcalde = document.getElementById("mayorNameInput").value.trim();
                const region = document.getElementById("regionSelect").value;
                const size = parseInt(document.getElementById("mapSizeSelect").value, 10);

                //  PARAMETROS CONFIGURABLES
                const min = parseInt(document.getElementById("citizenGrowthMinInput").value, 10);
                const max = parseInt(document.getElementById("citizenGrowthMaxInput").value, 10);
                const turnDuration = parseInt(document.getElementById("turnDurationInput").value, 10) * 1000;

                //  RECURSOS DESDE FORMULARIO
                const money = parseInt(document.getElementById("initialMoneyInput").value, 10);
                const electricity = parseInt(document.getElementById("initialElectricityInput").value, 10);
                const water = parseInt(document.getElementById("initialWaterInput").value, 10);
                const food = parseInt(document.getElementById("initialFoodInput").value, 10);

                if (!nombre || !alcalde || !region || !size) {
                    alert("Completa todos los campos");
                    return;
                }

                let city;

                if (pendingMapText) {
                    const importedMoney = MapImportService.extractMoneyFromText(pendingMapText);

                    city = MapImportService.importCityFromText({
                        fileContent: pendingMapText,
                        cityId: null,
                        cityName: nombre,
                        region,
                        initialMoney: importedMoney ?? money,
                        initialElectricity: electricity,
                        initialWater: water,
                        initialFood: food
                    });
                } else {
                    const map = new Map(size, size);
                    const resources = new Resources(money, electricity, water, food);
                    city = new City(null, nombre, map, resources, alcalde);
                    city.region = region;
                }

                city.alcalde = alcalde;

                //para que se guarden estos valores de min y max aparte de la duracion del sistema al cargar
                city.config = {
                    minGrowth: min,
                    maxGrowth: max,
                    turnDuration: turnDuration
                };

                StorageService.saveGame(city);
                ScoringSystem.updateCityScore(city);
                RankingService.updateCityRanking(city);

                renderLoadedCity(city);
                startWeatherAutoUpdate();
                updateNews();

                console.log("Ciudad creada:", city);

                alert("Ciudad creada correctamente");
            } catch (error) {
                console.error("Error creando la ciudad:", error);
                alert(error.message || "Ocurrió un error al crear la ciudad. Revisa la consola.");
            }
        });
    } else {
        console.error("Formulario de creación de ciudad no encontrado: citySetupForm");
    }

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
        if (form) {
            form.reset();
        }

        pendingMapText = null;

        if (mapLoadStatus) {
            mapLoadStatus.textContent = "Sin archivo seleccionado.";
        }

        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    });

    const btnImportSavedGame = document.getElementById("btnImportSavedGame");
    if (btnImportSavedGame && importSavedGameFileInput) {
        btnImportSavedGame.addEventListener("click", () => {
            importSavedGameFileInput.click();
        });
    }

    if (importSavedGameFileInput) {
        importSavedGameFileInput.addEventListener("change", async (event) => {
            const file = event.target.files ? event.target.files[0] : null;
            if (!file) {
                alert("No se seleccionó ningún archivo.");
                return;
            }

            try {
                const text = await MapImportService.readTextFile(file);
                const parsed = JSON.parse(text);
                const importedCity = StorageService.deserializeCity(parsed);

                if (!importedCity) {
                    throw new Error("JSON de ciudad no válido.");
                }

                renderLoadedCity(importedCity);
                startWeatherAutoUpdate();
                updateNews();

                alert(`Partida importada: ${importedCity.nombre}`);
            } catch (error) {
                console.error("Error importando partida guardada:", error);
                alert("No se pudo importar la partida. Verifica que el archivo JSON sea válido.");
            } finally {
                importSavedGameFileInput.value = "";
            }
        });
    }

    const btnContinueGame = document.getElementById("btnContinueGame");
    if (btnContinueGame) {
        btnContinueGame.addEventListener("click", () => {
            const savedCityToContinue = StorageService.loadLatestGame();

            if (!savedCityToContinue) {
                alert("No hay una partida guardada para continuar.");
                return;
            }

            renderLoadedCity(savedCityToContinue);
            startWeatherAutoUpdate();
            updateNews();
            alert(`Partida cargada: ${savedCityToContinue.nombre}`);
        });
    }

    const btnExportCity = document.getElementById("btnExportCity");
    if (btnExportCity) {
        btnExportCity.addEventListener("click", () => {
            if (!currentCity) {
                alert("No hay una ciudad cargada para exportar.");
                return;
            }

            StorageService.downloadCityJSON(currentCity);
        });
    }

    const btnExportMap = document.getElementById("btnExportMap");
    if (btnExportMap) {
        btnExportMap.addEventListener("click", () => {
            if (!currentCity) {
                alert("No hay una ciudad cargada para exportar el mapa.");
                return;
            }

            const safeName = (currentCity.nombre || "mapa").toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
            MapImportService.downloadMapTXT(currentCity, `mapa_${safeName || "ciudad"}.txt`);
        });
    }

    const btnPauseTurn = document.getElementById("btnPauseTurn");
    if (btnPauseTurn) {
        btnPauseTurn.addEventListener("click", () => {
            if (!currentCity || !turnSystem) {
                alert("No hay una partida activa.");
                return;
            }

            const isPaused = turnSystem.turnInterval === null;

            if (isPaused) {
                turnSystem.start();
                UIController.updatePauseButton(false);
            } else {
                turnSystem.stop();
                UIController.updatePauseButton(true);
            }
        });
    }

    const btnOpenScoreBreakdown = document.getElementById("btnOpenScoreBreakdown");
    const scoreBreakdownModalElement = document.getElementById("scoreBreakdownModal");

    if (btnOpenScoreBreakdown && scoreBreakdownModalElement) {
        btnOpenScoreBreakdown.addEventListener("click", () => {
            if (!currentCity) {
                alert("No hay una ciudad cargada.");
                return;
            }

            ScoringSystem.updateCityScore(currentCity);
            UIController.update(currentCity);
            UIController.renderScoreBreakdown(currentCity);

            const modal = new bootstrap.Modal(scoreBreakdownModalElement);
            modal.show();
        });
    }

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

    if (regionSelect) {
        ciudades.forEach(ciudad => {
            const option = document.createElement("option");
            option.value = ciudad;
            option.textContent = ciudad;
            regionSelect.appendChild(option);
        });
    } else {
        console.error("No se encontró el select de región: regionSelect");
    }

    //boton del ranking 
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
        ScoringSystem.updateCityScore(savedCity);
        renderLoadedCity(savedCity);
        startWeatherAutoUpdate();
        updateNews();
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

    async function updateWeather() {
        try {
            if (!currentCity || !currentCity.region) {
                UIController.renderWeather(null, "---");
                return;
            }

            const coordenadas = await UbicationService.getCoordenadasCiudad(
                currentCity.region,
                "Colombia"
            );

            if (!coordenadas) {
                UIController.renderWeather(null, currentCity.region);
                return;
            }

            const weather = await WeatherService.getWeather(
                coordenadas.lat,
                coordenadas.lon
            );

            UIController.renderWeather(weather, currentCity.region);

        } catch (error) {
            console.error("Error cargando clima:", error);
            UIController.renderWeather(null, currentCity?.region || "---");
        }
    }

    window.updateWeather = updateWeather;

    const btnRefreshWeather = document.getElementById("btnRefreshWeather");

    if (btnRefreshWeather) {
        btnRefreshWeather.addEventListener("click", updateWeather);
    }

    async function updateNews() {
        try {
            if (!currentCity || !currentCity.region) return;

            const noticias = await newsService.getNoticiasPorCiudad(currentCity.region);

            UIController.renderNews(noticias);

        } catch (error) {
            console.error("Error cargando noticias:", error);
        }
    }
    const btnRefreshNews = document.getElementById("btnRefreshNews");

    if (btnRefreshNews) {
        btnRefreshNews.addEventListener("click", updateNews);
    }

    // MANEJO DE TABS DE CONSTRUCCIÓN
    const constructionTabs = document.querySelectorAll('[data-tab-target]');
    const tabPanels = document.querySelectorAll('.tab-panel');

    // Ocultar todos los paneles al inicio
    tabPanels.forEach(panel => {
        panel.style.display = 'none';
    });

    // Mostrar todos los paneles por defecto y marcar "Todas" como activo
    tabPanels.forEach(panel => {
        panel.style.display = 'block';
    });
    const tabAllBtn = document.getElementById('tabAll');
    if (tabAllBtn) {
        tabAllBtn.classList.add('active');
    }

    // Agregar event listeners a los botones de categoría
    constructionTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();

            const targetPanelId = tab.dataset.tabTarget;

            // Ocultar todos los paneles
            tabPanels.forEach(panel => {
                panel.style.display = 'none';
            });

            // Si es "Todas", mostrar todos los paneles
            if (targetPanelId === 'allTabPanel') {
                tabPanels.forEach(panel => {
                    panel.style.display = 'block';
                });
            } else {
                // Mostrar solo el panel seleccionado
                const targetPanel = document.getElementById(targetPanelId);
                if (targetPanel) {
                    targetPanel.style.display = 'block';
                }
            }

            // Cambiar el botón activo (visual feedback)
            constructionTabs.forEach(btn => {
                btn.classList.remove('active');
            });
            tab.classList.add('active');
        });
    });
});