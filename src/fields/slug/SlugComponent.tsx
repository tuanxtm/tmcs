'use client'

import { Button, FieldLabel, TextInput, useField, useForm, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import { useCallback, useEffect } from 'react'

import { formatSlug } from '@/lib/slugify'

type SlugComponentClientProps = {
  useAsSlug: string
  checkboxFieldPath: string
}

/**
 * Custom Admin field for the slug input. Mirrors the lock-toggle UX from
 * Payload's official slugField example, but:
 * - Renders a Lock/Unlock button next to the label
 * - Reads `formatSlug` from `@/lib/slugify` so the UI matches the server
 *   hook exactly
 * - Treats a truthy `slugLock` checkbox value as the locked state
 *   (input is read-only, slug auto-syncs from `useAsSlug`)
 */
export const SlugComponent: TextFieldClientComponent = (props) => {
  const {
    field,
    useAsSlug,
    checkboxFieldPath: checkboxFieldPathFromProps,
    path,
    readOnly: readOnlyFromProps,
  } = props as unknown as SlugComponentClientProps & {
    field: { label?: string; name: string }
    path?: string
    readOnly?: boolean
  }

  const { label, name } = field

  const checkboxFieldPath = path?.includes('.')
    ? `${path}.${checkboxFieldPathFromProps}`
    : checkboxFieldPathFromProps

  const { value, setValue } = useField<string>({ path: path || name })

  const { dispatchFields } = useForm()

  // The value of the checkbox - using a separate useFormFields call to
  // minimise re-renders.
  const checkboxValue = useFormFields(([fields]) => {
    return fields[checkboxFieldPath]?.value as boolean | undefined
  })

  // The value of the field we're listening to for the slug (e.g. title).
  const sourceFieldValue = useFormFields(([fields]) => {
    return fields[useAsSlug]?.value as string | undefined
  })

  useEffect(() => {
    if (checkboxValue) {
      if (sourceFieldValue) {
        const formatted = formatSlug(sourceFieldValue)
        if (value !== formatted) setValue(formatted)
      } else if (value !== '') {
        setValue('')
      }
    }
  }, [sourceFieldValue, checkboxValue, setValue, value])

  const handleLockToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      dispatchFields({
        type: 'UPDATE',
        path: checkboxFieldPath,
        value: !checkboxValue,
      })
    },
    [checkboxValue, checkboxFieldPath, dispatchFields],
  )

  const readOnly = Boolean(readOnlyFromProps || checkboxValue)

  return (
    <div className="field-type slug-field-component">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <FieldLabel htmlFor={`field-${path}`} label={label} />

        <Button buttonStyle="transparent" className="lock-button" onClick={handleLockToggle}>
          {checkboxValue ? 'Unlock' : 'Lock'}
        </Button>
      </div>

      <TextInput onChange={setValue} path={path || name} readOnly={readOnly} value={value} />
    </div>
  )
}
