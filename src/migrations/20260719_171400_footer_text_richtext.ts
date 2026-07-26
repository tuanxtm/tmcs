import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

function toLexicalJson(plain: string): string {
  return JSON.stringify({
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: plain, version: 1 }],
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  })
}

function isAlreadyLexical(value: string): boolean {
  try {
    const parsed = JSON.parse(value) as { root?: { type?: string } }
    return parsed?.root?.type === 'root'
  } catch {
    return false
  }
}

function extractRows(result: unknown): Array<{ id: number; value: string }> {
  if (Array.isArray(result)) return result as Array<{ id: number; value: string }>
  if (result && typeof result === 'object') {
    const record = result as { rows?: unknown; results?: unknown }
    if (Array.isArray(record.rows)) return record.rows as Array<{ id: number; value: string }>
    if (Array.isArray(record.results)) return record.results as Array<{ id: number; value: string }>
  }
  return []
}

async function wrapPlainTextColumn({
  db,
  table,
  column,
}: {
  db: MigrateUpArgs['db']
  table: 'footer_locales' | '_footer_v_locales'
  column: 'text' | 'version_text'
}): Promise<void> {
  const result = await db.run(
    sql.raw(
      `SELECT id, "${column}" AS value FROM "${table}" WHERE "${column}" IS NOT NULL AND TRIM("${column}") != ''`,
    ),
  )

  for (const row of extractRows(result)) {
    if (typeof row.value !== 'string' || isAlreadyLexical(row.value)) continue

    const escaped = toLexicalJson(row.value).replaceAll("'", "''")
    await db.run(sql.raw(`UPDATE "${table}" SET "${column}" = '${escaped}' WHERE id = ${Number(row.id)}`))
  }
}

/**
 * Schema is unchanged (textarea and richText both use text columns).
 * Convert any existing plain-string footer text into Lexical JSON.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await wrapPlainTextColumn({ db, table: 'footer_locales', column: 'text' })
  await wrapPlainTextColumn({ db, table: '_footer_v_locales', column: 'version_text' })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Irreversible: Lexical JSON cannot be reliably restored to the original plain string shape.
}
