class NewsService {
    constructor() {
        this.baseURL = "https://newsapi.org/v2/everything";
    }

    async getNoticiasPorCiudad(ciudad) {
        try {
            const query = `${ciudad} Colombia`;

            const response = await fetch(
                `${this.baseURL}?q=${encodeURIComponent(query)}&sortBy=publishedAt&apiKey=7c08b66997e94720a4648630c8f5c587`
            );

            const data = await response.json();

            if (data.status !== "ok") {
                console.log("Error al obtener noticias");
                return null;
            }

            return data.articles.map(noticia => ({
                titulo: noticia.title,
                fuente: noticia.source.name,
                url: noticia.url
            }));

        } catch (error) {
            console.error("Error en NewsService:", error);
            return null;
        }
    }
}