class WeatherService {
    constructor() {
        this.apiClimaURL = "https://api.open-meteo.com/v1/forecast";
    }

    async getClima(lat, lon) {
        try {
            const response = await fetch(
                `${this.apiClimaURL}?latitude=${lat}&longitude=${lon}&current_weather=true`
            );

            const data = await response.json();

            if (!data.current_weather) {
                console.log("No se pudo obtener el clima");
                return null;
            }

            const clima = data.current_weather;

            return {
                temperatura: clima.temperature,
                viento: clima.windspeed,
                descripcion: this.interpretarWeatherCode(clima.weathercode)
            };

        } catch (error) {
            console.error("Error en WeatherService:", error);
            return null;
        }
    }

    interpretarWeatherCode(code) {
        if (code === 0) return "Soleado";
        if ([1, 2].includes(code)) return "Parcialmente nublado";
        if (code === 3) return "Nublado";
        if ([45, 48].includes(code)) return "Niebla";
        if ([51, 53, 55].includes(code)) return "Llovizna";
        if ([61, 63, 65].includes(code)) return "Lluvia";
        if ([71, 73, 75].includes(code)) return "Nieve";
        if (code === 77) return "Aguanieve";
        if (code === 95) return "Tormenta";
        if ([96, 99].includes(code)) return "Tormenta fuerte";

        return "Clima desconocido";
    }
}