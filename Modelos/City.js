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

    agregarBuildingPorId(idBuilding) {
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

    //construir una construccion/building y verificar si es via o si tiene una via adyacente 

    construirBuilding(building, x, y) {

        if (!this.map.esValida(x, y)) {
            console.log("Posicion invalida");
            return false;
        }

        if (!this.map.estaLibre(x, y)) {
            console.log("La celda esta ocupada");
            return false;
        }

        // Si no es Road, necesita via adyacente
        if (!(building instanceof Road)) {

            if (!this.map.hayViaAdyacente(x, y)) {
                console.log("No se puede construir: falta via adyacente");
                return false;
            }
        }

        //si pasa las condiciones entonces:
        
        // Actualizar posicion del edificio
        building.x = x;
        building.y = y;

        // Colocar en mapa
        this.map.colocar(building, x, y);

        // Agregar a la lista de edificios
        this.agregarBuilding(building);

        return true;
    }


}