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

    // felicidad promedio por residencia cuando se ponga "ver informacion de la residencia"
    calcularFelicidadPromedio() {
        if (this.residentes.length === 0) {
            return 0;
        }
        let total = 0;
        for (let ciudadano of this.residentes) {
            total += ciudadano.felicidad;
        }
        return total / this.residentes.length;
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
    
    //elimina todos los residentes de un ResidentialBuilding 
    eliminarResidentes() {
        for (let ciudadano of this.residentes) {
            ciudadano.removerVivienda();
        }
        this.residentes = [];
    }

}