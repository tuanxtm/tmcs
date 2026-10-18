import type { CollectionBeforeDeleteHook } from 'payload'

export const deleteLinkNavigation: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const db = req.payload.db.binding

  // Required navigation links cannot use the database's SET NULL delete action.
  // Remove their array rows, including saved versions, before deleting the link.
  await db.batch(
    [
      'site_settings_navigation_children',
      'site_settings_navigation',
      '_site_settings_v_version_navigation_children',
      '_site_settings_v_version_navigation',
    ].map((table) => db.prepare(`DELETE FROM "${table}" WHERE link_id = ?`).bind(id)),
  )
}
