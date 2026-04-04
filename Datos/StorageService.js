import City from "../Modelos/City.js";
import Map from "../Modelos/Map.js";
import Resources from "../Modelos/Resources.js";
import Citizen from "../Modelos/Citizen.js";

import Road from "../Modelos/Road.js";
import Park from "../Modelos/Park.js";
import ResidentialBuilding from "../Modelos/ResidentialBuilding.js";
import CommercialBuilding from "../Modelos/CommercialBuilding.js";
import IndustrialBuilding from "../Modelos/IndustrialBuilding.js";
import ServiceBuilding from "../Modelos/ServiceBuilding.js";
import UtilityPlant from "../Modelos/UtilityPlant.js";

class StorageService {
    static SAVES_KEY = "cityGame_saves";
    static ACTIVE_SAVE_ID_KEY = "cityGame_activeSaveId";

    // =========================================
    // MÉTODOS PÚBLICOS - GESTIÓN GENERAL
    // =========================================

    static saveGame(city) {
        if (!city) {
            throw new Error("No se puede guardar una ciudad nula o indefinida.");
        }

        if (!this.isMayorNameUnique(city.alcalde, city.id)) {
            throw new Error("El nombre del alcalde ya está en uso en otra ciudad.");
        }

        if (!city.id) {
            city.id = this.generateCityId();
        }

        const serializedCity = this.serializeCity(city);
        const saves = this.getAllRawSaves();

        const index = saves.findIndex(save => save.id === serializedCity.id);

        if (index >= 0) {
            saves[index] = serializedCity;
        } else {
            saves.push(serializedCity);
        }

        this.setAllRawSaves(saves);
        this.setActiveSaveId(serializedCity.id);

        return serializedCity.id;
    }

    static loadGameById(cityId) {
        if (!cityId) {
            return null;
        }

        const saves = this.getAllRawSaves();
        const rawCity = saves.find(save => save.id === cityId);

        if (!rawCity) {
            return null;
        }

        this.setActiveSaveId(cityId);
        return this.deserializeCity(rawCity);
    }

    static loadActiveGame() {
        const activeId = this.getActiveSaveId();

        if (!activeId) {
            return null;
        }

        return this.loadGameById(activeId);
    }

