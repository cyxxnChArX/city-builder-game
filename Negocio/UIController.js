class UIController {

    static update(city) {

        //  INFO GENERAL (arriba usan Display)
        const cityName = document.getElementById("cityNameDisplay");
        const mayorName = document.getElementById("mayorNameDisplay");
        const region = document.getElementById("regionDisplay");
        const mapSize = document.getElementById("mapSizeDisplay");
        const turn = document.getElementById("turnDisplay");

        if (cityName) cityName.textContent = city.nombre;
        if (mayorName) mayorName.textContent = city.alcalde;
        if (region) region.textContent = city.region;
        if (mapSize) mapSize.textContent = `${city.map.ancho} x ${city.map.alto}`;
        if (turn) turn.textContent = city.turno;

        //  BARRA DE RECURSOS (abajo - usan Value)
        const money = document.getElementById("moneyValue");
        const electricity = document.getElementById("electricityValue");
        const water = document.getElementById("waterValue");
        const food = document.getElementById("foodValue");
        const population = document.getElementById("populationValue");
        const happiness = document.getElementById("happinessValue");
        const score = document.getElementById("scoreValue");

        if (money) money.textContent = `$${city.resources.dinero}`;
        if (electricity) electricity.textContent = city.resources.electricidad;
        if (water) water.textContent = city.resources.agua;
        if (food) food.textContent = city.resources.alimentos;

        if (population) population.textContent = city.citizens.length;
        if (happiness) happiness.textContent = city.felicidadPromedio || 0;
        if (score) score.textContent = city.puntaje || 0;
    }

}

export default UIController;