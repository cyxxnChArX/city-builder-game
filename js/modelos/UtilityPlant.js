class UtilityBuilding extends Building {

    static TIPOS = {
        PLANTA_ELECTRICA: "planta_electrica",
        PLANTA_AGUA: "planta_agua"
    };

    constructor(id, tipo, x, y) {

        let costo;
        let produccionElectricidad = 0;
        let produccionAgua = 0;
        let consumoElectricidad = 0;

        if (tipo === UtilityBuilding.TIPOS.PLANTA_ELECTRICA) {
            costo = 10000;
            produccionElectricidad = 200;
        } else if (tipo === UtilityBuilding.TIPOS.PLANTA_AGUA) {
            costo = 8000;
            produccionAgua = 150;
            consumoElectricidad = 20;
        } else {
            throw new Error("Tipo de utilidad invalido");
        }

        super(id, costo, x, y);

        //atributos propios de UtilityPlant
        this.tipo = tipo;
        this.produccionElectricidad = produccionElectricidad;
        this.produccionAgua = produccionAgua;
        this.consumoElectricidad = consumoElectricidad;
    }

}