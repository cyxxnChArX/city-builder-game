import Citizen from "../Modelos/Citizen.js";
import ResidentialBuilding from "../Modelos/ResidentialBuilding.js";
import EmploymentBuilding from "../Modelos/EmploymentBuilding.js";
import ServiceBuilding from "../Modelos/ServiceBuilding.js";
import Park from "../Modelos/Park.js";

class CitizensSystem {

    //valores que se podrian cambiar si es necesario pero por defecto son 1 y 3 se usaron para crear esa cantidad de ciudadanos
    constructor() {
        this.tasaMinima = 1;
        this.tasaMaxima = 3;
    }

    //metodo que hace el orden correcto de la simulacion de ciudadanoss
    procesarTurno(city) {

        // 1 resolver ciudadanos sin casa o empleo
        this.asignarViviendaYEmpleoPendientes(city);

        // 2 actualizar felicidad individual
        this.actualizarFelicidadCiudadanos(city);

        // 3 calcular felicidad promedio
        city.felicidadPromedio = this.calcularFelicidadPromedio(city);

        // 4 verificar si la ciudad puede crecer
        if (!this.verificarCondiciones(city)) {
            return;
        }

        // 5 crear nuevos ciudadanos
        this.crearCiudadanos(city);
    }

    verificarCondiciones(city) {

        //obtiene el total de capacidad que tiene todas las residencias y si no
        //obtiene todos los empleos disponibles que hayan, no cuenta si esta ocupado un puesto de empleo

        const capacidad_residencial = this.calcularCapacidadResidencial(city);
        const empleos_disponibles = this.calcularEmpleosDisponibles(city);

        //si cumple que la felicidad sea mayor que 60, que la cantidad de empleos sea por lo menos mayor a cero
        // y que de todas las viviendas que haya sea mayor a la cantidad de ciudadanos, cumplira las 3 condiciones
        if (city.felicidadPromedio > 60 && capacidad_residencial > city.cantidadCitizens() && empleos_disponibles > 0){
            return true;
        }
        
        return false;
    }

    crearCiudadanos(city) {
        //toma un numero random entre la tasa maxima y minima para crear esa cantidad de ciudadanos
        const cantidad = Math.floor(Math.random() * (this.tasaMaxima - this.tasaMinima + 1)) + this.tasaMinima;

        //calcular capacidad residencial total y empleos disponibles en la ciudad
        const capacidad_residencial = this.calcularCapacidadResidencial(city);
        const empleos_disponibles = this.calcularEmpleosDisponibles(city);

        //espacios de vivienda disponibles
        const espacios_vivienda = capacidad_residencial - city.cantidadCitizens();

        //el sistema solo puede crear ciudadanos si existen casas y empleos disponibles
        //entonces tomamos el minimo entre casas y empleos para no crear mas ciudadanos de los que el sistema puede soportar
        const limiteSistema = Math.min(espacios_vivienda, empleos_disponibles);

        //limitamos la cantidad random para evitar crear ciudadanos sin casa o trabajo
        const cantidadCrear = Math.min(cantidad, limiteSistema);

        //despues de decidir cuantos ciudadanos crear se le agrega un id que tiene que ser unico
        //entonces sera igual al tamaño de la lista +1 ya que eliminar ciudadanos no es una funcion 

        for (let i = 0; i < cantidadCrear; i++) {
            const id = city.citizens.length + 1;
            const ciudadano = new Citizen(id);

            this.asignarVivienda(ciudadano, city);
            this.asignarEmpleo(ciudadano, city);

            city.agregarCitizen(ciudadano);
        }
    }

    asignarVivienda(ciudadano, city) {
        for (let building of city.buildings) {

            //asi se veria si quiero verificar que la residencia si tiene capacidad disponible

            if (building instanceof ResidentialBuilding) {
                const espacio_disponible = building.capacidad - building.residentes.length;

                //le agrego a la lista de residendes de un ciudadano y a ciudadano le agrego una casa (home)
                if (espacio_disponible > 0) {
                    building.residentes.push(ciudadano);
                    ciudadano.home = building;
                    return true;
                }
            }
        }
        return false;
    }

