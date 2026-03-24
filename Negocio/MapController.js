import BuildingManager from "./BuildingManager.js";
import Road from "../Modelos/Road.js";
import ResidentialBuilding from "../Modelos/ResidentialBuilding.js";
import EmploymentBuilding from "../Modelos/EmploymentBuilding.js";
import ServiceBuilding from "../Modelos/ServiceBuilding.js";
import UtilityPlant from "../Modelos/UtilityPlant.js";
import Park from "../Modelos/Park.js";

import StorageService from "../Datos/StorageService.js";
import CommercialBuilding from "../Modelos/CommercialBuilding.js";
import IndustrialBuilding from "../Modelos/IndustrialBuilding.js";

class MapController {

    static modo = null;

    //  FACTORY DE EDIFICIOS
    static crearEdificio(tipo, x, y) {

        const id = `${tipo}_${Date.now()}`;

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

                //  PINTAR SEGÚN TIPO
                if (existing) {

                    if (existing instanceof Road) {
                        cell.classList.add("via");
                    }

                    if (existing instanceof ResidentialBuilding) {
                        cell.classList.add(existing.tipo); // casa o apartamento
                    }

                    if (existing instanceof CommercialBuilding) {
                        cell.classList.add(existing.tipo); // tienda
                    }

                    if (existing instanceof IndustrialBuilding) {
                        cell.classList.add(existing.tipo); // fabrica o granja
                    }

                    if (existing instanceof ServiceBuilding) {
                        cell.classList.add(existing.tipo); //estacion de bomberos o de policia u hospital
                    }

                    if (existing instanceof UtilityPlant) {
                        cell.classList.add(existing.tipo); //planta electrica o de agua
                    }

                    if (existing instanceof Park) {
                        cell.classList.add("parque"); //parque :p
                    }
                }

                //  CLICK
                cell.addEventListener("click", () => {

                        if (city.gameOver) {
                            alert("La ciudad ya terminó (Game Over)");
                            return;
                        }

                    console.log("Click en:", x, y);

                    const modo = MapController.modo;
                    if (!modo) return;

                    //  DEMOLER
                    if (modo === "demolish") {
                        const demolido = manager.demoler(city, x, y);

                        if (demolido) {
                            cell.className = "grid-cell";
                            StorageService.saveGame(city);
                        }
                        return;
                    }

                    //  CREAR DINÁMICO
                    const building = MapController.crearEdificio(modo, x, y);

                    if (!building) return;

                    const construido = manager.construir(city, building, x, y);

                    if (construido) {
                        cell.classList.add(building.tipo || modo);
                        StorageService.saveGame(city);
                    }

                });

                grid.appendChild(cell);
            }
        }

        grid.style.gridTemplateColumns = `repeat(${map.ancho}, 42px)`;
    }

    static initUI() {

        // BOTONES DE CONSTRUCCIÓN
        document.querySelectorAll("[data-build-type]").forEach(btn => {
            btn.addEventListener("click", () => {
                MapController.modo = btn.dataset.buildType;
                console.log("Modo:", MapController.modo);
            });
        });

        // CANCELAR
        document.getElementById("btnCancelMode").addEventListener("click", () => {
            MapController.modo = null;
            console.log("Modo cancelado");
        });

        // DEMOLER
        document.getElementById("btnDemolishMode").addEventListener("click", () => {
            MapController.modo = "demolish";
            console.log("Modo demolición");
        });
    }
}

export default MapController;
