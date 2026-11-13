import './EditPanel.css'
import { useState } from 'react'
import { MdOutlineEditNote } from 'react-icons/md'
import { useEditableForm } from '../../../shared/hooks/useEditableForm'
import { PanelButton } from '../../../shared/components'
export function EditPanel({ title, data, onSave, schema, children }) {
  const [isEditing, setIsEditing] = useState(false)
  const { draft, errors, loading, handleChange, reset, submit } =
    useEditableForm({
      data,
      schema,
      onSave,
      isEditing,
    })
  const handleEdit = () => {
    reset()
    setIsEditing(true)
  }
  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }
  const handleSave = async () => {
    if (await submit()) setIsEditing(false)
  }
  return (
    <div className="edit-panel">
      <div className="edit-panel__header">
        <span className="edit-panel__title">{title}</span>
        {!isEditing && (
          <PanelButton
            variant="edit"
            label="Edit"
            icon={MdOutlineEditNote}
            onClick={handleEdit}
          />
        )}
      </div>

      <div className="edit-panel__content">
        {children({
          isEditing,
          draft,
          handleChange,
          errors,
        })}
      </div>

      {isEditing && (
        <div className="edit-panel__footer">
          <PanelButton
            variant="cancel"
            label="Cancel"
            onClick={handleCancel}
            disabled={loading}
          />
          <PanelButton
            variant="save"
            label="Save Changes"
            loadingLabel="Saving…"
            onClick={handleSave}
            loading={loading}
          />
        </div>
      )}
    </div>
  )
}
