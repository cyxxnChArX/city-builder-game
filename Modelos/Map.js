 class Map {

    constructor(ancho, alto) {

        if (ancho < 15 || ancho > 30 || alto < 15 || alto > 30) {
            throw new Error("Dimensiones invalidas (15x15 - 30x30)");
        }

        this.ancho = ancho;
        this.alto = alto;

        // Crear matriz vacía
        this.mapa = [];

        // llenar la matriz de x filas por y columnas 

        for (let y = 0; y < alto; y++) {
            const fila = [];
            for (let x = 0; x < ancho; x++) {
                fila.push(null);  // null = terreno vacío
            }
            this.mapa.push(fila);
        }
    }

    //METODOS utiles
    
    //si la posicion que envio esta dentro del tamaño de la matriz
    esValida(x, y) {
        return x >= 0 && x < this.ancho && y >= 0 && y < this.alto;
    }

    //obtener el objeto que esta en la celda x y 
    obtenerCelda(x, y) {
        if (!this.esValida(x, y)) return null;
        return this.mapa[y][x];
    }

    //verificar si la celda esta vacia
    estaLibre(x, y) {
        return this.esValida(x, y) && this.mapa[y][x] === null;
    }

    //colocar objeto en el mapa
    colocar(objeto, x, y) {
        if (!this.estaLibre(x, y)) return false;
        this.mapa[y][x] = objeto;
        return true;
    }

    eliminar(x, y) {
        if (!this.esValida(x, y)) return false;
        this.mapa[y][x] = null;
        return true;
    }

    //OJO aca verifica si un edificio tiene una via paralela
    hayViaAdyacente(x, y) {

        const direcciones = [
            [0, -1], // arriba
            [0, 1],  // abajo
            [-1, 0], // izquierda
            [1, 0]   // derecha
    ]   ;

        for (let [dx, dy] of direcciones) {

            const nx = x + dx;
            const ny = y + dy;

            if (this.esValida(nx, ny)) {

                const celda = this.mapa[ny][nx];

                if (celda instanceof Road) {
                    return true;
                }
            }
        }

        return false;
    }
}