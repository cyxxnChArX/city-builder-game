class Building {

    constructor(id, costo, x, y) {
        if (this.constructor === Building) {
            throw new Error("Building es una clase abstracta y no puede instanciarse directamente.");
        }

        this.id = id;
        this.costo = costo;
        this.x = x;
        this.y = y;
        this.costoMantenimiento = costo * 0.0001;
    }

    requiresRoad() {
        return true;
    }

    getDisplayType() {
        return this.constructor.name;
    }

    getDisplayName() {
        return this.constructor.name;
    }

}

export default Building;