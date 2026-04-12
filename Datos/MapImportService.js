import City from "../Modelos/City.js";
import Map from "../Modelos/Map.js";
import Resources from "../Modelos/Resources.js";

import Road from "../Modelos/Road.js";
import Park from "../Modelos/Park.js";
import ResidentialBuilding from "../Modelos/ResidentialBuilding.js";
import CommercialBuilding from "../Modelos/CommercialBuilding.js";
import IndustrialBuilding from "../Modelos/IndustrialBuilding.js";
import ServiceBuilding from "../Modelos/ServiceBuilding.js";
import UtilityPlant from "../Modelos/UtilityPlant.js";

class MapImportService {
    static VALID_MIN_SIZE = 15;
    static VALID_MAX_SIZE = 30;

    static TOKEN_BUILDERS = {
        g: null,
        r: "ROAD",

        R1: { className: "ResidentialBuilding", tipo: ResidentialBuilding.TIPOS.CASA },
        R2: { className: "ResidentialBuilding", tipo: ResidentialBuilding.TIPOS.APARTAMENTO },

        C1: { className: "CommercialBuilding", tipo: CommercialBuilding.TIPOS.TIENDA },
        C2: { className: "CommercialBuilding", tipo: CommercialBuilding.TIPOS.CENTRO_COMERCIAL },

        I1: { className: "IndustrialBuilding", tipo: IndustrialBuilding.TIPOS.FABRICA },
        I2: { className: "IndustrialBuilding", tipo: IndustrialBuilding.TIPOS.GRANJA },

        S1: { className: "ServiceBuilding", tipo: ServiceBuilding.TIPOS.POLICIA },
        S2: { className: "ServiceBuilding", tipo: ServiceBuilding.TIPOS.BOMBEROS },
        S3: { className: "ServiceBuilding", tipo: ServiceBuilding.TIPOS.HOSPITAL },

        U1: { className: "UtilityPlant", tipo: UtilityPlant.TIPOS.PLANTA_ELECTRICA },
        U2: { className: "UtilityPlant", tipo: UtilityPlant.TIPOS.PLANTA_AGUA },

        P1: { className: "Park" }
    };

