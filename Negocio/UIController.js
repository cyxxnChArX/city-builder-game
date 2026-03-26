import Road from "../Modelos/Road.js";
import ResidentialBuilding from "../Modelos/ResidentialBuilding.js";
import CommercialBuilding from "../Modelos/CommercialBuilding.js";
import IndustrialBuilding from "../Modelos/IndustrialBuilding.js";
import ServiceBuilding from "../Modelos/ServiceBuilding.js";
import UtilityPlant from "../Modelos/UtilityPlant.js";
import Park from "../Modelos/Park.js";

class UIController {

    static update(city) {

        if (!city) return;

        this.updateHeader(city);
        this.updateResources(city);
        this.updateCitizensSummary(city);
        this.updateBuildingsSummary(city);

    }

    static updateHeader(city) {

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
    }

    static updateResources(city) {

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

    static updateCitizensSummary(city) {
        const citizensTotal = document.getElementById("citizensTotal");
        const citizensWithHousing = document.getElementById("citizensWithHousing");
        const citizensWithoutHousing = document.getElementById("citizensWithoutHousing");
        const citizensWithJob = document.getElementById("citizensWithJob");
        const citizensWithoutJob = document.getElementById("citizensWithoutJob");
        const citizensAverageHappiness = document.getElementById("citizensAverageHappiness");

        const total = city.citizens.length;
        const withHousing = city.citizens.filter(c => c.home !== null).length;
        const withoutHousing = total - withHousing;
        const withJob = city.citizens.filter(c => c.job !== null).length;
        const withoutJob = total - withJob;

        if (citizensTotal) citizensTotal.textContent = total;
        if (citizensWithHousing) citizensWithHousing.textContent = withHousing;
        if (citizensWithoutHousing) citizensWithoutHousing.textContent = withoutHousing;
        if (citizensWithJob) citizensWithJob.textContent = withJob;
        if (citizensWithoutJob) citizensWithoutJob.textContent = withoutJob;
        if (citizensAverageHappiness) {
            citizensAverageHappiness.textContent = Math.round(city.felicidadPromedio ?? 0);
        }
    }

    static updateBuildingsSummary(city) {
        const totalBuildingsValue = document.getElementById("totalBuildingsValue");
        const residentialBuildingsValue = document.getElementById("residentialBuildingsValue");
        const commercialBuildingsValue = document.getElementById("commercialBuildingsValue");
        const industrialBuildingsValue = document.getElementById("industrialBuildingsValue");
        const serviceBuildingsValue = document.getElementById("serviceBuildingsValue");
        const parksValue = document.getElementById("parksValue");
        const roadsValue = document.getElementById("roadsValue");
        const housingCapacityValue = document.getElementById("housingCapacityValue");
        const jobCapacityValue = document.getElementById("jobCapacityValue");

        let residentialCount = 0;
        let commercialCount = 0;
        let industrialCount = 0;
        let serviceCount = 0;
        let parksCount = 0;
        let roadsCount = 0;
        let housingCapacity = 0;
        let jobCapacity = 0;

        for (const building of city.buildings) {
            if (building instanceof ResidentialBuilding) {
                residentialCount++;
                housingCapacity += building.capacidad;
            } else if (building instanceof CommercialBuilding) {
                commercialCount++;
                jobCapacity += building.capacidadEmpleo;
            } else if (building instanceof IndustrialBuilding) {
                industrialCount++;
                jobCapacity += building.capacidadEmpleo;
            } else if (building instanceof ServiceBuilding) {
                serviceCount++;
            } else if (building instanceof Park) {
                parksCount++;
            } else if (building instanceof Road) {
                roadsCount++;
            } else if (building instanceof UtilityPlant) {
                // no suma a housing ni empleo, pero sí cuenta como edificio total
            }
        }

        if (totalBuildingsValue) totalBuildingsValue.textContent = city.buildings.length;
        if (residentialBuildingsValue) residentialBuildingsValue.textContent = residentialCount;
        if (commercialBuildingsValue) commercialBuildingsValue.textContent = commercialCount;
        if (industrialBuildingsValue) industrialBuildingsValue.textContent = industrialCount;
        if (serviceBuildingsValue) serviceBuildingsValue.textContent = serviceCount;
        if (parksValue) parksValue.textContent = parksCount;
        if (roadsValue) roadsValue.textContent = roadsCount;
        if (housingCapacityValue) housingCapacityValue.textContent = housingCapacity;
        if (jobCapacityValue) jobCapacityValue.textContent = jobCapacity;
    }

    static updateCurrentMode(modeText = "Ninguno") {
        const currentModeDisplay = document.getElementById("currentModeDisplay");
        if (currentModeDisplay) currentModeDisplay.textContent = modeText;
    }

    static renderCitizensTable(city) {
        const tbody = document.getElementById("citizensTableBody");
        if (!tbody) return;

        tbody.innerHTML = "";

        for (const citizen of city.citizens) {
            const tr = document.createElement("tr");

            const homeText = citizen.home ? `${citizen.home.tipo || "Residencia"} (${citizen.home.x},${citizen.home.y})` : "Sin vivienda";
            const jobText = citizen.job ? `${citizen.job.tipo || "Trabajo"} (${citizen.job.x},${citizen.job.y})` : "Sin empleo";

            tr.innerHTML = `
                <td>${citizen.id}</td>
                <td>${homeText}</td>
                <td>${jobText}</td>
                <td>${Math.round(citizen.felicidad)}</td>
            `;

            tbody.appendChild(tr);
        }
    }

    static renderRanking(rankingData, currentCityId = null) {
        const tbody = document.getElementById("rankingTableBody");
        const currentCityRankingText = document.getElementById("currentCityRankingText");

        if (!tbody) return;

        tbody.innerHTML = "";

        if (!rankingData || rankingData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8">No hay ciudades en el ranking.</td>
                </tr>
            `;
            if (currentCityRankingText) currentCityRankingText.textContent = "Tu ciudad: #--";
            return;
        }

        rankingData.forEach((item, index) => {
            const tr = document.createElement("tr");

            if (item.id === currentCityId) {
                tr.classList.add("table-primary");
            }

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.cityName}</td>
                <td>${item.alcalde}</td>
                <td>${Math.round(item.score)}</td>
                <td>${item.population}</td>
                <td>${Math.round(item.happiness)}</td>
                <td>${item.turns}</td>
                <td>${new Date(item.date).toLocaleString()}</td>
            `;

            tbody.appendChild(tr);
        });

        if (currentCityRankingText) {
            const currentIndex = rankingData.findIndex(item => item.id === currentCityId);
            currentCityRankingText.textContent =
                currentIndex >= 0 ? `Tu ciudad: #${currentIndex + 1}` : "Tu ciudad: fuera del top mostrado";
        }
    }
}

export default UIController;