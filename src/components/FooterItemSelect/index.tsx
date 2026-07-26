'use client'

import { SelectInput, useField, useFormFields } from '@payloadcms/ui'
import type { OptionObject, TextFieldClientComponent } from 'payload'
import { useCallback, useMemo } from 'react'

type ItemOption = OptionObject & { value: string }

/**
 * Sidebar select for DecorationPacks.footerItem.
 * Options come from the sibling `items` array (row id → title).
 */
export const FooterItemSelect: TextFieldClientComponent = (props) => {
  const {
    field: {
      admin: { className, description, readOnly: fieldReadOnly } = {},
      label,
      localized,
      required,
    },
    path: pathFromProps,
    readOnly: readOnlyFromProps,
  } = props

  const path = pathFromProps || 'footerItem'
  const readOnly = Boolean(readOnlyFromProps || fieldReadOnly)

  const { disabled, setValue, showError, value } = useField<string | null>({
    path,
  })

  const options = useFormFields(([fields]): ItemOption[] => {
    const byIndex = new Map<string, { id?: string; title?: string }>()

    for (const [key, state] of Object.entries(fields)) {
      const match = /^items\.(\d+)\.(id|title)$/.exec(key)
      if (!match) continue

      const [, index, prop] = match
      const row = byIndex.get(index) ?? {}
      const raw = state?.value
      if (prop === 'id' && (typeof raw === 'string' || typeof raw === 'number')) {
        row.id = String(raw)
      }
      if (prop === 'title' && typeof raw === 'string') {
        row.title = raw
      }
      byIndex.set(index, row)
    }

    return [...byIndex.entries()]
      .sort(([a], [b]) => Number(a) - Number(b))
      .flatMap(([, row]) => {
        if (!row.id) return []
        return [
          {
            label: row.title?.trim() || row.id,
            value: row.id,
          },
        ]
      })
  })

  const selectedValue = useMemo(() => {
    if (!value || value === 'null') return undefined
    return options.find((option) => option.value === value)?.value
  }, [options, value])

  const onChange = useCallback(
    (selected: { value?: unknown } | { value?: unknown }[] | null) => {
      if (readOnly || disabled) return

      if (!selected || Array.isArray(selected)) {
        setValue(null)
        return
      }

      const next = selected.value
      setValue(typeof next === 'string' && next.length > 0 ? next : null)
    },
    [disabled, readOnly, setValue],
  )

  return (
    <SelectInput
      className={className}
      description={description}
      isClearable
      label={label}
      localized={localized}
      name={path}
      onChange={onChange}
      options={options}
      path={path}
      placeholder={options.length === 0 ? 'Add items first' : 'Select footer decoration'}
      readOnly={readOnly || disabled}
      required={required}
      showError={showError}
      value={selectedValue}
    />
  )
}
