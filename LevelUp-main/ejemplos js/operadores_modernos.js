const edad=33
//operador ternario
const respuesta= edad >=18? "mayor de edad ": "menor de edad"
console.log(respuesta)

//?? "nullish coalescing": usa el valor de la derecha SOLO si el de la izquierda es null o undefined
const telefono=null
console.log(telefono?? "no hay telefono")

//? evita los errores por valores nulos
console.log(telefono?.trim())
const usuario={perfil:{nombre:"bisharp"}}
console.log(usuario.perfil?.nombre)
console.log(usuario.perfil?.apellido)//apellido no existe en el objeto