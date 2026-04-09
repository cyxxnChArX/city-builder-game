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
        const utilityPlantBuildingsValue = document.getElementById("utilityPlantBuildingsValue");
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
        let utilityPlantCount = 0;

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
                utilityPlantCount++;
            }
        }

        if (totalBuildingsValue) totalBuildingsValue.textContent = city.buildings.length;
        if (residentialBuildingsValue) residentialBuildingsValue.textContent = residentialCount;
        if (commercialBuildingsValue) commercialBuildingsValue.textContent = commercialCount;
        if (industrialBuildingsValue) industrialBuildingsValue.textContent = industrialCount;
        if (serviceBuildingsValue) serviceBuildingsValue.textContent = serviceCount;
        if (utilityPlantBuildingsValue) utilityPlantBuildingsValue.textContent = utilityPlantCount;
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
    static updatePauseButton(isPaused) {
        const btnPauseTurn = document.getElementById("btnPauseTurn");
        if (!btnPauseTurn) return;

        btnPauseTurn.textContent = isPaused ? "Reanudar" : "Pausar";
        btnPauseTurn.classList.remove("btn-secondary", "btn-success");
        btnPauseTurn.classList.add(isPaused ? "btn-success" : "btn-secondary");
    }

    static renderScoreBreakdown(city) {
        if (!city) return;

        const scorePopulation = document.getElementById("scorePopulation");
        const scoreHappiness = document.getElementById("scoreHappiness");
        const scoreMoney = document.getElementById("scoreMoney");
        const scoreBuildings = document.getElementById("scoreBuildings");
        const scoreElectricity = document.getElementById("scoreElectricity");
        const scoreWater = document.getElementById("scoreWater");
        const scoreBonuses = document.getElementById("scoreBonuses");
        const scorePenalties = document.getElementById("scorePenalties");
        const scoreTotal = document.getElementById("scoreTotal");

        const unemployedCount = city.citizens.filter(citizen => citizen.job === null).length;

        const populationPoints = city.citizens.length * 10;
        const happinessPoints = (city.felicidadPromedio ?? 0) * 5;
        const moneyPoints = Math.floor((city.resources?.dinero ?? 0) / 100);
        const buildingPoints = city.buildings.length * 50;
        const electricityPoints = (city.resources?.electricidad ?? 0) * 2;
        const waterPoints = (city.resources?.agua ?? 0) * 2;

        let bonuses = 0;
        if (city.citizens.length > 0 && unemployedCount === 0) bonuses += 500;
        if ((city.felicidadPromedio ?? 0) > 80) bonuses += 300;
        if (
            (city.resources?.dinero ?? 0) > 0 &&
            (city.resources?.electricidad ?? 0) > 0 &&
            (city.resources?.agua ?? 0) > 0 &&
            (city.resources?.alimentos ?? 0) > 0
        ) bonuses += 200;
        if (city.citizens.length > 1000) bonuses += 1000;

        let penalties = 0;
        if ((city.resources?.dinero ?? 0) < 0) penalties += 500;
        if ((city.resources?.electricidad ?? 0) < 0) penalties += 300;
        if ((city.resources?.agua ?? 0) < 0) penalties += 300;
        if ((city.felicidadPromedio ?? 0) < 40) penalties += 400;
        penalties += unemployedCount * 10;

        const total =
            populationPoints +
            happinessPoints +
            moneyPoints +
            buildingPoints +
            electricityPoints +
            waterPoints +
            bonuses -
            penalties;

        if (scorePopulation) scorePopulation.textContent = populationPoints;
        if (scoreHappiness) scoreHappiness.textContent = Math.round(happinessPoints);
        if (scoreMoney) scoreMoney.textContent = moneyPoints;
        if (scoreBuildings) scoreBuildings.textContent = buildingPoints;
        if (scoreElectricity) scoreElectricity.textContent = electricityPoints;
        if (scoreWater) scoreWater.textContent = waterPoints;
        if (scoreBonuses) scoreBonuses.textContent = bonuses;
        if (scorePenalties) scorePenalties.textContent = penalties;
        if (scoreTotal) scoreTotal.textContent = Math.round(total);
    }

    static formatBuildingType(building) {
        if (!building) return "---";

        if (building instanceof Road) return "Vía";
        if (building instanceof ResidentialBuilding) return "Residencial";
        if (building instanceof CommercialBuilding) return "Comercial";
        if (building instanceof IndustrialBuilding) return "Industrial";
        if (building instanceof ServiceBuilding) return "Servicio";
        if (building instanceof UtilityPlant) return "Utilidad";
        if (building instanceof Park) return "Parque";

        return building.constructor.name;
    }

    static formatBuildingName(building) {
        if (!building) return "---";

        if (building instanceof Road) return "Vía";
        if (building instanceof Park) return "Parque";

        const tipo = building.tipo || building.constructor.name;

        return tipo
            .replaceAll("_", " ")
            .replace(/\b\w/g, char => char.toUpperCase());
    }

    static renderBuildingInfo(building) {
        if (!building) return;

        const typeEl = document.getElementById("buildingInfoType");
        const nameEl = document.getElementById("buildingInfoName");
        const costEl = document.getElementById("buildingInfoCost");
        const maintenanceEl = document.getElementById("buildingInfoMaintenance");
        const consumptionEl = document.getElementById("buildingInfoConsumption");
        const productionEl = document.getElementById("buildingInfoProduction");
        const capacityEl = document.getElementById("buildingInfoCapacity");
        const occupancyEl = document.getElementById("buildingInfoOccupancy");
        const residentsEl = document.getElementById("buildingInfoResidents");
        const employeesEl = document.getElementById("buildingInfoEmployees");
        const happinessEl = document.getElementById("buildingInfoAverageHappiness");

        let consumption = [];
        let production = [];
        let capacity = "No aplica";
        let occupancy = "No aplica";
        let residents = "No aplica";
        let employees = "No aplica";
        let avgHappiness = "No aplica";

        if (building.consumoElectricidad) {
            consumption.push(`Electricidad: ${building.consumoElectricidad}`);
        }

        if (building.consumoAgua) {
            consumption.push(`Agua: ${building.consumoAgua}`);
        }

        if (building instanceof CommercialBuilding) {
            production.push(`Dinero: ${building.ingresoPorTurno}/turno`);
            capacity = `${building.capacidadEmpleo} empleos`;
            occupancy = `${building.empleados.length}/${building.capacidadEmpleo}`;
            employees = building.empleados.length;
        }

        if (building instanceof IndustrialBuilding) {
            if (building.tipo === IndustrialBuilding.TIPOS.FABRICA) {
                production.push(`Dinero: ${building.produccionPorTurno}/turno`);
            } else if (building.tipo === IndustrialBuilding.TIPOS.GRANJA) {
                production.push(`Alimentos: ${building.produccionPorTurno}/turno`);
            }

            capacity = `${building.capacidadEmpleo} empleos`;
            occupancy = `${building.empleados.length}/${building.capacidadEmpleo}`;
            employees = building.empleados.length;
        }

        if (building instanceof UtilityPlant) {
            if (building.produccionElectricidad) {
                production.push(`Electricidad: ${building.produccionElectricidad}/turno`);
            }

            if (building.produccionAgua) {
                production.push(`Agua: ${building.produccionAgua}/turno`);
            }
        }

        if (building instanceof ServiceBuilding) {
            production.push(`Felicidad: +${building.beneficioFelicidad}`);
            capacity = `Radio: ${building.radio} celdas`;
        }

        if (building instanceof Park) {
            production.push(`Felicidad: +${building.beneficioFelicidad}`);
        }

        if (building instanceof ResidentialBuilding) {
            capacity = `${building.capacidad} ciudadanos`;
            occupancy = `${building.residentes.length}/${building.capacidad}`;
            residents = building.residentes.length;
            avgHappiness = Math.round(building.calcularFelicidadPromedio());
        }

        if (building instanceof Road) {
            consumption = ["No consume recursos"];
            production = ["Permite tránsito"];
        }

        if (typeEl) typeEl.textContent = this.formatBuildingType(building);
        if (nameEl) nameEl.textContent = this.formatBuildingName(building);
        if (costEl) costEl.textContent = `$${building.costo ?? 0}`;
        if (maintenanceEl) maintenanceEl.textContent = `$${Math.round(building.costoMantenimiento ?? 0)}`;
        if (consumptionEl) consumptionEl.textContent = consumption.length ? consumption.join(" | ") : "No consume recursos";
        if (productionEl) productionEl.textContent = production.length ? production.join(" | ") : "No produce recursos";
        if (capacityEl) capacityEl.textContent = capacity;
        if (occupancyEl) occupancyEl.textContent = occupancy;
        if (residentsEl) residentsEl.textContent = residents;
        if (employeesEl) employeesEl.textContent = employees;
        if (happinessEl) happinessEl.textContent = avgHappiness;
    }

    static updateRouteInfo(originText = "sin seleccionar", destinationText = "sin seleccionar", statusText = "inactivo") {
        const routeOriginText = document.getElementById("routeOriginText");
        const routeDestinationText = document.getElementById("routeDestinationText");
        const routeStatusText = document.getElementById("routeStatusText");

        if (routeOriginText) routeOriginText.textContent = `Origen: ${originText}`;
        if (routeDestinationText) routeDestinationText.textContent = `Destino: ${destinationText}`;
        if (routeStatusText) routeStatusText.textContent = `Estado: ${statusText}`;
    }

    static renderWeather(weather) {
        if (!weather) return;
        
        const tempEl = document.getElementById("weatherTemp");
        const windEl = document.getElementById("weatherWind");
        const humidityEl = document.getElementById("weatherHumidity");
        const descEl = document.getElementById("weatherCondition");

        if (tempEl) tempEl.textContent = `${weather.temperatura}°C`;
        if (windEl) windEl.textContent = `${weather.viento} km/h`;
        if (humidityEl) humidityEl.textContent = `${weather.humedad}%`;
        if (descEl) descEl.textContent = weather.descripcion;
    }
    
    static renderNews(noticias) {
        const newsList = document.getElementById("newsList");
        if (!newsList) return;

        newsList.innerHTML = "";

        if (!noticias || noticias.length === 0) {
            newsList.innerHTML = "<p>No hay noticias disponibles</p>";
            return;
        }

        noticias.slice(0, 3).forEach(noticia => {
            const article = document.createElement("article");
            article.classList.add("news-item", "card");

            article.innerHTML = `
                <div class="card-body news-content">
                    <h4 class="h6">${noticia.titulo}</h4>
                    <p class="mb-2"><small>Fuente: ${noticia.fuente}</small></p>
                    <a href="${noticia.url}" target="_blank" class="btn btn-sm btn-outline-primary">
                        Ver noticia
                    </a>
                </div>
            `;

            newsList.appendChild(article);
        });
    }
}

export default UIController;