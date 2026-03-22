import CitizensSystem from "./CitizensSystem.js";
import ScoringSystem from "./ScoringSystem.js";
import StorageService from "../Datos/StorageService.js";

import CommercialBuilding from "../Modelos/CommercialBuilding.js";
import IndustrialBuilding from "../Modelos/IndustrialBuilding.js";
import UtilityPlant from "../Modelos/UtilityPlant.js";
import Building from "../Modelos/Building";
import EmploymentBuilding from "../Modelos/EmploymentBuilding";

class TurnBasedSystem {

    constructor(city, turnDuration = 10000) {

        this.city = city;
        this.turnDuration = turnDuration;

        this.citizenSystem = new CitizensSystem();

        this.turnInterval = null;
        this.autoSaveInterval = null;
    }

    //==============================
    // INICIAR CICLO DE TURNOS
    //==============================

    start() {

        this.turnInterval = setInterval(() => {
            this.executeTurn();
        }, this.turnDuration);

        this.autoSaveInterval = setInterval(() => {
            this.saveGame();
        }, 30000);
    }

    stop() {
        clearInterval(this.turnInterval);
        clearInterval(this.autoSaveInterval);

        this.turnInterval = null;
        this.autoSaveInterval = null;
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

                if (this.city.resources.electricidad >= building.consumoElectricidad) {
                    this.city.resources.dinero += building.ingresoPorTurno;
                }

            }

            if (building instanceof IndustrialBuilding) {

                if ( this.city.resources.electricidad > 0 && this.city.resources.agua > 0) {

                    if (building.tipo === IndustrialBuilding.TIPOS.FABRICA) {

                        const electricidad = this.city.resources.electricidad;
                        const agua = this.city.resources.agua;

                        if (electricidad >= building.consumoElectricidad &&
                            agua >= building.consumoAgua) {

                            // producción completa osea del 100% 
                            this.city.resources.dinero += building.produccionPorTurno;

                        } else if (electricidad > 0 && agua > 0) {

                            // producción reducida al 50% si no cumple con que agua o electricidad sea mayor a lo que consume
                            this.city.resources.dinero += building.produccionPorTurno * 0.5;
                        } 
                        // si alguno es 0 sea cual sea no produce nada
                    }

                    if (building.tipo === IndustrialBuilding.TIPOS.GRANJA) {

                        const agua = this.city.resources.agua;

                        if (agua >= building.consumoAgua) {

                            // producción completa osea del 100% 
                            this.city.resources.alimentos += building.produccionPorTurno;

                        } else if (agua > 0) {

                            // producción reducida al 50% si no cumple con que agua sea mayor a lo que consume
                            this.city.resources.alimentos += building.produccionPorTurno * 0.5;
                        }
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
        let total = 0;
        for (let building of this.city.buildings) {
            total += building.costoMantenimiento;
        }
        this.city.resources.dinero -= total;
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
        StorageService.saveGame(this.city);
    }

}

export default TurnBasedSystem;