    asignarEmpleo(ciudadano, city) {
        for (let building of city.buildings) {
            if (building instanceof EmploymentBuilding) {

                //aca este metodo ya verifica que si hayan capacidad de empleados disponibles si no lo agrega deberia
                //seguir con el siguiente edificio ya que retornara un false 

                if (building.agregarEmpleado(ciudadano)) {
                    ciudadano.asignarEmpleo(building);
                    return true;
                }
            }
        }
        return false;
    }

    actualizarFelicidadCiudadanos(city) {
        //llamara al metodo de abajo para hacerlo a caaaadaa ciudadano
        for (let ciudadano of city.citizens) {
            this.calcularFelicidad(ciudadano, city);
        }
    }

    calcularFelicidad(ciudadano, city) {

        let felicidad = 50;
        //factores positivos
        if (ciudadano.tieneVivienda()){
            felicidad += 20;
        }

        if (ciudadano.tieneEmpleo()){
            felicidad += 15;
        }
        //factores negativos
        if (!ciudadano.tieneVivienda()){
            felicidad -= 20;
        }

        if (!ciudadano.tieneEmpleo()){
            felicidad -= 15;
        }

        for (let building of city.buildings) {
            if (building instanceof Park) {
                felicidad += 5;
            }
        }

        // si no tiene vivienda entonces no hace falta hacer lo siguiente
        if (!ciudadano.tieneVivienda()) {
            ciudadano.felicidad = felicidad;
            return;
        }

        //tomo la posicion de la residencia del ciudadano que es x,y con el fin de comparar si esta cerca o lejos de los siguientes
        const xCasa = ciudadano.home.x;
        const yCasa = ciudadano.home.y;

        //recorro la lista de buildings para ver quien es service que son los que tienen rango y generan felicidad
        for (let building of city.buildings){
            
            if (building instanceof ServiceBuilding) {
                // aca es basicamente decir valor absoluto |x1-x2| + |y1 - y2| 
                const distancia = Math.abs(xCasa - building.x) + Math.abs(yCasa - building.y);
                //esto con el fin de ver si si esta en el rango del edificio del ciudadano o now
                if (distancia <= building.radio) {
                    felicidad += building.beneficioFelicidad;
                }
            }
        }
        // despues de todas las verificaciones, se agrega felicidad a este CIUDADANO EN ESPECIFICO
        felicidad = Math.max(0, Math.min(100, felicidad));
        ciudadano.felicidad = felicidad;
    }

    calcularFelicidadPromedio(city) {

        let felicidadTotal = 0;
        for (let ciudadano of city.citizens) {
            felicidadTotal += ciudadano.felicidad;
        }

        const cantidadCiudadanos = city.citizens.length;
        // evitar division por 0
        if (cantidadCiudadanos === 0) {
            // si retorno cero, el juego nunca podra crear a ciudadanos ya que una condicion es que el promedio sea mayor a 60
            return 100;
        }
        const felicidadPromedio = felicidadTotal / cantidadCiudadanos;
        return felicidadPromedio;
    }

    //funciones que repeti mucho entonces los vuelvo metodos para llamarlos no mas :p
    calcularCapacidadResidencial(city) {
        let capacidad_residencial = 0;

        for (let building of city.buildings) {
            if (building instanceof ResidentialBuilding) {
                capacidad_residencial += building.capacidad;
            }
        }

        return capacidad_residencial;
    }

    calcularEmpleosDisponibles(city) {
        let empleos_disponibles = 0;

        for (let building of city.buildings) {
            if (building instanceof EmploymentBuilding) {
                empleos_disponibles += building.capacidadEmpleo - building.empleados.length;
            }
        }

        return empleos_disponibles;
    }
    
    asignarViviendaYEmpleoPendientes(city) {
        for (let ciudadano of city.citizens) {

            // intentar asignar vivienda si no tiene
            if (!ciudadano.tieneVivienda()) {
                this.asignarVivienda(ciudadano, city);
            }
            // intentar asignar empleo si no tiene
            if (!ciudadano.tieneEmpleo()) {
                this.asignarEmpleo(ciudadano, city);
            }
        }
    }

}



//importante para poder exportar en otras partes 
export default CitizensSystem;