    // =========================================
    // MÉTODO PRINCIPAL DESDE TEXTO
    // =========================================
    static importCityFromText({
        fileContent,
        cityId,
        cityName,
        region = "",
        initialMoney = 50000,
        initialElectricity = 0,
        initialWater = 0,
        initialFood = 0
    }) {
        if (!fileContent || typeof fileContent !== "string") {
            throw new Error("El contenido del archivo .txt está vacío o no es válido.");
        }

        const matrix = this.parseTextToMatrix(fileContent);
        this.validateMatrix(matrix);

        const height = matrix.length;
        const width = matrix[0].length;

        const mapInstance = new Map(width, height);
        const resourcesInstance = new Resources(
            initialMoney,
            initialElectricity,
            initialWater,
            initialFood
        );

        const cityInstance = new City(
            cityId,
            cityName,
            mapInstance,
            resourcesInstance
        );

        cityInstance.region = region;
        cityInstance.turno = 1;
        cityInstance.puntaje = 0;
        cityInstance.felicidadPromedio = 100;
        cityInstance.createdAt = new Date().toISOString();
        cityInstance.lastSavedAt = cityInstance.createdAt;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const token = matrix[y][x];
                const element = this.createElementFromToken(token, x, y);

                if (!element) {
                    continue;
                }

                cityInstance.map.colocar(element, x, y);

                cityInstance.agregarBuilding(element);
            }
        }

        this.calculateInitialResources(cityInstance);
        this.recalculateCityDerivedState(cityInstance);

        return cityInstance;
    }

    // =========================================
    // LECTURA DE ARCHIVO FILE
    // =========================================
    static readTextFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error("No se proporcionó ningún archivo."));
                return;
            }

            const reader = new FileReader();

            reader.onload = event => {
                resolve(event.target.result);
            };

            reader.onerror = () => {
                reject(new Error("No fue posible leer el archivo .txt."));
            };

            reader.readAsText(file, "UTF-8");
        });
    }

    // =========================================
    // PARSEO DEL TEXTO
    // =========================================
    static parseTextToMatrix(fileContent) {
        const lines = fileContent
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (lines.length === 0) {
            throw new Error("El archivo no contiene datos de mapa.");
        }

        return lines.map((line, rowIndex) => {
            const tokens = line
                .split(/[\s,;|]+/)
                .map(token => token.trim())
                .filter(token => token.length > 0);

            if (tokens.length === 0) {
                throw new Error(`La fila ${rowIndex + 1} está vacía.`);
            }

            return tokens;
        });
    }

    static exportMapToText(cityOrMap) {
        const mapInstance = cityOrMap.map ? cityOrMap.map : cityOrMap;
        if (!mapInstance || !mapInstance.mapa) {
            throw new Error("No hay un mapa válido para exportar.");
        }

        const lines = [];

        for (let y = 0; y < mapInstance.alto; y++) {
            const rowTokens = [];

            for (let x = 0; x < mapInstance.ancho; x++) {
                const cell = mapInstance.mapa[y][x];
                rowTokens.push(this.getTokenFromCell(cell));
            }

            lines.push(rowTokens.join(" "));
        }

        return lines.join("\n");
    }

    static downloadMapTXT(cityOrMap, filename = "mapa.txt") {
        const text = this.exportMapToText(cityOrMap);
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    static getTokenFromCell(cell) {
        if (!cell) {
            return "g";
        }

        const className = cell.constructor.name;
        switch (className) {
            case "Road":
                return "r";
            case "Park":
                return "P1";
            case "ResidentialBuilding":
                return cell.tipo === ResidentialBuilding.TIPOS.CASA ? "R1" : "R2";
            case "CommercialBuilding":
                return cell.tipo === CommercialBuilding.TIPOS.TIENDA ? "C1" : "C2";
            case "IndustrialBuilding":
                return cell.tipo === IndustrialBuilding.TIPOS.FABRICA ? "I1" : "I2";
            case "ServiceBuilding":
                if (cell.tipo === ServiceBuilding.TIPOS.POLICIA) return "S1";
                if (cell.tipo === ServiceBuilding.TIPOS.BOMBEROS) return "S2";
                if (cell.tipo === ServiceBuilding.TIPOS.HOSPITAL) return "S3";
                break;
            case "UtilityPlant":
                return cell.tipo === UtilityPlant.TIPOS.PLANTA_ELECTRICA ? "U1" : "U2";
        }

        return "g";
    }

    static validateMatrix(matrix) {
        const rowCount = matrix.length;

        if (
            rowCount < this.VALID_MIN_SIZE ||
            rowCount > this.VALID_MAX_SIZE
        ) {
            throw new Error(
                `El mapa debe tener entre ${this.VALID_MIN_SIZE} y ${this.VALID_MAX_SIZE} filas.`
            );
        }

        const columnCount = matrix[0].length;

        if (
            columnCount < this.VALID_MIN_SIZE ||
            columnCount > this.VALID_MAX_SIZE
        ) {
            throw new Error(
                `El mapa debe tener entre ${this.VALID_MIN_SIZE} y ${this.VALID_MAX_SIZE} columnas.`
            );
        }

        for (let y = 0; y < matrix.length; y++) {
            if (matrix[y].length !== columnCount) {
                throw new Error(
                    `La fila ${y + 1} no tiene el mismo número de columnas que las demás.`
                );
            }

            for (let x = 0; x < matrix[y].length; x++) {
                const token = matrix[y][x];

                if (!Object.prototype.hasOwnProperty.call(this.TOKEN_BUILDERS, token)) {
                    throw new Error(
                        `Token no válido "${token}" en la posición (${x}, ${y}).`
                    );
                }
            }
        }
    }

    static importCityFromText({
        fileContent,
        cityId,
        cityName,
        region = "",
        initialMoney = 50000,
        initialElectricity = 0,
        initialWater = 0,
        initialFood = 0
    }) {
        if (!fileContent || typeof fileContent !== "string") {
            throw new Error("El contenido del archivo .txt está vacío o no es válido.");
        }

        const matrix = this.parseTextToMatrix(fileContent);
        this.validateMatrix(matrix);

        const height = matrix.length;
        const width = matrix[0].length;

        const mapInstance = new Map(width, height);
        const resourcesInstance = new Resources(
            initialMoney,
            initialElectricity,
            initialWater,
            initialFood
        );

        const cityInstance = new City(
            cityId,
            cityName,
            mapInstance,
            resourcesInstance
        );

        cityInstance.region = region;
        cityInstance.turno = 1;
        cityInstance.puntaje = 0;
        cityInstance.felicidadPromedio = 100;
        cityInstance.createdAt = new Date().toISOString();
        cityInstance.lastSavedAt = cityInstance.createdAt;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const token = matrix[y][x];
                const element = this.createElementFromToken(token, x, y);

                if (!element) {
                    continue;
                }

                cityInstance.map.colocar(element, x, y);
                cityInstance.agregarBuilding(element);
            }
        }

        this.calculateInitialResources(cityInstance);
        this.recalculateCityDerivedState(cityInstance);

        return cityInstance;
    }

    // =========================================
    // CREACIÓN DE ELEMENTOS
    // =========================================
    static createElementFromToken(token, x, y) {
        const definition = this.TOKEN_BUILDERS[token];

        if (definition === null) {
            return null;
        }

        if (definition === "ROAD") {
            return new Road(this.generateElementId("road", x, y), x, y);
        }

        switch (definition.className) {
            case "Park":
                return new Park(this.generateElementId("park", x, y), x, y);

            case "ResidentialBuilding":
                return new ResidentialBuilding(
                    this.generateElementId("res", x, y),
                    definition.tipo,
                    x,
                    y
                );

            case "CommercialBuilding":
                return new CommercialBuilding(
                    this.generateElementId("com", x, y),
                    definition.tipo,
                    x,
                    y
                );

            case "IndustrialBuilding":
                return new IndustrialBuilding(
                    this.generateElementId("ind", x, y),
                    definition.tipo,
                    x,
                    y
                );

            case "ServiceBuilding":
                return new ServiceBuilding(
                    this.generateElementId("srv", x, y),
                    definition.tipo,
                    x,
                    y
                );

            case "UtilityPlant":
                return new UtilityPlant(
                    this.generateElementId("utl", x, y),
                    definition.tipo,
                    x,
                    y
                );

            default:
                throw new Error(`No existe constructor válido para el token "${token}".`);
        }
    }

    static generateElementId(prefix, x, y) {
        return `${prefix}_${x}_${y}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    }

    // =========================================
    // CÁLCULO DE RECURSOS INICIALES
    // =========================================

    static calculateInitialResources(city) {
        let money = 50000;
        let electricity = 0;
        let water = 0;
        let food = 0;

        city.buildings.forEach(b => {
            // COSTOS (inversión inicial)
            if (b.costo) {
                money -= b.costo;
            }

            // PRODUCCIÓN
            if (b.tipo === UtilityPlant.TIPOS.PLANTA_ELECTRICA) {
                electricity += 200;
            }

            if (b.tipo === UtilityPlant.TIPOS.PLANTA_AGUA) {
                water += 150;
                electricity -= 20;
            }

            if (b.tipo === IndustrialBuilding.TIPOS.GRANJA) {
                food += 50;
            }

            // CONSUMOS
            if (b.consumoElectricidad) {
                electricity -= b.consumoElectricidad;
            }

            if (b.consumoAgua) {
                water -= b.consumoAgua;
            }
        });

        city.resources.dinero = money;
        city.resources.electricidad = electricity;
        city.resources.agua = water;
        city.resources.alimentos = food;
    }

    // =========================================
    // RECÁLCULO POSTERIOR A CARGA
    // =========================================
    static recalculateCityDerivedState(city) {
        if (!city || !city.buildings) {
            return;
        }

        if (!Array.isArray(city.citizens)) {
            city.citizens = [];
        }

        if (typeof city.felicidadPromedio !== "number") {
            city.felicidadPromedio = 100;
        }

        if (typeof city.turno !== "number") {
            city.turno = 1;
        }

        if (typeof city.puntaje !== "number") {
            city.puntaje = 0;
        }
    }
}

export default MapImportService;