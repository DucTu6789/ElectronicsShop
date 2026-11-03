import { useId } from 'react'

// Một ô nhập: nhãn + input + thông báo lỗi (hoặc gợi ý) bên dưới.
// Lỗi / gợi ý nằm ngoài <label> và được liên kết bằng aria-describedby
// -> trình đọc màn hình đọc nhãn rõ ràng, rồi mới đọc lỗi / gợi ý.
export default function FormField({ label, name, error, hint, ...inputProps }) {
  const id = useId()
  const noteId = `${id}-note`
  const note = error || hint

  return (
    <div className={error ? 'field field-invalid' : 'field'}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={note ? noteId : undefined}
        {...inputProps}
      />
      {note && (
        <span id={noteId} className={error ? 'field-error' : 'field-hint'} role={error ? 'alert' : undefined}>
          {note}
        </span>
      )}
    </div>
  )
}
