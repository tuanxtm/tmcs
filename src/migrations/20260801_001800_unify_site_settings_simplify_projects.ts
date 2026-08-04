import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

function extractRows<T extends Record<string, unknown>>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[]
  if (result && typeof result === 'object') {
    const record = result as { rows?: unknown; results?: unknown }
    if (Array.isArray(record.rows)) return record.rows as T[]
    if (Array.isArray(record.results)) return record.results as T[]
  }
  return []
}

async function tableExists(db: MigrateUpArgs['db'], table: string): Promise<boolean> {
  const result = await db.run(
    sql.raw(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${table.replaceAll("'", "''")}'`,
    ),
  )
  return extractRows<{ name: string }>(result).length > 0
}

async function columnNames(db: MigrateUpArgs['db'], table: string): Promise<Set<string>> {
  const result = await db.run(sql.raw(`PRAGMA table_info(${table})`))
  return new Set(extractRows<{ name: string }>(result).map((row) => row.name))
}

function escapeSql(value: string): string {
  return value.replaceAll("'", "''")
}

function platformLabel(platform: unknown, label: unknown): string {
  if (typeof label === 'string' && label.trim()) return label.trim()
  if (typeof platform === 'string' && platform.trim()) {
    const known: Record<string, string> = {
      github: 'GitHub',
      linkedin: 'LinkedIn',
      x: 'X / Twitter',
      youtube: 'YouTube',
      facebook: 'Facebook',
      instagram: 'Instagram',
      tiktok: 'TikTok',
      threads: 'Threads',
      website: 'Website',
      other: 'Link',
    }
    return known[platform] || platform
  }
  return 'Link'
}

