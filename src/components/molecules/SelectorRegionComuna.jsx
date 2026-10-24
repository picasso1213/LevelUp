import { Row, Col } from 'react-bootstrap'
import CampoFormulario from '../atoms/CampoFormulario.jsx'
import { REGIONES } from '../../data/regiones.js'

// Molécula: selects en cascada. La lista de comunas se DERIVA de la región elegida (no es estado aparte).
function SelectorRegionComuna({ region, comuna, onCambio, errorRegion, errorComuna }) {
  const comunas = REGIONES[region] || []

  return (
    <Row>
      <Col xs={12} md={6}>
        <CampoFormulario
          as="select" id="reg-region" label="Región" value={region} error={errorRegion}
          onChange={(e) => onCambio({ region: e.target.value, comuna: '' })}
        >
          <option value="" disabled>-- Selecciona la región --</option>
          {Object.keys(REGIONES).map((r) => <option key={r} value={r}>{r}</option>)}
        </CampoFormulario>
      </Col>
      <Col xs={12} md={6}>
        <CampoFormulario
          as="select" id="reg-comuna" label="Comuna" value={comuna} error={errorComuna}
          disabled={comunas.length === 0}
          onChange={(e) => onCambio({ region, comuna: e.target.value })}
        >
          <option value="" disabled>
            {comunas.length === 0 ? '-- Primero selecciona la región --' : '-- Selecciona la comuna --'}
          </option>
          {comunas.map((c) => <option key={c} value={c}>{c}</option>)}
        </CampoFormulario>
      </Col>
    </Row>
  )
}

export default SelectorRegionComuna
