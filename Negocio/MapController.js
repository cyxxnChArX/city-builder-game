import BuildingManager from "./BuildingManager.js";
import Road from "../Modelos/Road.js";
import ResidentialBuilding from "../Modelos/ResidentialBuilding.js";
import EmploymentBuilding from "../Modelos/EmploymentBuilding.js";
import ServiceBuilding from "../Modelos/ServiceBuilding.js";
import UtilityPlant from "../Modelos/UtilityPlant.js";
import Park from "../Modelos/Park.js";
import CommercialBuilding from "../Modelos/CommercialBuilding.js";
import IndustrialBuilding from "../Modelos/IndustrialBuilding.js";

import StorageService from "../Datos/StorageService.js";
import RankingService from "./RankingService.js";
import RoutingService from "../Datos/API's/RoutingService.js";
import UIController from "./UIController.js";

class MapController {

    static modo = null;
    static currentCity = null;
    static selectedBuilding = null;

    static routeModeActive = false;
    static routeOriginBuilding = null;
    static routeDestinationBuilding = null;
    static currentRouteCells = [];

    static zoomLevel = 1;
    static minZoom = 0.5;
    static maxZoom = 2;

    static crearEdificio(tipo, x, y) {
        const id = `${tipo}_${x}_${y}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;

        switch (tipo) {
            case "via":
                return new Road(id, x, y);

            case "casa":
                return new ResidentialBuilding(id, ResidentialBuilding.TIPOS.CASA, x, y);

            case "apartamento":
                return new ResidentialBuilding(id, ResidentialBuilding.TIPOS.APARTAMENTO, x, y);

            case "tienda":
                return new CommercialBuilding(id, CommercialBuilding.TIPOS.TIENDA, x, y);

            case "centro_comercial":
                return new CommercialBuilding(id, CommercialBuilding.TIPOS.CENTRO_COMERCIAL, x, y);

            case "fabrica":
                return new IndustrialBuilding(id, IndustrialBuilding.TIPOS.FABRICA, x, y);

            case "granja":
                return new IndustrialBuilding(id, IndustrialBuilding.TIPOS.GRANJA, x, y);

            case "estacion_policia":
                return new ServiceBuilding(id, ServiceBuilding.TIPOS.POLICIA, x, y);

            case "estacion_bomberos":
                return new ServiceBuilding(id, ServiceBuilding.TIPOS.BOMBEROS, x, y);

            case "hospital":
                return new ServiceBuilding(id, ServiceBuilding.TIPOS.HOSPITAL, x, y);

            case "planta_electrica":
                return new UtilityPlant(id, UtilityPlant.TIPOS.PLANTA_ELECTRICA, x, y);

            case "planta_agua":
                return new UtilityPlant(id, UtilityPlant.TIPOS.PLANTA_AGUA, x, y);

            case "parque":
                return new Park(id, x, y);

            default:
                console.log("Tipo desconocido:", tipo);
                return null;
        }
    }

    static renderMap(map, city) {
        this.currentCity = city;

        const grid = document.getElementById("cityGrid");
        const manager = new BuildingManager();

        grid.innerHTML = "";

        for (let y = 0; y < map.alto; y++) {
            for (let x = 0; x < map.ancho; x++) {
                const cell = document.createElement("button");
                cell.classList.add("grid-cell");
                cell.dataset.x = x;
                cell.dataset.y = y;

                const existing = map.obtenerCelda(x, y);

                if (existing) {
                    if (existing instanceof Road) cell.classList.add("via");
                    if (existing instanceof ResidentialBuilding) cell.classList.add(existing.tipo);
                    if (existing instanceof CommercialBuilding) cell.classList.add(existing.tipo);
                    if (existing instanceof IndustrialBuilding) cell.classList.add(existing.tipo);
                    if (existing instanceof ServiceBuilding) cell.classList.add(existing.tipo);
                    if (existing instanceof UtilityPlant) cell.classList.add(existing.tipo);
                    if (existing instanceof Park) cell.classList.add("parque");
                }

                if (this.currentRouteCells.some(routeCell => routeCell.x === x && routeCell.y === y)) {
                    cell.classList.add("route-active");
                }

                cell.addEventListener("click", async () => {
                    if (city.gameOver) {
                        alert("La ciudad ya terminó (Game Over)");
                        return;
                    }

                    const clickedObject = map.obtenerCelda(x, y);
                    const modo = MapController.modo;

                    if (MapController.routeModeActive) {
                        await MapController.handleRouteSelection(clickedObject);
                        return;
                    }

                    if (!modo) {
                        if (clickedObject) {
                            MapController.openBuildingInfo(clickedObject);
                        }
                        return;
                    }

                    if (modo === "demolish") {
                        if (!clickedObject) {
                            alert("No hay nada para demoler en esa celda.");
                            return;
                        }

                        const nombre = UIController.formatBuildingName(clickedObject);
                        let afectados = "";

                        if (clickedObject instanceof ResidentialBuilding && clickedObject.residentes.length > 0) {
                            afectados = `\nCiudadanos afectados: ${clickedObject.residentes.length}`;
                        }

                        if (
                            !confirm(`¿Demoler ${nombre}?${afectados}\nSe recuperará el 50% del costo.`)
                        ) {
                            return;
                        }

                        const demolido = manager.demoler(city, x, y);

                        if (demolido) {
                            StorageService.saveGame(city);
                            RankingService.updateCityRanking(city);
                            UIController.update(city);
                            MapController.renderMap(city.map, city);
                        }

                        return;
                    }

                    const building = MapController.crearEdificio(modo, x, y);
                    if (!building) return;

                    const construido = manager.construir(city, building, x, y);

                    if (construido) {
                        StorageService.saveGame(city);
                        RankingService.updateCityRanking(city);
                        UIController.update(city);
                        MapController.renderMap(city.map, city);
                    } else {
                        alert("No fue posible construir en esa celda.");
                    }
                });

                grid.appendChild(cell);
            }
        }

        grid.style.gridTemplateColumns = `repeat(${map.ancho}, 42px)`;
        this.applyZoom();
    }

    static initUI() {
        document.querySelectorAll("[data-build-type]").forEach(btn => {
            btn.addEventListener("click", () => {
                MapController.routeModeActive = false;
                MapController.modo = btn.dataset.buildType;
                UIController.updateCurrentMode(MapController.modo || "Ninguno");
                UIController.updateRouteInfo("sin seleccionar", "sin seleccionar", "inactivo");
            });
        });

        document.getElementById("btnCancelMode").addEventListener("click", () => {
            MapController.modo = null;
            MapController.routeModeActive = false;
            MapController.clearRouteSelection(false);
            UIController.updateCurrentMode("Ninguno");
            UIController.updateRouteInfo("sin seleccionar", "sin seleccionar", "inactivo");
        });

        document.getElementById("btnDemolishMode").addEventListener("click", () => {
            MapController.routeModeActive = false;
            MapController.modo = "demolish";
            UIController.updateCurrentMode("demolish");
            UIController.updateRouteInfo("sin seleccionar", "sin seleccionar", "inactivo");
        });

        const btnStartRouteMode = document.getElementById("btnStartRouteMode");
        if (btnStartRouteMode) {
            btnStartRouteMode.addEventListener("click", () => {
                if (!MapController.currentCity) {
                    alert("No hay ciudad cargada.");
                    return;
                }

                MapController.modo = null;
                MapController.routeModeActive = true;
                MapController.clearRouteSelection(false);

                UIController.updateCurrentMode("route");
                UIController.updateRouteInfo("sin seleccionar", "sin seleccionar", "selecciona edificio de origen");
            });
        }

        const btnClearRoute = document.getElementById("btnClearRoute");
        if (btnClearRoute) {
            btnClearRoute.addEventListener("click", () => {
                MapController.clearRouteSelection(true);
                UIController.updateRouteInfo("sin seleccionar", "sin seleccionar", "ruta limpiada");
            });
        }

        const btnDemolishFromInfo = document.getElementById("btnDemolishFromInfo");
        if (btnDemolishFromInfo) {
            btnDemolishFromInfo.addEventListener("click", () => {
                if (!MapController.currentCity || !MapController.selectedBuilding) {
                    return;
                }

                const building = MapController.selectedBuilding;
                const nombre = UIController.formatBuildingName(building);

                let afectados = "";
                if (building instanceof ResidentialBuilding && building.residentes.length > 0) {
                    afectados = `\nCiudadanos afectados: ${building.residentes.length}`;
                }

                if (!confirm(`¿Demoler ${nombre}?${afectados}\nSe recuperará el 50% del costo.`)) {
                    return;
                }

                const manager = new BuildingManager();
                const demolido = manager.demoler(MapController.currentCity, building.x, building.y);

                if (demolido) {
                    StorageService.saveGame(MapController.currentCity);
                    RankingService.updateCityRanking(MapController.currentCity);
                    UIController.update(MapController.currentCity);
                    MapController.renderMap(MapController.currentCity.map, MapController.currentCity);

                    const modalElement = document.getElementById("buildingInfoModal");
                    if (modalElement) {
                        const modalInstance = bootstrap.Modal.getInstance(modalElement);
                        if (modalInstance) modalInstance.hide();
                    }
                }
            });
        }

        const btnZoomIn = document.getElementById("btnZoomIn");
        const btnZoomOut = document.getElementById("btnZoomOut");
        const btnCenterMap = document.getElementById("btnCenterMap");

        if (btnZoomIn) {
            btnZoomIn.addEventListener("click", () => {
                MapController.zoomIn();
            });
        }

        if (btnZoomOut) {
            btnZoomOut.addEventListener("click", () => {
                MapController.zoomOut();
            });
        }

        if (btnCenterMap) {
            btnCenterMap.addEventListener("click", () => {
                MapController.centerMap();
            });
        }
    }

    static openBuildingInfo(building) {
        MapController.selectedBuilding = building;
        UIController.renderBuildingInfo(building);

        const modalElement = document.getElementById("buildingInfoModal");
        if (!modalElement) return;

        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }

    static isSelectableBuildingForRoute(object) {
        return (
            object &&
            !(object instanceof Road)
        );
    }

    static getAdjacentRoad(building) {
        const city = MapController.currentCity;
        if (!city || !building) return null;

        const directions = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 }
        ];

        for (const dir of directions) {
            const nx = building.x + dir.dx;
            const ny = building.y + dir.dy;

            if (!city.map.esValida(nx, ny)) continue;

            const cell = city.map.obtenerCelda(nx, ny);
            if (cell instanceof Road) {
                return { x: nx, y: ny };
            }
        }

        return null;
    }

    static async handleRouteSelection(clickedObject) {
        if (!MapController.isSelectableBuildingForRoute(clickedObject)) {
            alert("Debes seleccionar un edificio, no una vía ni una celda vacía.");
            return;
        }

        if (!MapController.routeOriginBuilding) {
            MapController.routeOriginBuilding = clickedObject;
            UIController.updateRouteInfo(
                `${UIController.formatBuildingName(clickedObject)} (${clickedObject.x},${clickedObject.y})`,
                "sin seleccionar",
                "selecciona edificio de destino"
            );
            return;
        }

        if (!MapController.routeDestinationBuilding) {
            MapController.routeDestinationBuilding = clickedObject;

            UIController.updateRouteInfo(
                `${UIController.formatBuildingName(MapController.routeOriginBuilding)} (${MapController.routeOriginBuilding.x},${MapController.routeOriginBuilding.y})`,
                `${UIController.formatBuildingName(clickedObject)} (${clickedObject.x},${clickedObject.y})`,
                "calculando ruta..."
            );

            await MapController.calculateAndRenderRoute();
        }
    }

    static async calculateAndRenderRoute() {
        try {
            const originRoad = MapController.getAdjacentRoad(MapController.routeOriginBuilding);
            const destinationRoad = MapController.getAdjacentRoad(MapController.routeDestinationBuilding);

            if (!originRoad || !destinationRoad) {
                throw new Error("Uno de los edificios no tiene una vía adyacente.");
            }

            const route = await RoutingService.calculateRouteAsXY(
                MapController.currentCity.map,
                originRoad.x,
                originRoad.y,
                destinationRoad.x,
                destinationRoad.y
            );

            MapController.currentRouteCells = route;
            MapController.renderMap(MapController.currentCity.map, MapController.currentCity);

            UIController.updateRouteInfo(
                `${UIController.formatBuildingName(MapController.routeOriginBuilding)} (${MapController.routeOriginBuilding.x},${MapController.routeOriginBuilding.y})`,
                `${UIController.formatBuildingName(MapController.routeDestinationBuilding)} (${MapController.routeDestinationBuilding.x},${MapController.routeDestinationBuilding.y})`,
                `ruta calculada (${route.length} celdas)`
            );
        } catch (error) {
            MapController.currentRouteCells = [];
            MapController.renderMap(MapController.currentCity.map, MapController.currentCity);
            UIController.updateRouteInfo(
                "sin seleccionar",
                "sin seleccionar",
                error.message || "no hay ruta disponible"
            );
            alert(error.message || "No hay ruta disponible entre estos edificios");
        }
    }

    static clearRouteSelection(resetMode = true) {
        MapController.routeOriginBuilding = null;
        MapController.routeDestinationBuilding = null;
        MapController.currentRouteCells = [];

        if (resetMode) {
            MapController.routeModeActive = false;
            MapController.modo = null;
            UIController.updateCurrentMode("Ninguno");
        }

        if (MapController.currentCity) {
            MapController.renderMap(MapController.currentCity.map, MapController.currentCity);
        }
    }

    static applyZoom() {
        const grid = document.getElementById("cityGrid");
        if (!grid) return;

        grid.style.transform = `scale(${this.zoomLevel})`;
        grid.style.transformOrigin = "center center";
    }

    static zoomIn() {
        if (this.zoomLevel < this.maxZoom) {
            this.zoomLevel += 0.1;
            this.applyZoom();
        }
    }

    static zoomOut() {
        if (this.zoomLevel > this.minZoom) {
            this.zoomLevel -= 0.1;
            this.applyZoom();
        }
    }

    static centerMap() {
        const container = document.getElementById("mapContainer");
        const grid = document.getElementById("cityGrid");

        if (!container || !grid) return;

        container.scrollTop = (grid.scrollHeight - container.clientHeight) / 2;
        container.scrollLeft = (grid.scrollWidth - container.clientWidth) / 2;
    }
}

export default MapController;