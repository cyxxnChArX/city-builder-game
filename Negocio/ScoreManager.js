//Importación de clases necesarias
import CitizenSystem from "./citizenSystem.js";

class ScoringSystem {
    // No posee constructor ya que solo tiene métodos estáticos


    //=========================================
    //Métodos para calcular el puntaje de la ciudad
    //=========================================


    // Método para contar ciudadanos desempleados
    static getUnemployedCount(citizens) {
        // Filter crea un nuevo array con los ciudadanos que no tienen empleo y luego se obtiene su longitud
        return citizens.filter(citizen => citizen.job === "null" || citizen.job === null).length;
    }
    
    // Método para verificar si todos los ciudadanos están empleados, solo se necesita saber si es False o True
    static allCitizensEmployed(citizens) {
        // Verifica si la longitud del array de ciudadanos es mayor que 0 y si el conteo de desempleados es 0   
        return citizens.length > 0 && ScoringSystem.getUnemployedCount(citizens) === 0;
    }

    // Método para verificar si todos los recursos son positivos, solo se necesita saber si es False o True
    static allResourcesPositive(resources) {
        // Verifica si todos los recursos son mayores que 0
        return (
            resources.dinero > 0 &&
            resources.electricidad > 0 &&
            resources.agua > 0 &&
            resources.alimentos > 0
        );
    }

    // Método para calcular los bonos basados en las condiciones de la ciudad
    static calculateBonuses(city) {
        let bonuses = 0;

        if (ScoringSystem.allCitizensEmployed(city.citizens)) bonuses += 500;
        if (city.felicidadPromedio > 80) bonuses += 300;
        if (ScoringSystem.allResourcesPositive(city.resources)) bonuses += 200;
        if (city.citizens.length > 1000) bonuses += 1000;

        return bonuses;
    }

    // Método para calcular las penalizaciones basadas en las condiciones de la ciudad
    static calculatePenalties(city) {
        let penalties = 0;

        if (city.resources.dinero < 0) penalties += 500;
        if (city.resources.electricidad < 0) penalties += 300;
        if (city.resources.agua < 0) penalties += 300;
        if (city.felicidadPromedio < 40) penalties += 400;

        penalties += ScoringSystem.getUnemployedCount(city.citizens) * 10;

        return penalties;
    }


    //==========================================
    // Método para actualizar el puntaje de la ciudad
    //==========================================


    static updateCityScore(city) {
        city.felicidadPromedio = CitizenSystem.calcularFelicidadPromedio(city);

        const population = city.citizens.length;
        const numberOfBuildings = city.buildings.length;
        const bonuses = ScoringSystem.calculateBonuses(city);
        const penalties = ScoringSystem.calculatePenalties(city);

        city.score =
            (population * 10) +
            (city.felicidadPromedio * 5) +
            Math.floor(city.resources.dinero / 100) +
            (numberOfBuildings * 50) +
            (city.resources.electricidad * 2) +
            (city.resources.agua * 2) +
            bonuses -
            penalties;

        return city.score;
    }
}

export default ScoringSystem;