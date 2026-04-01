class UbicationService {
    constructor() {
        this.geoURL = "https://nominatim.openstreetmap.org/search";
    }

    async getCoordenadasCiudad(nombreCiudad, pais = "Colombia") {
        try {
            console.log("Buscando ciudad...");

            const query = `${nombreCiudad}, ${pais}`;

            const response = await fetch(
                `${this.geoURL}?format=json&q=${encodeURIComponent(query)}`
            );

            const data = await response.json();

            if (!data || data.length === 0) {
                console.log("Ciudad no encontrada");
                return null;
            }

            const resultado = data[0];

            const coordenadas = {
                nombre: resultado.display_name,
                lat: parseFloat(resultado.lat),
                lon: parseFloat(resultado.lon)
            };

            console.log("Ubicación encontrada:");
            console.log("Ciudad:", coordenadas.nombre);
            console.log("Latitud:", coordenadas.lat);
            console.log("Longitud:", coordenadas.lon);

            return coordenadas;

        } catch (error) {
            console.error("Error en UbicationService:", error);
            return null;
        }
    }
}