    static loadLatestGame() {
        const saves = this.getAllRawSaves();

        if (saves.length === 0) {
            return null;
        }

        const sorted = [...saves].sort((a, b) => {
            const dateA = new Date(a.lastSavedAt || a.createdAt || 0).getTime();
            const dateB = new Date(b.lastSavedAt || b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        const latest = sorted[0];
        this.setActiveSaveId(latest.id);
        return this.deserializeCity(latest);
    }

    static hasSavedGames() {
        return this.getAllRawSaves().length > 0;
    }

    static getSavedGamesMetadata() {
        return this.getAllRawSaves()
            .map(save => ({
                id: save.id,
                nombre: save.nombre,
                region: save.region,
                turno: save.turno,
                puntaje: save.puntaje,
                felicidadPromedio: save.felicidadPromedio,
                poblacion: Array.isArray(save.citizens) ? save.citizens.length : 0,
                createdAt: save.createdAt || null,
                lastSavedAt: save.lastSavedAt || null
            }))
            .sort((a, b) => {
                const dateA = new Date(a.lastSavedAt || a.createdAt || 0).getTime();
                const dateB = new Date(b.lastSavedAt || b.createdAt || 0).getTime();
                return dateB - dateA;
            });
    }

    static deleteGameById(cityId) {
        if (!cityId) {
            return false;
        }

        const saves = this.getAllRawSaves();
        const filteredSaves = saves.filter(save => save.id !== cityId);

        if (filteredSaves.length === saves.length) {
            return false;
        }

        this.setAllRawSaves(filteredSaves);

        const activeId = this.getActiveSaveId();
        if (activeId === cityId) {
            if (filteredSaves.length > 0) {
                const latest = [...filteredSaves].sort((a, b) => {
                    const dateA = new Date(a.lastSavedAt || a.createdAt || 0).getTime();
                    const dateB = new Date(b.lastSavedAt || b.createdAt || 0).getTime();
                    return dateB - dateA;
                })[0];

                this.setActiveSaveId(latest.id);
            } else {
                localStorage.removeItem(this.ACTIVE_SAVE_ID_KEY);
            }
        }

        return true;
    }

    static clearAllGames() {
        localStorage.removeItem(this.SAVES_KEY);
        localStorage.removeItem(this.ACTIVE_SAVE_ID_KEY);
    }

    static setActiveSaveId(cityId) {
        if (!cityId) {
            localStorage.removeItem(this.ACTIVE_SAVE_ID_KEY);
            return;
        }

        localStorage.setItem(this.ACTIVE_SAVE_ID_KEY, cityId);
    }

    static getActiveSaveId() {
        return localStorage.getItem(this.ACTIVE_SAVE_ID_KEY);
    }

    // =========================================
    // MÉTODOS PRIVADOS - LOCALSTORAGE BASE
    // =========================================

    static getAllRawSaves() {
        const rawData = localStorage.getItem(this.SAVES_KEY);

        if (!rawData) {
            return [];
        }

        try {
            const parsed = JSON.parse(rawData);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Error al leer partidas guardadas:", error);
            return [];
        }
    }

    static setAllRawSaves(saves) {
        localStorage.setItem(this.SAVES_KEY, JSON.stringify(saves));
    }

    static generateCityId() {
        const randomPart = Math.random().toString(36).slice(2, 8);
        return `city_${Date.now()}_${randomPart}`;
    }

    static isMayorNameUnique(alcalde, currentCityId = null) {
        if (!alcalde) return true;

        const saves = this.getAllRawSaves();

        return !saves.some(save =>
            save.alcalde &&
            save.alcalde.toLowerCase().trim() === alcalde.toLowerCase().trim() &&
            save.id !== currentCityId
        );
    }

    // =========================================
    // SERIALIZACIÓN
    // =========================================

    static serializeCity(city) {
        const now = new Date().toISOString();

        return {
            id: city.id,
            nombre: city.nombre,
            region: city.region,
            turno: city.turno,
            puntaje: city.puntaje,
            felicidadPromedio: city.felicidadPromedio,

            createdAt: city.createdAt || now,
            lastSavedAt: now,

            map: {
                ancho: city.map.ancho,
                alto: city.map.alto,
                mapa: this.serializeMapMatrix(city.map)
            },

            resources: {
                dinero: city.resources.dinero,
                electricidad: city.resources.electricidad,
                agua: city.resources.agua,
                alimentos: city.resources.alimentos
            },

            citizens: city.citizens.map(citizen => ({
                id: citizen.id,
                felicidad: citizen.felicidad,
                consumoAgua: citizen.consumoAgua,
                consumoElectricidad: citizen.consumoElectricidad,
                consumoComida: citizen.consumoComida,
                homeId: citizen.home ? citizen.home.id : null,
                jobId: citizen.job ? citizen.job.id : null
            })),

            buildings: city.buildings.map(building => this.serializeBuilding(building)),

            alcalde: city.alcalde,
            config: city.config || null
        };
    }

    static serializeMapMatrix(mapInstance) {
        const result = [];

        for (let y = 0; y < mapInstance.alto; y++) {
            const row = [];

            for (let x = 0; x < mapInstance.ancho; x++) {
                const cell = mapInstance.mapa[y][x];
                row.push(cell ? cell.id : null);
            }

            result.push(row);
        }

        return result;
    }

    static serializeBuilding(building) {
        const base = {
            className: building.constructor.name,
            id: building.id,
            x: building.x,
            y: building.y,
            costo: building.costo,
            costoMantenimiento: building.costoMantenimiento
        };

        if (building instanceof ResidentialBuilding) {
            return {
                ...base,
                tipo: building.tipo,
                capacidad: building.capacidad,
                consumoElectricidad: building.consumoElectricidad,
                consumoAgua: building.consumoAgua,
                residentesIds: building.residentes.map(c => c.id)
            };
        }

        if (building instanceof CommercialBuilding) {
            return {
                ...base,
                tipo: building.tipo,
                capacidadEmpleo: building.capacidadEmpleo,
                ingresoPorTurno: building.ingresoPorTurno,
                consumoElectricidad: building.consumoElectricidad,
                empleadosIds: building.empleados.map(c => c.id)
            };
        }

        if (building instanceof IndustrialBuilding) {
            return {
                ...base,
                tipo: building.tipo,
                capacidadEmpleo: building.capacidadEmpleo,
                produccionPorTurno: building.produccionPorTurno,
                consumoElectricidad: building.consumoElectricidad,
                consumoAgua: building.consumoAgua,
                empleadosIds: building.empleados.map(c => c.id)
            };
        }

        if (building instanceof ServiceBuilding) {
            return {
                ...base,
                tipo: building.tipo,
                radio: building.radio,
                beneficioFelicidad: building.beneficioFelicidad,
                consumoElectricidad: building.consumoElectricidad,
                consumoAgua: building.consumoAgua
            };
        }

        if (building instanceof UtilityPlant) {
            return {
                ...base,
                tipo: building.tipo,
                produccionElectricidad: building.produccionElectricidad,
                produccionAgua: building.produccionAgua,
                consumoElectricidad: building.consumoElectricidad
            };
        }

        if (building instanceof Park) {
            return {
                ...base,
                beneficioFelicidad: building.beneficioFelicidad
            };
        }

        if (building instanceof Road) {
            return {
                ...base
            };
        }

        throw new Error(`Tipo de edificio no soportado para serialización: ${building.constructor.name}`);
    }

    // =========================================
    // DESERIALIZACIÓN
    // =========================================

    static deserializeCity(data) {
        if (!data || !data.map || !data.resources) {
            throw new Error("Los datos guardados no tienen la estructura mínima esperada.");
        }

        const mapInstance = new Map(data.map.ancho, data.map.alto);
        const resourcesInstance = new Resources(
            data.resources.dinero,
            data.resources.electricidad,
            data.resources.agua,
            data.resources.alimentos
        );

        const cityInstance = new City(
            data.id,
            data.nombre,
            mapInstance,
            resourcesInstance,
            data.alcalde
        );

        cityInstance.config = data.config || null;
        cityInstance.alcalde = data.alcalde || "";
        cityInstance.region = data.region || "";
        cityInstance.turno = data.turno ?? 1;
        cityInstance.puntaje = data.puntaje ?? 0;
        cityInstance.felicidadPromedio = data.felicidadPromedio ?? 100;
        cityInstance.createdAt = data.createdAt || null;
        cityInstance.lastSavedAt = data.lastSavedAt || null;

        const buildingMapById = new globalThis.Map();
        for (const buildingData of data.buildings) {
            const buildingInstance = this.deserializeBuilding(buildingData);
            cityInstance.agregarBuilding(buildingInstance);
            buildingMapById.set(buildingInstance.id, buildingInstance);
        }

        const citizenMapById = new globalThis.Map();
        for (const citizenData of data.citizens) {
            const citizenInstance = new Citizen(
                citizenData.id,
                citizenData.consumoAgua,
                citizenData.consumoElectricidad,
                citizenData.consumoComida
            );

            citizenInstance.felicidad = citizenData.felicidad;
            cityInstance.agregarCitizen(citizenInstance);
            citizenMapById.set(citizenInstance.id, citizenInstance);
        }

        for (const citizenData of data.citizens) {
            const citizenInstance = citizenMapById.get(citizenData.id);

            if (citizenData.homeId) {
                citizenInstance.home = buildingMapById.get(citizenData.homeId) || null;
            }

            if (citizenData.jobId) {
                citizenInstance.job = buildingMapById.get(citizenData.jobId) || null;
            }
        }

        for (const buildingData of data.buildings) {
            const buildingInstance = buildingMapById.get(buildingData.id);

            if (buildingInstance instanceof ResidentialBuilding) {
                buildingInstance.residentes = [];
                const residentIds = buildingData.residentesIds || [];

                for (const citizenId of residentIds) {
                    const citizen = citizenMapById.get(citizenId);
                    if (citizen) {
                        buildingInstance.residentes.push(citizen);
                    }
                }
            }

            if (
                buildingInstance instanceof CommercialBuilding ||
                buildingInstance instanceof IndustrialBuilding
            ) {
                buildingInstance.empleados = [];
                const employeeIds = buildingData.empleadosIds || [];

                for (const citizenId of employeeIds) {
                    const citizen = citizenMapById.get(citizenId);
                    if (citizen) {
                        buildingInstance.empleados.push(citizen);
                    }
                }
            }
        }

        for (let y = 0; y < data.map.alto; y++) {
            for (let x = 0; x < data.map.ancho; x++) {
                const buildingId = data.map.mapa[y][x];

                cityInstance.map.mapa[y][x] =
                    buildingId === null ? null : (buildingMapById.get(buildingId) || null);
            }
        }

        return cityInstance;
    }

    static deserializeBuilding(buildingData) {
        let instance;

        switch (buildingData.className) {
            case "Road":
                instance = new Road(
                    buildingData.id,
                    buildingData.x,
                    buildingData.y
                );
                break;

            case "Park":
                instance = new Park(
                    buildingData.id,
                    buildingData.x,
                    buildingData.y
                );
                break;

            case "ResidentialBuilding":
                instance = new ResidentialBuilding(
                    buildingData.id,
                    buildingData.tipo,
                    buildingData.x,
                    buildingData.y
                );
                break;

            case "CommercialBuilding":
                instance = new CommercialBuilding(
                    buildingData.id,
                    buildingData.tipo,
                    buildingData.x,
                    buildingData.y
                );
                break;

            case "IndustrialBuilding":
                instance = new IndustrialBuilding(
                    buildingData.id,
                    buildingData.tipo,
                    buildingData.x,
                    buildingData.y
                );
                break;

            case "ServiceBuilding":
                instance = new ServiceBuilding(
                    buildingData.id,
                    buildingData.tipo,
                    buildingData.x,
                    buildingData.y
                );
                break;

            case "UtilityPlant":
                instance = new UtilityPlant(
                    buildingData.id,
                    buildingData.tipo,
                    buildingData.x,
                    buildingData.y
                );
                break;

            default:
                throw new Error(`Tipo de edificio no soportado al deserializar: ${buildingData.className}`);
        }

        if (typeof buildingData.costoMantenimiento === "number") {
            instance.costoMantenimiento = buildingData.costoMantenimiento;
        }

        return instance;
    }

    static exportCityToJSON(city) {
        if (!city) {
            throw new Error("No hay ciudad cargada para exportar.");
        }

        const serializedCity = this.serializeCity(city);
        return JSON.stringify(serializedCity, null, 2);
    }

    static downloadCityJSON(city) {
        const jsonContent = this.exportCityToJSON(city);

        const safeName = (city.nombre || "ciudad")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");

        const fileName = `ciudad_${safeName || "sin_nombre"}_${new Date().toISOString().slice(0, 10)}.json`;

        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
    }
}

export default StorageService;