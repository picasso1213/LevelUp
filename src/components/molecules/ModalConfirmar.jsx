import { Modal, Button } from 'react-bootstrap'

// Molécula: ventana de confirmación para acciones que no se pueden deshacer (eliminar).
function ModalConfirmar({ mostrar, titulo, mensaje, textoConfirmar = 'Eliminar', onConfirmar, onCancelar }) {
  return (
    <Modal show={mostrar} onHide={onCancelar} centered>
      <Modal.Header closeButton>
        <Modal.Title>{titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{mensaje}</Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="outline-accent" onClick={onCancelar}>Cancelar</Button>
        <Button type="button" variant="danger" onClick={onConfirmar}>{textoConfirmar}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalConfirmar
