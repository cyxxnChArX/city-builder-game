import CitizensSystem from "./CitizensSystem.js";
import ScoringSystem from "./ScoreManager.js";

import CommercialBuilding from "../Modelos/CommercialBuilding.js";
import IndustrialBuilding from "../Modelos/IndustrialBuilding.js";
import UtilityPlant from "../Modelos/UtilityPlant.js";

class TurnBasedSystem {

    constructor(city, turnDuration = 10000) {

        this.city = city;
        this.turnDuration = turnDuration;

        this.citizenSystem = new CitizensSystem();

        this.interval = null;
    }

    //==============================
    // INICIAR CICLO DE TURNOS
    //==============================

    start() {

        this.interval = setInterval(() => {
            this.executeTurn();
        }, this.turnDuration);

    }

    stop() {
        clearInterval(this.interval);
    }

    //==============================
    // TURNO PRINCIPAL
    //==============================

    executeTurn() {

        this.city.turno++;

        this.calculateProduction();

        this.calculateConsumption();

        this.applyMaintenance();

        this.citizenSystem.procesarTurno(this.city);

        ScoringSystem.updateCityScore(this.city);

        this.checkGameOver();

        this.saveGame();
    }

    //==============================
    // PRODUCCIÓN DE RECURSOS
    //==============================

    calculateProduction() {

        for (let building of this.city.buildings) {

            if (building instanceof CommercialBuilding) {

                if (this.city.resources.electricidad > building.consumoElectricidad) {
                    this.city.resources.dinero += building.ingresoPorTurno;
                }

            }

            if (building instanceof IndustrialBuilding) {

                if ( this.city.resources.electricidad > 0 && this.city.resources.agua > 0) {

                    if (building.tipo === IndustrialBuilding.TIPOS.FABRICA) {
                        this.city.resources.dinero += building.produccionPorTurno;
                    }
                }

                if (building.tipo === IndustrialBuilding.TIPOS.GRANJA) {
                    if (this.city.resources.agua > 0) {
                        this.city.resources.alimentos += building.produccionPorTurno;
                    }                    
                }

            }

            if (building instanceof UtilityPlant) {

                if (building.tipo === UtilityPlant.TIPOS.PLANTA_ELECTRICA) {
                    this.city.resources.electricidad += building.produccionElectricidad;
                }

                if (building.tipo === UtilityPlant.TIPOS.PLANTA_AGUA) {

                    if (this.city.resources.electricidad >= building.consumoElectricidad) {
                        this.city.resources.agua += building.produccionAgua;
                    }

                }
            }
        }
    }

    //==============================
    // CONSUMO DE RECURSOS
    //==============================

    calculateConsumption() {

        let consumoElectricidad = 0;
        let consumoAgua = 0;

        for (let building of this.city.buildings) {

            if (building.consumoElectricidad) {
                consumoElectricidad += building.consumoElectricidad;
            }

            if (building.consumoAgua) {
                consumoAgua += building.consumoAgua;
            }
        }

        this.city.resources.electricidad -= consumoElectricidad;
        this.city.resources.agua -= consumoAgua;
    }

    //==============================
    // COSTOS DE MANTENIMIENTO
    //==============================

    applyMaintenance() {

        //10 es un valor configurable
        let maintenanceCost = this.city.buildings.length * 10;

        this.city.resources.dinero -= maintenanceCost;

    }

    //==============================
    // GAME OVER
    //==============================

    checkGameOver() {

        if (this.city.resources.electricidad < 0) {

            alert("Game Over: electricidad negativa");
            this.stop();
        }

        if (this.city.resources.agua < 0) {

            alert("Game Over: agua negativa");
            this.stop();
        }

    }

    //==============================
    // GUARDAR PARTIDA
    //==============================

    saveGame() {

        const data = JSON.stringify(this.city);

        localStorage.setItem("cityGame", data);

    }

}

export default TurnBasedSystem;