/**
 * Unify Navigation/Footer/Frontpage into Site settings tabs; simplify Projects;
 * rename profile hero fields to top-level cover/profile/bio/links.
 *
 * Preserves live site-settings/navigation/footer/frontpage values.
 * Global version history for removed globals is discarded.
 */
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  void payload

  // ---------------------------------------------------------------------------
  // 1) Projects: drop unused fields / arrays; add categories + tags rel columns
  // ---------------------------------------------------------------------------
  const projectDropColumns = [
    'demo_url',
    'repository_url',
    'documentation_url',
    'repository_private',
    'client_confidential',
    'project_type',
    'project_status',
    'start_date',
    'end_date',
    'order',
  ]
  const projectColumns = await columnNames(db, 'projects')
  for (const column of projectDropColumns) {
    if (projectColumns.has(column)) {
      await db.run(sql.raw(`ALTER TABLE \`projects\` DROP COLUMN \`${column}\`;`))
    }
  }

  const projectLocaleDrop = ['challenge', 'solution', 'outcome', 'client']
  const projectLocaleColumns = await columnNames(db, 'projects_locales')
  for (const column of projectLocaleDrop) {
    if (projectLocaleColumns.has(column)) {
      await db.run(sql.raw(`ALTER TABLE \`projects_locales\` DROP COLUMN \`${column}\`;`))
    }
  }

  if (await tableExists(db, '_projects_v')) {
    const versionColumns = await columnNames(db, '_projects_v')
    for (const column of projectDropColumns) {
      const versionColumn = `version_${column}`
      if (versionColumns.has(versionColumn)) {
        await db.run(sql.raw(`ALTER TABLE \`_projects_v\` DROP COLUMN \`${versionColumn}\`;`))
      }
    }
  }

  if (await tableExists(db, '_projects_v_locales')) {
    const versionLocaleColumns = await columnNames(db, '_projects_v_locales')
    for (const column of projectLocaleDrop) {
      const versionColumn = `version_${column}`
      if (versionLocaleColumns.has(versionColumn)) {
        await db.run(sql.raw(`ALTER TABLE \`_projects_v_locales\` DROP COLUMN \`${versionColumn}\`;`))
      }
    }
  }

  await db.run(sql`DROP TABLE IF EXISTS \`projects_results_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`projects_results\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_projects_v_version_results_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_projects_v_version_results\`;`)

  // Rebuild projects_rels: keep related projects; drop contributors; add categories/tags.
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_projects_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`projects_id\` integer,
  	\`categories_id\` integer,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`
    INSERT INTO \`__new_projects_rels\`("id", "order", "parent_id", "path", "projects_id", "categories_id", "tags_id")
    SELECT "id", "order", "parent_id", "path", "projects_id", NULL, NULL
    FROM \`projects_rels\`
    WHERE \`path\` = 'relatedProjects';
  `)
  await db.run(sql`DROP TABLE \`projects_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_projects_rels\` RENAME TO \`projects_rels\`;`)
  await db.run(sql`CREATE INDEX \`projects_rels_order_idx\` ON \`projects_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_parent_idx\` ON \`projects_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_path_idx\` ON \`projects_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_projects_id_idx\` ON \`projects_rels\` (\`projects_id\`);`)
  await db.run(
    sql`CREATE INDEX \`projects_rels_categories_id_idx\` ON \`projects_rels\` (\`categories_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`projects_rels_tags_id_idx\` ON \`projects_rels\` (\`tags_id\`);`)

  if (await tableExists(db, '_projects_v_rels')) {
    await db.run(sql`CREATE TABLE \`__new__projects_v_rels\` (
    	\`id\` integer PRIMARY KEY NOT NULL,
    	\`order\` integer,
    	\`parent_id\` integer NOT NULL,
    	\`path\` text NOT NULL,
    	\`projects_id\` integer,
    	\`categories_id\` integer,
    	\`tags_id\` integer,
    	FOREIGN KEY (\`parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
    	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(sql`
      INSERT INTO \`__new__projects_v_rels\`("id", "order", "parent_id", "path", "projects_id", "categories_id", "tags_id")
      SELECT "id", "order", "parent_id", "path", "projects_id", NULL, NULL
      FROM \`_projects_v_rels\`
      WHERE \`path\` = 'relatedProjects';
    `)
    await db.run(sql`DROP TABLE \`_projects_v_rels\`;`)
    await db.run(sql`ALTER TABLE \`__new__projects_v_rels\` RENAME TO \`_projects_v_rels\`;`)
    await db.run(sql`CREATE INDEX \`_projects_v_rels_order_idx\` ON \`_projects_v_rels\` (\`order\`);`)
    await db.run(sql`CREATE INDEX \`_projects_v_rels_parent_idx\` ON \`_projects_v_rels\` (\`parent_id\`);`)
    await db.run(sql`CREATE INDEX \`_projects_v_rels_path_idx\` ON \`_projects_v_rels\` (\`path\`);`)
    await db.run(
      sql`CREATE INDEX \`_projects_v_rels_projects_id_idx\` ON \`_projects_v_rels\` (\`projects_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_projects_v_rels_categories_id_idx\` ON \`_projects_v_rels\` (\`categories_id\`);`,
    )
    await db.run(sql`CREATE INDEX \`_projects_v_rels_tags_id_idx\` ON \`_projects_v_rels\` (\`tags_id\`);`)
  }
  await db.run(sql`PRAGMA foreign_keys=ON;`)

  // ---------------------------------------------------------------------------
  // 2) Site settings: add cover + active pack; flatten profile fields
  // ---------------------------------------------------------------------------
  const siteColumns = await columnNames(db, 'site_settings')
  if (!siteColumns.has('cover_image_id')) {
    await db.run(
      sql`ALTER TABLE \`site_settings\` ADD \`cover_image_id\` integer REFERENCES media(id);`,
    )
    await db.run(
      sql`CREATE INDEX \`site_settings_cover_image_idx\` ON \`site_settings\` (\`cover_image_id\`);`,
    )
  }
  if (!siteColumns.has('active_decoration_pack_id')) {
    await db.run(
      sql`ALTER TABLE \`site_settings\` ADD \`active_decoration_pack_id\` integer REFERENCES decoration_packs(id);`,
    )
    await db.run(
      sql`CREATE INDEX \`site_settings_active_decoration_pack_idx\` ON \`site_settings\` (\`active_decoration_pack_id\`);`,
    )
  }

  if (await tableExists(db, 'frontpage')) {
    await db.run(sql`
      UPDATE \`site_settings\`
      SET \`active_decoration_pack_id\` = (
        SELECT \`active_decoration_pack_id\` FROM \`frontpage\`
        WHERE \`active_decoration_pack_id\` IS NOT NULL
        LIMIT 1
      )
      WHERE \`active_decoration_pack_id\` IS NULL;
    `)
  }

  // Fallback: first decoration pack if still null
  await db.run(sql`
    UPDATE \`site_settings\`
    SET \`active_decoration_pack_id\` = (
      SELECT \`id\` FROM \`decoration_packs\` ORDER BY \`id\` ASC LIMIT 1
    )
    WHERE \`active_decoration_pack_id\` IS NULL;
  `)

  if (siteColumns.has('contact_phone')) {
    await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`contact_phone\`;`)
  }
  for (const column of [
    'profile_stats_posts',
    'profile_stats_followers',
    'profile_stats_following',
  ]) {
    if (siteColumns.has(column)) {
      await db.run(sql.raw(`ALTER TABLE \`site_settings\` DROP COLUMN \`${column}\`;`))
    }
  }

  const siteLocaleColumns = await columnNames(db, 'site_settings_locales')
  if (siteLocaleColumns.has('location')) {
    await db.run(sql`ALTER TABLE \`site_settings_locales\` DROP COLUMN \`location\`;`)
  }
  if (siteLocaleColumns.has('profile_bio') && !siteLocaleColumns.has('bio')) {
    await db.run(sql`ALTER TABLE \`site_settings_locales\` ADD \`bio\` text;`)
    await db.run(sql`UPDATE \`site_settings_locales\` SET \`bio\` = \`profile_bio\`;`)
    await db.run(sql`ALTER TABLE \`site_settings_locales\` DROP COLUMN \`profile_bio\`;`)
  } else if (siteLocaleColumns.has('profile_bio')) {
    await db.run(sql`ALTER TABLE \`site_settings_locales\` DROP COLUMN \`profile_bio\`;`)
  }
  if (!siteLocaleColumns.has('footer_text') && !siteLocaleColumns.has('copyright')) {
    // add both if missing
  }
  const refreshedLocaleColumns = await columnNames(db, 'site_settings_locales')
  if (!refreshedLocaleColumns.has('footer_text')) {
    await db.run(sql`ALTER TABLE \`site_settings_locales\` ADD \`footer_text\` text;`)
  }
  if (!refreshedLocaleColumns.has('copyright')) {
    await db.run(sql`ALTER TABLE \`site_settings_locales\` ADD \`copyright\` text;`)
  }

  if (await tableExists(db, 'footer_locales')) {
    await db.run(sql`
      UPDATE \`site_settings_locales\`
      SET
        \`footer_text\` = COALESCE(\`footer_text\`, (
          SELECT fl.\`text\` FROM \`footer_locales\` fl WHERE fl.\`_locale\` = \`site_settings_locales\`.\`_locale\` LIMIT 1
        )),
        \`copyright\` = COALESCE(\`copyright\`, (
          SELECT fl.\`copyright\` FROM \`footer_locales\` fl WHERE fl.\`_locale\` = \`site_settings_locales\`.\`_locale\` LIMIT 1
        ));
    `)
  }

  // Version tables: mirror non-destructive adds + drops
  if (await tableExists(db, '_site_settings_v')) {
    const versionSiteColumns = await columnNames(db, '_site_settings_v')
    if (!versionSiteColumns.has('version_cover_image_id')) {
      await db.run(
        sql`ALTER TABLE \`_site_settings_v\` ADD \`version_cover_image_id\` integer REFERENCES media(id);`,
      )
    }
    if (!versionSiteColumns.has('version_active_decoration_pack_id')) {
      await db.run(
        sql`ALTER TABLE \`_site_settings_v\` ADD \`version_active_decoration_pack_id\` integer REFERENCES decoration_packs(id);`,
      )
    }
    if (versionSiteColumns.has('version_contact_phone')) {
      await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_contact_phone\`;`)
    }
    for (const column of [
      'version_profile_stats_posts',
      'version_profile_stats_followers',
      'version_profile_stats_following',
    ]) {
      if (versionSiteColumns.has(column)) {
        await db.run(sql.raw(`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`${column}\`;`))
      }
    }
  }

  if (await tableExists(db, '_site_settings_v_locales')) {
    const versionLocaleColumns = await columnNames(db, '_site_settings_v_locales')
    if (versionLocaleColumns.has('version_location')) {
      await db.run(sql`ALTER TABLE \`_site_settings_v_locales\` DROP COLUMN \`version_location\`;`)
    }
    if (versionLocaleColumns.has('version_profile_bio') && !versionLocaleColumns.has('version_bio')) {
      await db.run(sql`ALTER TABLE \`_site_settings_v_locales\` ADD \`version_bio\` text;`)
      await db.run(
        sql`UPDATE \`_site_settings_v_locales\` SET \`version_bio\` = \`version_profile_bio\`;`,
      )
      await db.run(
        sql`ALTER TABLE \`_site_settings_v_locales\` DROP COLUMN \`version_profile_bio\`;`,
      )
    } else if (versionLocaleColumns.has('version_profile_bio')) {
      await db.run(
        sql`ALTER TABLE \`_site_settings_v_locales\` DROP COLUMN \`version_profile_bio\`;`,
      )
    }
    const refreshed = await columnNames(db, '_site_settings_v_locales')
    if (!refreshed.has('version_footer_text')) {
      await db.run(sql`ALTER TABLE \`_site_settings_v_locales\` ADD \`version_footer_text\` text;`)
    }
    if (!refreshed.has('version_copyright')) {
      await db.run(sql`ALTER TABLE \`_site_settings_v_locales\` ADD \`version_copyright\` text;`)
    }
  }

  // ---------------------------------------------------------------------------
  // 3) Links array: rename profile_links → links; merge social URLs (deduped)
  // ---------------------------------------------------------------------------
  if (
    (await tableExists(db, 'site_settings_profile_links')) &&
    !(await tableExists(db, 'site_settings_links'))
  ) {
    await db.run(sql`ALTER TABLE \`site_settings_profile_links\` RENAME TO \`site_settings_links\`;`)
    await db.run(
      sql`ALTER TABLE \`site_settings_profile_links_locales\` RENAME TO \`site_settings_links_locales\`;`,
    )
  }

  if (
    (await tableExists(db, '_site_settings_v_version_profile_links')) &&
    !(await tableExists(db, '_site_settings_v_version_links'))
  ) {
    await db.run(
      sql`ALTER TABLE \`_site_settings_v_version_profile_links\` RENAME TO \`_site_settings_v_version_links\`;`,
    )
    await db.run(
      sql`ALTER TABLE \`_site_settings_v_version_profile_links_locales\` RENAME TO \`_site_settings_v_version_links_locales\`;`,
    )
  }

  // Ensure links tables exist even if profile_links never did
  if (!(await tableExists(db, 'site_settings_links'))) {
    await db.run(sql`CREATE TABLE \`site_settings_links\` (
    	\`_order\` integer NOT NULL,
    	\`_parent_id\` integer NOT NULL,
    	\`id\` text PRIMARY KEY NOT NULL,
    	\`link_type\` text DEFAULT 'internal' NOT NULL,
    	\`page_id\` integer,
    	\`url\` text,
    	\`new_tab\` integer DEFAULT false,
    	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(sql`CREATE INDEX \`site_settings_links_order_idx\` ON \`site_settings_links\` (\`_order\`);`)
    await db.run(
      sql`CREATE INDEX \`site_settings_links_parent_id_idx\` ON \`site_settings_links\` (\`_parent_id\`);`,
    )
    await db.run(sql`CREATE INDEX \`site_settings_links_page_idx\` ON \`site_settings_links\` (\`page_id\`);`)
    await db.run(sql`CREATE TABLE \`site_settings_links_locales\` (
    	\`label\` text NOT NULL,
    	\`id\` integer PRIMARY KEY NOT NULL,
    	\`_locale\` text NOT NULL,
    	\`_parent_id\` text NOT NULL,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE UNIQUE INDEX \`site_settings_links_locales_locale_parent_id_unique\` ON \`site_settings_links_locales\` (\`_locale\`,\`_parent_id\`);`,
    )
  }

  const siteParentRows = extractRows<{ id: number }>(
    await db.run(sql`SELECT \`id\` FROM \`site_settings\` ORDER BY \`id\` ASC LIMIT 1;`),
  )
  const siteParentId = siteParentRows[0]?.id

  if (siteParentId != null) {
    const existingUrls = new Set(
      extractRows<{ url: string | null }>(
        await db.run(
          sql`SELECT \`url\` FROM \`site_settings_links\` WHERE \`url\` IS NOT NULL;`,
        ),
      )
        .map((row) => (typeof row.url === 'string' ? row.url : ''))
        .filter(Boolean),
    )

    const orderRows = extractRows<{ maxOrder: number | null }>(
      await db.run(
        sql.raw(
          `SELECT MAX(_order) as maxOrder FROM site_settings_links WHERE _parent_id = ${siteParentId};`,
        ),
      ),
    )
    let nextOrder = (orderRows[0]?.maxOrder ?? -1) + 1

    type SocialRow = {
      id: string
      platform: string
      url: string
      label?: string | null
      locale?: string | null
    }

    const socialSources: Array<{ table: string; locales: string }> = []
    if (await tableExists(db, 'site_settings_social_links')) {
      socialSources.push({
        table: 'site_settings_social_links',
        locales: 'site_settings_social_links_locales',
      })
    }
    if (await tableExists(db, 'footer_social_links')) {
      socialSources.push({
        table: 'footer_social_links',
        locales: 'footer_social_links_locales',
      })
    }

    for (const source of socialSources) {
      const links = extractRows<SocialRow>(
        await db.run(
          sql.raw(
            `SELECT l.id, l.platform, l.url, loc.label, loc._locale as locale
             FROM ${source.table} l
             LEFT JOIN ${source.locales} loc ON loc._parent_id = l.id
             ORDER BY l._order ASC, loc._locale ASC`,
          ),
        ),
      )

      const byId = new Map<string, { url: string; platform: string; labels: Record<string, string> }>()
      for (const row of links) {
        if (!row.url || existingUrls.has(row.url)) continue
        const current = byId.get(row.id) || {
          url: row.url,
          platform: row.platform,
          labels: {},
        }
        if (row.locale) {
          current.labels[row.locale] = platformLabel(row.platform, row.label)
        }
        byId.set(row.id, current)
      }

      for (const [oldId, link] of byId) {
        if (existingUrls.has(link.url)) continue
        const newId = `migrated-link-${oldId}`
        await db.run(
          sql.raw(
            `INSERT INTO site_settings_links (_order, _parent_id, id, link_type, page_id, url, new_tab)
             VALUES (${nextOrder}, ${siteParentId}, '${escapeSql(newId)}', 'external', NULL, '${escapeSql(link.url)}', 1)`,
          ),
        )
        for (const locale of ['en', 'vi'] as const) {
          const label = link.labels[locale] || link.labels.en || platformLabel(link.platform, null)
          await db.run(
            sql.raw(
              `INSERT INTO site_settings_links_locales (label, _locale, _parent_id)
               VALUES ('${escapeSql(label)}', '${locale}', '${escapeSql(newId)}')`,
            ),
          )
        }
        existingUrls.add(link.url)
        nextOrder += 1
      }
    }
  }

  await db.run(sql`DROP TABLE IF EXISTS \`site_settings_social_links_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`site_settings_social_links\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_site_settings_v_version_social_links_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_site_settings_v_version_social_links\`;`)

  // ---------------------------------------------------------------------------
  // 4) Navigation → site_settings.navigation (+ children)
  // ---------------------------------------------------------------------------
  if (!(await tableExists(db, 'site_settings_navigation'))) {
    await db.run(sql`CREATE TABLE \`site_settings_navigation\` (
    	\`_order\` integer NOT NULL,
    	\`_parent_id\` integer NOT NULL,
    	\`id\` text PRIMARY KEY NOT NULL,
    	\`link_type\` text DEFAULT 'internal' NOT NULL,
    	\`page_id\` integer,
    	\`url\` text,
    	\`new_tab\` integer DEFAULT false,
    	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE INDEX \`site_settings_navigation_order_idx\` ON \`site_settings_navigation\` (\`_order\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`site_settings_navigation_parent_id_idx\` ON \`site_settings_navigation\` (\`_parent_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`site_settings_navigation_page_idx\` ON \`site_settings_navigation\` (\`page_id\`);`,
    )
    await db.run(sql`CREATE TABLE \`site_settings_navigation_locales\` (
    	\`label\` text NOT NULL,
    	\`id\` integer PRIMARY KEY NOT NULL,
    	\`_locale\` text NOT NULL,
    	\`_parent_id\` text NOT NULL,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE UNIQUE INDEX \`site_settings_navigation_locales_locale_parent_id_unique\` ON \`site_settings_navigation_locales\` (\`_locale\`,\`_parent_id\`);`,
    )

    await db.run(sql`CREATE TABLE \`site_settings_navigation_children\` (
    	\`_order\` integer NOT NULL,
    	\`_parent_id\` text NOT NULL,
    	\`id\` text PRIMARY KEY NOT NULL,
    	\`link_type\` text DEFAULT 'internal' NOT NULL,
    	\`page_id\` integer,
    	\`url\` text,
    	\`new_tab\` integer DEFAULT false,
    	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE INDEX \`site_settings_navigation_children_order_idx\` ON \`site_settings_navigation_children\` (\`_order\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`site_settings_navigation_children_parent_id_idx\` ON \`site_settings_navigation_children\` (\`_parent_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`site_settings_navigation_children_page_idx\` ON \`site_settings_navigation_children\` (\`page_id\`);`,
    )
    await db.run(sql`CREATE TABLE \`site_settings_navigation_children_locales\` (
    	\`label\` text NOT NULL,
    	\`id\` integer PRIMARY KEY NOT NULL,
    	\`_locale\` text NOT NULL,
    	\`_parent_id\` text NOT NULL,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_navigation_children\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE UNIQUE INDEX \`site_settings_navigation_children_locales_locale_parent_id_unique\` ON \`site_settings_navigation_children_locales\` (\`_locale\`,\`_parent_id\`);`,
    )

    if (siteParentId != null && (await tableExists(db, 'navigation_items'))) {
      await db.run(
        sql.raw(`
          INSERT INTO site_settings_navigation (_order, _parent_id, id, link_type, page_id, url, new_tab)
          SELECT _order, ${siteParentId}, id, link_type, page_id, url, new_tab FROM navigation_items;
        `),
      )
      await db.run(sql`
        INSERT INTO \`site_settings_navigation_locales\`("label", "id", "_locale", "_parent_id")
        SELECT "label", "id", "_locale", "_parent_id" FROM \`navigation_items_locales\`;
      `)
      await db.run(sql`
        INSERT INTO \`site_settings_navigation_children\`("_order", "_parent_id", "id", "link_type", "page_id", "url", "new_tab")
        SELECT "_order", "_parent_id", "id", "link_type", "page_id", "url", "new_tab" FROM \`navigation_items_children\`;
      `)
      await db.run(sql`
        INSERT INTO \`site_settings_navigation_children_locales\`("label", "id", "_locale", "_parent_id")
        SELECT "label", "id", "_locale", "_parent_id" FROM \`navigation_items_children_locales\`;
      `)
    }
  }

  // ---------------------------------------------------------------------------
  // 5) Footer groups + legal links → site_settings
  // ---------------------------------------------------------------------------
  if (!(await tableExists(db, 'site_settings_footer_groups'))) {
    await db.run(sql`CREATE TABLE \`site_settings_footer_groups\` (
    	\`_order\` integer NOT NULL,
    	\`_parent_id\` integer NOT NULL,
    	\`id\` text PRIMARY KEY NOT NULL,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE INDEX \`site_settings_footer_groups_order_idx\` ON \`site_settings_footer_groups\` (\`_order\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`site_settings_footer_groups_parent_id_idx\` ON \`site_settings_footer_groups\` (\`_parent_id\`);`,
    )
    await db.run(sql`CREATE TABLE \`site_settings_footer_groups_locales\` (
    	\`title\` text NOT NULL,
    	\`id\` integer PRIMARY KEY NOT NULL,
    	\`_locale\` text NOT NULL,
    	\`_parent_id\` text NOT NULL,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_footer_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE UNIQUE INDEX \`site_settings_footer_groups_locales_locale_parent_id_unique\` ON \`site_settings_footer_groups_locales\` (\`_locale\`,\`_parent_id\`);`,
    )
    await db.run(sql`CREATE TABLE \`site_settings_footer_groups_links\` (
    	\`_order\` integer NOT NULL,
    	\`_parent_id\` text NOT NULL,
    	\`id\` text PRIMARY KEY NOT NULL,
    	\`link_type\` text DEFAULT 'internal' NOT NULL,
    	\`page_id\` integer,
    	\`url\` text,
    	\`new_tab\` integer DEFAULT false,
    	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_footer_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE INDEX \`site_settings_footer_groups_links_order_idx\` ON \`site_settings_footer_groups_links\` (\`_order\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`site_settings_footer_groups_links_parent_id_idx\` ON \`site_settings_footer_groups_links\` (\`_parent_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`site_settings_footer_groups_links_page_idx\` ON \`site_settings_footer_groups_links\` (\`page_id\`);`,
    )
    await db.run(sql`CREATE TABLE \`site_settings_footer_groups_links_locales\` (
    	\`label\` text NOT NULL,
    	\`id\` integer PRIMARY KEY NOT NULL,
    	\`_locale\` text NOT NULL,
    	\`_parent_id\` text NOT NULL,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_footer_groups_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE UNIQUE INDEX \`site_settings_footer_groups_links_locales_locale_parent_id_unique\` ON \`site_settings_footer_groups_links_locales\` (\`_locale\`,\`_parent_id\`);`,
    )

    if (siteParentId != null && (await tableExists(db, 'footer_groups'))) {
      await db.run(
        sql.raw(`
          INSERT INTO site_settings_footer_groups (_order, _parent_id, id)
          SELECT _order, ${siteParentId}, id FROM footer_groups;
        `),
      )
      await db.run(sql`
        INSERT INTO \`site_settings_footer_groups_locales\`("title", "id", "_locale", "_parent_id")
        SELECT "title", "id", "_locale", "_parent_id" FROM \`footer_groups_locales\`;
      `)
      await db.run(sql`
        INSERT INTO \`site_settings_footer_groups_links\`("_order", "_parent_id", "id", "link_type", "page_id", "url", "new_tab")
        SELECT "_order", "_parent_id", "id", "link_type", "page_id", "url", "new_tab" FROM \`footer_groups_links\`;
      `)
      await db.run(sql`
        INSERT INTO \`site_settings_footer_groups_links_locales\`("label", "id", "_locale", "_parent_id")
        SELECT "label", "id", "_locale", "_parent_id" FROM \`footer_groups_links_locales\`;
      `)
    }
  }

  if (!(await tableExists(db, 'site_settings_legal_links'))) {
    await db.run(sql`CREATE TABLE \`site_settings_legal_links\` (
    	\`_order\` integer NOT NULL,
    	\`_parent_id\` integer NOT NULL,
    	\`id\` text PRIMARY KEY NOT NULL,
    	\`link_type\` text DEFAULT 'internal' NOT NULL,
    	\`page_id\` integer,
    	\`url\` text,
    	\`new_tab\` integer DEFAULT false,
    	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE INDEX \`site_settings_legal_links_order_idx\` ON \`site_settings_legal_links\` (\`_order\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`site_settings_legal_links_parent_id_idx\` ON \`site_settings_legal_links\` (\`_parent_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`site_settings_legal_links_page_idx\` ON \`site_settings_legal_links\` (\`page_id\`);`,
    )
    await db.run(sql`CREATE TABLE \`site_settings_legal_links_locales\` (
    	\`label\` text NOT NULL,
    	\`id\` integer PRIMARY KEY NOT NULL,
    	\`_locale\` text NOT NULL,
    	\`_parent_id\` text NOT NULL,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_legal_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(
      sql`CREATE UNIQUE INDEX \`site_settings_legal_links_locales_locale_parent_id_unique\` ON \`site_settings_legal_links_locales\` (\`_locale\`,\`_parent_id\`);`,
    )

    if (siteParentId != null && (await tableExists(db, 'footer_legal_links'))) {
      await db.run(
        sql.raw(`
          INSERT INTO site_settings_legal_links (_order, _parent_id, id, link_type, page_id, url, new_tab)
          SELECT _order, ${siteParentId}, id, link_type, page_id, url, new_tab FROM footer_legal_links;
        `),
      )
      await db.run(sql`
        INSERT INTO \`site_settings_legal_links_locales\`("label", "id", "_locale", "_parent_id")
        SELECT "label", "id", "_locale", "_parent_id" FROM \`footer_legal_links_locales\`;
      `)
    }
  }

  // Version array tables for new site-settings arrays (empty; history not migrated)
  if (await tableExists(db, '_site_settings_v')) {
    if (!(await tableExists(db, '_site_settings_v_version_navigation'))) {
      await db.run(sql`CREATE TABLE \`_site_settings_v_version_navigation\` (
      	\`_order\` integer NOT NULL,
      	\`_parent_id\` integer NOT NULL,
      	\`id\` integer PRIMARY KEY NOT NULL,
      	\`link_type\` text DEFAULT 'internal' NOT NULL,
      	\`page_id\` integer,
      	\`url\` text,
      	\`new_tab\` integer DEFAULT false,
      	\`_uuid\` text,
      	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
      	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
      );`)
      await db.run(sql`CREATE TABLE \`_site_settings_v_version_navigation_locales\` (
      	\`label\` text NOT NULL,
      	\`id\` integer PRIMARY KEY NOT NULL,
      	\`_locale\` text NOT NULL,
      	\`_parent_id\` integer NOT NULL,
      	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v_version_navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
      );`)
      await db.run(sql`CREATE TABLE \`_site_settings_v_version_navigation_children\` (
      	\`_order\` integer NOT NULL,
      	\`_parent_id\` integer NOT NULL,
      	\`id\` integer PRIMARY KEY NOT NULL,
      	\`link_type\` text DEFAULT 'internal' NOT NULL,
      	\`page_id\` integer,
      	\`url\` text,
      	\`new_tab\` integer DEFAULT false,
      	\`_uuid\` text,
      	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
      	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v_version_navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
      );`)
      await db.run(sql`CREATE TABLE \`_site_settings_v_version_navigation_children_locales\` (
      	\`label\` text NOT NULL,
      	\`id\` integer PRIMARY KEY NOT NULL,
      	\`_locale\` text NOT NULL,
      	\`_parent_id\` integer NOT NULL,
      	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v_version_navigation_children\`(\`id\`) ON UPDATE no action ON DELETE cascade
      );`)
    }

    if (!(await tableExists(db, '_site_settings_v_version_footer_groups'))) {
      await db.run(sql`CREATE TABLE \`_site_settings_v_version_footer_groups\` (
      	\`_order\` integer NOT NULL,
      	\`_parent_id\` integer NOT NULL,
      	\`id\` integer PRIMARY KEY NOT NULL,
      	\`_uuid\` text,
      	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
      );`)
      await db.run(sql`CREATE TABLE \`_site_settings_v_version_footer_groups_locales\` (
      	\`title\` text NOT NULL,
      	\`id\` integer PRIMARY KEY NOT NULL,
      	\`_locale\` text NOT NULL,
      	\`_parent_id\` integer NOT NULL,
      	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v_version_footer_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
      );`)
      await db.run(sql`CREATE TABLE \`_site_settings_v_version_footer_groups_links\` (
      	\`_order\` integer NOT NULL,
      	\`_parent_id\` integer NOT NULL,
      	\`id\` integer PRIMARY KEY NOT NULL,
      	\`link_type\` text DEFAULT 'internal' NOT NULL,
      	\`page_id\` integer,
      	\`url\` text,
      	\`new_tab\` integer DEFAULT false,
      	\`_uuid\` text,
      	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
      	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v_version_footer_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
      );`)
      await db.run(sql`CREATE TABLE \`_site_settings_v_version_footer_groups_links_locales\` (
      	\`label\` text NOT NULL,
      	\`id\` integer PRIMARY KEY NOT NULL,
      	\`_locale\` text NOT NULL,
      	\`_parent_id\` integer NOT NULL,
      	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v_version_footer_groups_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
      );`)
    }

    if (!(await tableExists(db, '_site_settings_v_version_legal_links'))) {
      await db.run(sql`CREATE TABLE \`_site_settings_v_version_legal_links\` (
      	\`_order\` integer NOT NULL,
      	\`_parent_id\` integer NOT NULL,
      	\`id\` integer PRIMARY KEY NOT NULL,
      	\`link_type\` text DEFAULT 'internal' NOT NULL,
      	\`page_id\` integer,
      	\`url\` text,
      	\`new_tab\` integer DEFAULT false,
      	\`_uuid\` text,
      	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
      	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
      );`)
      await db.run(sql`CREATE TABLE \`_site_settings_v_version_legal_links_locales\` (
      	\`label\` text NOT NULL,
      	\`id\` integer PRIMARY KEY NOT NULL,
      	\`_locale\` text NOT NULL,
      	\`_parent_id\` integer NOT NULL,
      	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v_version_legal_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
      );`)
    }
  }

  // ---------------------------------------------------------------------------
  // 6) Drop old globals
  // ---------------------------------------------------------------------------
  const dropTables = [
    'navigation_items_children_locales',
    'navigation_items_children',
    'navigation_items_locales',
    'navigation_items',
    '_navigation_v_version_items_children_locales',
    '_navigation_v_version_items_children',
    '_navigation_v_version_items_locales',
    '_navigation_v_version_items',
    '_navigation_v',
    'navigation',
    'footer_groups_links_locales',
    'footer_groups_links',
    'footer_groups_locales',
    'footer_groups',
    'footer_social_links_locales',
    'footer_social_links',
    'footer_legal_links_locales',
    'footer_legal_links',
    'footer_locales',
    '_footer_v_version_groups_links_locales',
    '_footer_v_version_groups_links',
    '_footer_v_version_groups_locales',
    '_footer_v_version_groups',
    '_footer_v_version_social_links_locales',
    '_footer_v_version_social_links',
    '_footer_v_version_legal_links_locales',
    '_footer_v_version_legal_links',
    '_footer_v_locales',
    '_footer_v',
    'footer',
    'frontpage_rels',
    '_frontpage_v_rels',
    '_frontpage_v',
    'frontpage',
  ]

  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  for (const table of dropTables) {
    if (await tableExists(db, table)) {
      await db.run(sql.raw(`DROP TABLE \`${table}\`;`))
    }
  }
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Irreversible: content merged into site-settings cannot be fully restored.
  void db
}
