//funciones clasicas de js

function suma(a,b){
    return a+b
}
console.log(suma(2,5))

//las funciones de flecha nos permiten almacenar funciones en una constante

const restar = (a, b) => {return a-b}
//se puede omititir el return si es solo una expresion
const multiplicar =(a, b) =>a*b

console.log(restar(10,2))
console.log(multiplicar(20,3))
//si ocupo solo un parametro, los parentecis son opcionales

const doble=n => n*2
console.log(doble(5))

const saludar = (nombre) => `hola ${nombre}`
console.log(saludar("Picasso"))
//puedo colocar parametros por defecto
const saludar2 = (nombre="no hay nombre") => `hola ${nombre}`
console.log(saludar2())
console.log(saludar2(goku))
