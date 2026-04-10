import Building from "./Building.js";

class ServiceBuilding extends Building {

    static TIPOS = {
        POLICIA: "estacion_policia",
        BOMBEROS: "estacion_bomberos",
        HOSPITAL: "hospital"
    };

    constructor(id, tipo, x, y) {

        let costo;
        let radio;
        let beneficioFelicidad;
        let consumoElectricidad = 0;
        let consumoAgua = 0;

        if (tipo === ServiceBuilding.TIPOS.POLICIA || tipo === ServiceBuilding.TIPOS.BOMBEROS) {
            costo = 4000;
            radio = 5;
            beneficioFelicidad = 10;
            consumoElectricidad = 15;
        } else if (tipo === ServiceBuilding.TIPOS.HOSPITAL) {
            costo = 6000;
            radio = 7;
            beneficioFelicidad = 10;
            consumoElectricidad = 20;
            consumoAgua = 10;
        } else {
            throw new Error("Tipo de servicio invalido");
        }

        super(id, costo, x, y);

        // atributos
        this.tipo = tipo;
        this.radio = radio;
        this.beneficioFelicidad = beneficioFelicidad;
        this.consumoElectricidad = consumoElectricidad;
        this.consumoAgua = consumoAgua;
    }

    getDisplayType() {
        return "Servicio";
    }

    getDisplayName() {
        const displayNames = {
            [ServiceBuilding.TIPOS.POLICIA]: "Estación de Policía",
            [ServiceBuilding.TIPOS.BOMBEROS]: "Estación de Bomberos",
            [ServiceBuilding.TIPOS.HOSPITAL]: "Hospital"
        };

        return displayNames[this.tipo] || "Servicio";
    }

}

export default ServiceBuilding;