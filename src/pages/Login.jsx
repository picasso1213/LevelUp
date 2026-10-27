import { Container } from 'react-bootstrap'
import FormularioLogin from '../components/organisms/FormularioLogin.jsx'

function Login() {
  return (
    <section className="panel">
      <Container>
        <div className="auth-wrapper">
          <div className="auth-brand">
            <h1 className="auth-brand-nombre">LEVEL-UP <span className="brand-accent">GAMER</span></h1>
            <h2 className="auth-card-titulo">Inicio de sesión</h2>
          </div>
          <FormularioLogin />
        </div>
      </Container>
    </section>
  )
}

export default Login
