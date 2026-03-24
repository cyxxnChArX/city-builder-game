import BuildingManager from "./BuildingManager.js";
import Road from "../Modelos/Road.js";
import ResidentialBuilding from "../Modelos/ResidentialBuilding.js";
import StorageService from "../Datos/StorageService.js";

class MapController {

    static renderMap(map, city) {
        const grid = document.getElementById("cityGrid");
        const manager = new BuildingManager(); // gestor de construcciones

        // limpiar grid
        grid.innerHTML = "";

        for (let y = 0; y < map.alto; y++) {
            for (let x = 0; x < map.ancho; x++) {

                const cell = document.createElement("button");
                cell.classList.add("grid-cell");

                cell.dataset.x = x;
                cell.dataset.y = y;

                // 🔹 Si ya hay algo guardado en el mapa, pintarlo
                const existing = map.obtenerCelda(x, y);

                if (existing) {
                    if (existing.constructor.name === "Road") {
                        cell.classList.add("road");
                    }
                    if (existing.constructor.name === "ResidentialBuilding") {
                        cell.classList.add("residential");
                    }
                }

                // 🔹 CLICK EN CELDA
                cell.addEventListener("click", () => {

                    console.log("Click en:", x, y);

                    let construido = false;

                    // 👉 CAMBIA ESTO PARA PROBAR
                    const modo = "road"; 
                    // luego puedes cambiar a "residential"

                    if (modo === "road") {
                        const road = new Road(`road_${Date.now()}`, x, y);
                        construido = manager.construir(city, road, x, y);

                        if (construido) {
                            cell.classList.add("road");
                        }
                    }

                    if (modo === "residential") {
                        const building = new ResidentialBuilding(
                            `res_${Date.now()}`,
                            "R1",
                            x,
                            y
                        );

                        construido = manager.construir(city, building, x, y);

                        if (construido) {
                            cell.classList.add("residential");
                        }
                    }

                    if (construido) {
                        StorageService.saveGame(city);
                    }

                });

                grid.appendChild(cell);
            }
        }

        grid.style.gridTemplateColumns = `repeat(${map.ancho}, 42px)`;
    }
}

export default MapController;
