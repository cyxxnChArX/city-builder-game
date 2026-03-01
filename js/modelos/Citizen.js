class Citizen {

    constructor(id, consumoAgua = 1, consumoElectricidad = 1, consumoComida = 1) {
        this.id = id;
        this.felicidad = 100;

        this.home = null;   // ResidentialBuilding
        this.job = null;    // EmploymentBuilding

        // Consumo por turno (configurable)
        this.consumoAgua = consumoAgua;
        this.consumoElectricidad = consumoElectricidad;
        this.consumoComida = consumoComida;
    }

    //metodos para ver si tiene o no tiene vivienda o empleo

    tieneVivienda() {
        return this.home !== null;
    }

    tieneEmpleo() {
        return this.job !== null;
    }

    // metodos que usaremos para asignarle una vivienda/empleo o removerla 

    asignarVivienda(residencia) {
        this.home = residencia;
    }

    removerVivienda() {
        this.home = null;
    }

    asignarEmpleo(trabajo) {
        this.job = trabajo;
    }

    removerEmpleo() {
        this.job = null;
    }

    // rango de felicidad individual cuando lo cambiemos en cada turno
    modificarFelicidad(valor) {
        this.felicidad += valor;

        if (this.felicidad > 100) this.felicidad = 100;
        if (this.felicidad < 0) this.felicidad = 0;
    }

}