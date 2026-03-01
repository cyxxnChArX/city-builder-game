class EmploymentBuilding extends Building {

    constructor(id, costo, x, y, tipo, capacidadEmpleo) {
        // atributos heredados de Building arriba
        super(id, costo, x, y);

        // propios de esta clase
        this.tipo = tipo;
        this.capacidadEmpleo = capacidadEmpleo;
        this.empleados = [];
    }

    agregarEmpleado(citizen) {
        if (this.empleados.length < this.capacidadEmpleo) {
            this.empleados.push(citizen);
            return true;
        }
        return false;
    }

    eliminarEmpleadoPorId(idCitizen) {
        const nuevaLista = [];
        for (let i = 0; i < this.empleados.length; i++) {
            if (this.empleados[i].id !== idCitizen) {
                nuevaLista.push(this.empleados[i]);
            }
        }
        this.empleados = nuevaLista;
    }

    //metodo para vaciar la lista de empleados y directamente ponerle null al atributo de
    //los empleados que trabajan aqui (for each js)
    eliminarEmpleados() {
        for (let ciudadano of this.empleados) {
            ciudadano.removerEmpleo();
        }
        this.empleados = [];
    }

}