'use client'

import { SelectInput, useField, useFormFields } from '@payloadcms/ui'
import type { OptionObject, TextFieldClientComponent } from 'payload'
import { useCallback, useMemo } from 'react'

type Option = OptionObject & { value: string }

type ArrayFieldSelectConfig = {
  /**
   * Name of the sibling array field to read from (e.g. 'items', 'links').
   * The component reads all rows from `${arrayField}.${index}.${...rowFields}`.
   */
  arrayField: string
  /**
   * Which row fields to read and how to build options.
   * First field in the array becomes the option label.
   * Second field becomes the option value.
   */
  rowFields: [labelField: string, valueField: string]
  /** Placeholder shown when the sibling array has no rows. */
  emptyPlaceholder?: string
}

/**
 * Generic sidebar select that builds its options from a sibling array field's rows.
 *
 * Usage in Payload schema:
 * ```ts
 * {
 *   name: 'myField',
 *   admin: {
 *     components: {
 *       Field: '@/fields/arrayFieldSelect#ArrayFieldSelect',
 *     },
 *     arrayFieldSelect: {
 *       arrayField: 'myArray',
 *       rowFields: ['label', 'value'],
 *       emptyPlaceholder: 'Add items first',
 *     },
 *   },
 * }
 * ```
 */
export const ArrayFieldSelect: TextFieldClientComponent = (props) => {
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

  const path = pathFromProps ?? ''
  const readOnly = Boolean(readOnlyFromProps || fieldReadOnly)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminExtra = (props.field.admin as any).arrayFieldSelect as
    | ArrayFieldSelectConfig
    | undefined

  const hasConfig = Boolean(adminExtra?.arrayField && adminExtra?.rowFields)
  const arrayField = adminExtra?.arrayField ?? ''
  const [labelField, valueField] = adminExtra?.rowFields ?? ['', '']
  const emptyPlaceholder = adminExtra?.emptyPlaceholder ?? 'Add items first'

  // Hooks must always run in the same order - call them before any early return.
  const { disabled, setValue, showError, value } = useField<string | null>({ path })

  const options = useFormFields(([fields]): Option[] => {
    if (!hasConfig) return []

    const byIndex = new Map<string, Record<string, string | number | undefined>>()

    for (const [key, state] of Object.entries(fields)) {
      const pattern = new RegExp(`^${arrayField}\\.(\\d+)\\.(${labelField}|${valueField})$`)
      const match = pattern.exec(key)
      if (!match) continue

      const [, index, prop] = match
      const row = byIndex.get(index) ?? {}
      const raw = state?.value
      if (prop === labelField && typeof raw === 'string') {
        row[prop] = raw
      }
      if (prop === valueField) {
        row[prop] = typeof raw === 'string' || typeof raw === 'number' ? raw : undefined
      }
      byIndex.set(index, row)
    }

    return [...byIndex.entries()]
      .sort(([a], [b]) => Number(a) - Number(b))
      .flatMap(([, row]) => {
        const rowLabel = row[labelField] as string | undefined
        const val = row[valueField]

        if (!val && val !== 0) return []
        return [
          {
            label:
              typeof rowLabel === 'string' && rowLabel.trim() ? rowLabel.trim() : String(val),
            value: String(val),
          },
        ]
      })
  })

  const selectedValue = useMemo(() => {
    if (!hasConfig) return undefined
    if (!value || value === 'null') return undefined
    return options.find((option) => option.value === value)?.value
  }, [hasConfig, options, value])

  const onChange = useCallback(
    (selected: { value?: unknown } | { value?: unknown }[] | null) => {
      if (!hasConfig || readOnly || disabled) return

      if (!selected || Array.isArray(selected)) {
        setValue(null)
        return
      }

      const next = selected.value
      setValue(typeof next === 'string' && next.length > 0 ? next : null)
    },
    [disabled, hasConfig, readOnly, setValue],
  )

  if (!hasConfig) {
    return (
      <SelectInput
        className={className}
        description={description}
        isClearable
        label={label}
        localized={localized}
        name={path}
        options={[]}
        path={path}
        placeholder="arrayFieldSelect config missing"
        readOnly
        required={required}
        showError={showError}
        value={undefined}
      />
    )
  }

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
      placeholder={options.length === 0 ? emptyPlaceholder : 'Select value'}
      readOnly={readOnly || disabled}
      required={required}
      showError={showError}
      value={selectedValue}
    />
  )
}
