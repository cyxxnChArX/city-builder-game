class Park extends Building {

    constructor(id, x, y) {
        const costo = 1500;
        const beneficioFelicidad = 5;

        super(id, costo, x, y);

        this.beneficioFelicidad = beneficioFelicidad;
    }

}