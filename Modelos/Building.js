class Building {

    constructor(id, costo, x, y) {
        if (this.constructor === Building) {
            throw new Error("Building es una clase abstracta y no puede instanciarse directamente.");
        }

        this.id = id;
        this.costo = costo;
        this.x = x;
        this.y = y;
    }

}