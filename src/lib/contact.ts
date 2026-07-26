export const CONTACT_CATEGORIES = [
  { label: 'General', value: 'general' },
  { label: 'Project inquiry', value: 'project' },
  { label: 'Speaking', value: 'speaking' },
  { label: 'Other', value: 'other' },
] as const

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number]['value']

export const CONTACT_CATEGORY_VALUES: readonly ContactCategory[] = CONTACT_CATEGORIES.map(
  (entry) => entry.value,
)
