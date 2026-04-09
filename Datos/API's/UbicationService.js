class UbicationService {
    static geoURL = "https://nominatim.openstreetmap.org/search";

    static async getCoordenadasCiudad(nombreCiudad, pais = "Colombia") {
        try {

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

            return coordenadas;

        } catch (error) {
            console.error("Error en UbicationService:", error);
            return null;
        }
    }
}

export default UbicationService;