class CommercialBuilding extends EmploymentBuilding {

    static TIPOS = {
        TIENDA: "tienda",
        CENTRO_COMERCIAL: "centro_comercial"
    };

    constructor(id, tipo, x, y) {

        let costo;
        let capacidadEmpleo;
        let ingresoPorTurno;
        let consumoElectricidad;

        if (tipo === CommercialBuilding.TIPOS.TIENDA) {

            capacidadEmpleo = 6;
            costo = 2000;
            ingresoPorTurno = 500;
            consumoElectricidad = 8;

        } else if (tipo === CommercialBuilding.TIPOS.CENTRO_COMERCIAL) {

            capacidadEmpleo = 20;
            costo = 8000;
            ingresoPorTurno = 2000;
            consumoElectricidad = 25;

        } else {
            throw new Error("Tipo comercial invalido");
        }

        super(id, costo, x, y, tipo, capacidadEmpleo);

        // atributos propios de comercial
        this.ingresoPorTurno = ingresoPorTurno;
        this.consumoElectricidad = consumoElectricidad;
    }

}