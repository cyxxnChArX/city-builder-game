import Building from "./Building.js";

class Road extends Building {

    constructor(id, x, y) {
        const costo = 100;
        super(id, costo, x, y);
    }

    requiresRoad() {
        return false;
    }

    getDisplayType() {
        return "Vía";
    }

    getDisplayName() {
        return "Vía";
    }
}

export default Road;