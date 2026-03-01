class ResidentialBuilding extends Building {

    static TIPOS = {
        CASA: "casa",
        APARTAMENTO: "apartamento"
    };

    constructor(id, tipo, x, y) {

        let costo;
        let capacidad;
        let consumoElectricidad;
        let consumoAgua;

        if (tipo === ResidentialBuilding.TIPOS.CASA) {
            costo = 1000;
            capacidad = 4;
            consumoElectricidad = 5;
            consumoAgua = 3;

        } else if (tipo === ResidentialBuilding.TIPOS.APARTAMENTO) {
            costo = 3000;
            capacidad = 12;
            consumoElectricidad = 15;
            consumoAgua = 10;

        } else {
            throw new Error("Tipo de edificio residencial inválido");
        }

        super(id, costo, x, y);

        this.tipo = tipo;
        this.capacidad = capacidad;
        this.consumoElectricidad = consumoElectricidad;
        this.consumoAgua = consumoAgua;
        this.residentes = [];
    }

    agregarResidente(citizen) {
        if (this.residentes.length < this.capacidad) {
            this.residentes.push(citizen);
            return true;
        }
        return false;
    }

    eliminarResidentePorId(idCitizen) {
        const nuevaLista = [];
        for (let i = 0; i < this.residentes.length; i++) {
            if (this.residentes[i].id !== idCitizen) {
                nuevaLista.push(this.residentes[i]);
            }
        }
        this.residentes = nuevaLista;
    }

}