class City {

    constructor(id, nombre, map, resources) {
        this.id = id;
        this.nombre = nombre;
        this.region = ""; 
        this.turno = 1;
        this.puntaje = 0;
        this.felicidadPromedio = 100;
        this.map = map; 
        this.resources = resources;
        this.citizens = [];
        this.buildings = [];

    }

    // Metodos de ciudadanos

    agregarCitizen(citizen) {
        this.citizens.push(citizen);
    }

    eliminarCitizenPorId(idCitizen) {
        const nuevaLista = [];

        for (let i = 0; i < this.citizens.length; i++) {
            if (this.citizens[i].id !== idCitizen) {
                nuevaLista.push(this.citizens[i]);
            }
        }

        this.citizens = nuevaLista;
    }

    obtenerCitizenPorId(idCitizen) {
        for (let i = 0; i < this.citizens.length; i++) {
            if (this.citizens[i].id === idCitizen) {
                return this.citizens[i];
            }
        }
        return null;
    }

    // METODOS DE EDIFICIOS

    agregarBuilding(building) {
        this.buildings.push(building);
    }

    eliminarBuildingPorId(idBuilding) {
        const nuevaLista = [];
        for (let i = 0; i < this.buildings.length; i++) {
            if (this.buildings[i].id !== idBuilding) {
                nuevaLista.push(this.buildings[i]);
            }
        }
        this.buildings = nuevaLista;
    }

    obtenerBuildingPorId(idBuilding) {
        for (let i = 0; i < this.buildings.length; i++) {
            if (this.buildings[i].id === idBuilding) {
                return this.buildings[i];
            }
        }
        return null;
    }

    // METODOS EXTRA

    cantidadCitizens() {
        return this.citizens.length;
    }

    cantidadBuildings() {
        return this.buildings.length;
    }


}