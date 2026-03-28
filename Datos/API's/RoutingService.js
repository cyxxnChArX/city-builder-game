import Road from "../../Modelos/Road.js";

class RoutingService {
    static BASE_URL = "http://127.0.0.1:5000";
    static ENDPOINT = "/api/calculate-route";

    // ==============================
    // CONVERTIR MAPA A MATRIZ BINARIA
    // ==============================
    static mapToBinaryMatrix(map) {
        if (!map || !Array.isArray(map.mapa)) {
            throw new Error("El objeto Map no es válido.");
        }

        const binaryMatrix = [];

        for (let y = 0; y < map.alto; y++) {
            const row = [];

            for (let x = 0; x < map.ancho; x++) {
                const cell = map.obtenerCelda(x, y);

                if (cell instanceof Road) {
                    row.push(1);
                } else {
                    row.push(0);
                }
            }

            binaryMatrix.push(row);
        }

        return binaryMatrix;
    }

    // ==============================
    // CONVERTIR COORDENADAS x,y A fila,columna
    // ==============================
    static toBackendCoordinate(x, y) {
        if (!Number.isInteger(x) || !Number.isInteger(y)) {
            throw new Error("Las coordenadas deben ser enteros.");
        }

        return [y, x];
    }

    // ==============================
    // VALIDAR COORDENADAS DENTRO DEL MAPA
    // ==============================
    static validateCoordinates(map, x, y, label = "coordenada") {
        if (!map.esValida(x, y)) {
            throw new Error(`La ${label} (${x}, ${y}) está fuera de los límites del mapa.`);
        }
    }

    // ==============================
    // VALIDAR QUE ORIGEN Y DESTINO SEAN VÍAS
    // ==============================
    static validateRoadCell(map, x, y, label = "punto") {
        const cell = map.obtenerCelda(x, y);

        if (!(cell instanceof Road)) {
            throw new Error(`El ${label} (${x}, ${y}) no está sobre una vía.`);
        }
    }

    // ==============================
    // CONSTRUIR PAYLOAD PARA EL BACKEND
    // ==============================
    static buildPayload(map, startX, startY, endX, endY) {
        this.validateCoordinates(map, startX, startY, "coordenada inicial");
        this.validateCoordinates(map, endX, endY, "coordenada final");

        this.validateRoadCell(map, startX, startY, "origen");
        this.validateRoadCell(map, endX, endY, "destino");

        return {
            map: this.mapToBinaryMatrix(map),
            start: this.toBackendCoordinate(startX, startY),
            end: this.toBackendCoordinate(endX, endY)
        };
    }

    // ==============================
    // LLAMAR AL BACKEND
    // ==============================
    static async calculateRoute(map, startX, startY, endX, endY) {
        const payload = this.buildPayload(map, startX, startY, endX, endY);

        let response;

        try {
            response = await fetch(`${this.BASE_URL}${this.ENDPOINT}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            throw new Error(
                "No fue posible conectar con el servidor de rutas. Verifica que el backend esté ejecutándose en http://127.0.0.1:5000."
            );
        }

        let data;

        try {
            data = await response.json();
        } catch (error) {
            throw new Error("La respuesta del backend no es un JSON válido.");
        }

        if (!response.ok) {
            throw new Error(data.error || "Error desconocido al calcular la ruta.");
        }

        if (!Array.isArray(data.route)) {
            throw new Error("La respuesta del backend no contiene una ruta válida.");
        }

        return data.route;
    }

    // ==============================
    // CONVERTIR RUTA DEL BACKEND A x,y
    // ==============================
    static routeToXY(route) {
        if (!Array.isArray(route)) {
            throw new Error("La ruta recibida no es válida.");
        }

        return route.map(([row, col]) => ({
            x: col,
            y: row
        }));
    }

    // ==============================
    // MÉTODO COMPLETO: CALCULAR Y DEVOLVER EN x,y
    // ==============================
    static async calculateRouteAsXY(map, startX, startY, endX, endY) {
        const backendRoute = await this.calculateRoute(map, startX, startY, endX, endY);
        return this.routeToXY(backendRoute);
    }
}

export default RoutingService;