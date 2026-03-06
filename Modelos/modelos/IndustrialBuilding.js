class IndustrialBuilding extends EmploymentBuilding {

    static TIPOS = {
        FABRICA: "fabrica",
        GRANJA: "granja"
    };

    constructor(id, tipo, x, y) {

        let costo;
        let capacidadEmpleo;
        let produccionPorTurno;
        let consumoElectricidad = 0;
        let consumoAgua = 0;

        if (tipo === IndustrialBuilding.TIPOS.FABRICA) {

            capacidadEmpleo = 15;
            costo = 5000;
            produccionPorTurno = 800; // dinero
            consumoElectricidad = 20;
            consumoAgua = 15;

        } else if (tipo === IndustrialBuilding.TIPOS.GRANJA) {

            capacidadEmpleo = 8;
            costo = 3000;
            produccionPorTurno = 50; // alimentos
            consumoAgua = 10;

        } else {
            throw new Error("Tipo industrial invalido");
        }

        super(id, costo, x, y, tipo, capacidadEmpleo);

        // atributos propios de industrial
        this.produccionPorTurno = produccionPorTurno;
        this.consumoElectricidad = consumoElectricidad;
        this.consumoAgua = consumoAgua;
    }

}