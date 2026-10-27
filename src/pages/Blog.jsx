import { Container } from 'react-bootstrap'

function Blog() {
  return (
    <section className="panel">
      <Container>
        <article className="blog-detalle">
          <h1>Level-Up Gamer cumple 2 años</h1>
          <p className="lead text-secondary">Cómo nació nuestra tienda y hacia dónde vamos.</p>
          <img src="/images/blog-aniversario.png" width="800" height="500" alt="" />
          <p>Level-Up Gamer partió hace dos años, en plena pandemia, cuando la demanda de consolas, sillas y accesorios gamer creció más rápido que nunca en Chile. Sin una tienda física, apostamos por un modelo 100% online con despacho a todo el país, para que cualquier persona, desde Arica a Punta Arenas, pudiera equipar su setup sin salir de casa.</p>
          <p>En estos dos años fuimos sumando categorías: partimos con consolas y accesorios, y hoy ofrecemos también computadores gamers, sillas ergonómicas, mouse, mousepads y ropa personalizada para la comunidad. Además, lanzamos un descuento permanente del 20% para quienes se registran con su correo institucional Duoc, como forma de acercarnos a los futuros desarrolladores y diseñadores del país.</p>
          <p>De cara al futuro, seguimos trabajando en nuestro programa de fidelización <strong>LevelUp</strong>, que premia con puntos canjeables cada compra y cada referido, y en sumar más eventos gamer a lo largo de Chile donde nuestra comunidad pueda juntarse, competir y seguir subiendo de nivel.</p>
        </article>
      </Container>
    </section>
  )
}

export default Blog
