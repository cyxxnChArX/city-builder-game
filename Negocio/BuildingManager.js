import Road from "../Modelos/Road.js";
import ResidentialBuilding from "../Modelos/ResidentialBuilding.js";
import EmploymentBuilding from "../Modelos/EmploymentBuilding.js";

class BuildingManager {

    //construir una construccion/building y verificar si es via o si tiene una via adyacente 

    construir(city, building, x, y) {

        if (!city.map.esValida(x, y)) {
            console.log("Posicion invalida");
            return false;
        }

        if (!city.map.estaLibre(x, y)) {
            console.log("Celda ocupada");
            return false;
        }

        if (city.resources.dinero < building.costo) {
            console.log("Dinero insuficiente");
            return false;
        }

        // Si no es Road, necesita via adyacente
        if (!(building instanceof Road)) {
            if (!city.map.hayViaAdyacente(x, y)) {
                console.log("No hay via adyacente");
                return false;
            }
        }
        //si pasa las condiciones entonces:
        // Actualizar posicion del edificio

        city.resources.dinero -= building.costo;

        building.x = x;
        building.y = y;

        // Colocar en mapa
        city.map.colocar(building, x, y);

        // Agregar a la lista de edificios
        city.agregarBuilding(building);

        return true;
    }

    demoler(city, x, y) {

        //si no esta fuera de la matriz la posicion 
        if (!city.map.esValida(x, y)) {
            console.log("Posicion invalida");
            return false;
        }

        const building = city.map.obtenerCelda(x, y);

        // si la celda esta vacia no se puede demoler nada
        if (!building) {
            console.log("No hay edificio en esa celda");
            return false;
        }

        if (building instanceof ResidentialBuilding) {

            // desalojar ciudadanos llamando al metodo del edificio residential dejando de una vez a los ciudadanos sin casa
            building.eliminarResidentes();
        }

        if (building instanceof EmploymentBuilding) {
            //lo mismo que arriba pero si ese edificio tiene empleados
            building.eliminarEmpleados();
        }

        // recuperar dinero (50%)
        const dineroRecuperado = Math.floor(building.costo * 0.5);
        city.resources.dinero += dineroRecuperado;

        // eliminar del mapa
        city.map.eliminar(x, y);

        // eliminar de lista de edificios
        city.eliminarBuildingPorId(building.id);

        console.log("Edificio demolido. Dinero recuperado:", dineroRecuperado);

        return true;
    }

    //puede servir para ver info del building
    obtenerBuilding(city, x, y) {
        if (!city.map.esValida(x, y)) return null;
        return city.map.obtenerCelda(x, y);
    }

}

export default BuildingManager;
