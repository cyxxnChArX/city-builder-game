class RankingService {
    static RANKING_KEY = "cityGame_ranking";

    // =========================================
    // LECTURA BASE
    // =========================================

    static getRanking() {
        const rawData = localStorage.getItem(this.RANKING_KEY);

        if (!rawData) {
            return [];
        }

        try {
            const parsed = JSON.parse(rawData);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Error al leer ranking desde LocalStorage:", error);
            return [];
        }
    }

    static saveRanking(ranking) {
        localStorage.setItem(this.RANKING_KEY, JSON.stringify(ranking));
    }

    // =========================================
    // CONVERTIR CITY A ENTRADA DE RANKING
    // =========================================

    static createRankingEntry(city) {
        if (!city) {
            throw new Error("No se puede crear ranking con una ciudad nula.");
        }

        return {
            id: city.id,
            cityName: city.nombre,
            alcalde: city.alcalde || "Sin alcalde",
            score: city.puntaje ?? 0,
            population: Array.isArray(city.citizens) ? city.citizens.length : 0,
            happiness: city.felicidadPromedio ?? 0,
            turns: city.turno ?? 1,
            date: new Date().toISOString()
        };
    }

    // =========================================
    // AGREGAR / ACTUALIZAR CIUDAD EN RANKING
    // =========================================

    static updateCityRanking(city) {
        const ranking = this.getRanking();
        const entry = this.createRankingEntry(city);

        const existingIndex = ranking.findIndex(item => item.id === entry.id);

        if (existingIndex >= 0) {
            ranking[existingIndex] = entry;
        } else {
            ranking.push(entry);
        }

        const sortedRanking = this.sortRanking(ranking);
        this.saveRanking(sortedRanking);

        return sortedRanking;
    }

    static sortRanking(ranking) {
        return [...ranking].sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            if (b.population !== a.population) {
                return b.population - a.population;
            }

            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }

    // =========================================
    // CONSULTAS ÚTILES
    // =========================================

    static getTop10() {
        return this.getRanking().slice(0, 10);
    }

    static getCityPosition(cityId) {
        if (!cityId) {
            return -1;
        }

        const ranking = this.getRanking();
        const index = ranking.findIndex(item => item.id === cityId);

        return index >= 0 ? index + 1 : -1;
    }

    static getHighlightedRanking(cityId) {
        const ranking = this.getRanking();
        const top10 = ranking.slice(0, 10);
        const currentCityPosition = this.getCityPosition(cityId);

        return {
            top10,
            currentCityPosition,
            currentCityEntry: ranking.find(item => item.id === cityId) || null
        };
    }

    static hasRanking() {
        return this.getRanking().length > 0;
    }

    // =========================================
    // EXPORTAR
    // =========================================

    static exportRankingToJSON() {
        const ranking = this.getRanking();
        return JSON.stringify({ ranking }, null, 2);
    }

    static downloadRankingJSON(filename = null) {
        const jsonContent = this.exportRankingToJSON();
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const safeFilename =
            filename || `ranking_${new Date().toISOString().slice(0, 10)}.json`;

        const a = document.createElement("a");
        a.href = url;
        a.download = safeFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
    }

    // =========================================
    // REINICIAR
    // =========================================

    static clearRanking() {
        localStorage.removeItem(this.RANKING_KEY);
    }
}

export default RankingService;