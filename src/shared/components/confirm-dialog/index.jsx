import './ConfirmDialog.css'
import { Modal } from '../modal'
import { PanelButton } from '../panel-button'
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}) {
  return (
    <Modal title={title} maxWidth="380px" onClose={onCancel}>
      {message && <p className="confirm-dialog__message">{message}</p>}

      <div className="confirm-dialog__footer">
        <PanelButton variant="cancel" label="Cancel" onClick={onCancel} />
        <PanelButton
          variant="danger"
          label={confirmLabel}
          onClick={onConfirm}
        />
      </div>
    </Modal>
  )
}
