# Graph Report - tmcs  (2026-08-22)

## Corpus Check
- Large corpus: 350 files · ~778,292 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2913 nodes · 4365 edges · 245 communities (94 shown, 151 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 227 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151
- Community 152
- Community 153
- Community 154
- Community 155
- Community 156
- Community 157
- Community 158
- Community 159
- Community 160
- Community 161
- Community 162
- Community 163
- Community 164
- Community 165
- Community 166
- Community 167
- Community 168
- Community 169
- Community 170
- Community 171
- Community 172
- Community 173
- Community 174
- Community 175
- Community 176
- Community 177
- Community 178
- Community 179
- Community 180
- Community 181
- Community 182
- Community 183
- Community 184
- Community 185
- Community 186
- Community 187
- Community 188
- Community 189
- Community 190
- Community 191
- Community 192
- Community 193
- Community 194
- Community 195
- Community 196
- Community 197
- Community 198
- Community 199
- Community 200
- Community 201
- Community 202
- Community 203
- Community 204
- Community 205
- Community 206
- Community 207
- Community 208
- Community 209
- Community 210
- Community 211
- Community 212
- Community 214
- Community 215
- Community 217
- Community 218
- Community 219
- Community 220
- Community 221
- Community 222
- Community 223
- Community 224
- Community 225
- Community 226
- Community 227
- Community 228
- Community 229
- Community 230
- Community 231
- Community 232
- Community 233
- Community 238
- Community 239
- Community 240
- Community 241

## God Nodes (most connected - your core abstractions)
1. `cn()` - 75 edges
2. `scripts` - 27 edges
3. `getSiteShell` - 27 edges
4. `LocaleCode` - 26 edges
5. `Event` - 25 edges
6. `Console` - 21 edges
7. `React Best Practices AGENTS.md` - 21 edges
8. `compilerOptions` - 18 edges
9. `next-cache-components-adoption` - 18 edges
10. `asUser()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Vertical 9:16 portrait WebP (3384x6016, 97KB)` --semantically_similar_to--> `Vertical aspect ratios in video feed card (TikTok/Instagram 3:4)`  [INFERRED] [semantically similar]
  src/assets/images/purple_9x16.webp → src/app/(frontend)/_components/feed/video-feed-card.tsx
- `Dune 9x16 WebP Image` --conceptually_related_to--> `NEW_IMAGE_FILES`  [INFERRED]
  src/assets/images/dune_9x16.webp → src/scripts/seed.ts
- `leaf_4x3.webp as seed media #11 (stable alphabetical index 10)` --rationale_for--> `NEW_IMAGE_FILES`  [INFERRED]
  src/assets/images/leaf_4x3.webp → src/scripts/seed.ts
- `wave_7x5 decorative image asset` --shares_data_with--> `NEW_IMAGE_FILES`  [INFERRED]
  src/assets/images/wave_7x5.webp → src/scripts/seed.ts
- `NEW_IMAGE_FILES` --references--> `Seed media upload loop`  [EXTRACTED]
  src/scripts/seed.ts → src/assets/images/leaf_5x4.webp

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **TMCS Scheduled Publishing Chain** — readme_scheduled_publishing_flow, agents_scheduled_publishing_rule, docs_frontend_cms_contract_jobs_access [EXTRACTED 1.00]
- **TMCS Schema Change Workflows (big + small)** — agents_big_schema_change_workflow, agents_small_schema_change_workflow, readme_schema_change_workflow, agents_slug_reservations_preserved [EXTRACTED 1.00]
- **graphify Skill Subsystem (skill + 7 references)** — agents_skills_graphify_skill, agents_skills_graphify_references_extraction_spec, agents_skills_graphify_references_add_watch, agents_skills_graphify_references_exports, agents_skills_graphify_references_github_and_merge, agents_skills_graphify_references_hooks, agents_skills_graphify_references_query, agents_skills_graphify_references_transcribe, agents_skills_graphify_references_update [EXTRACTED 1.00]
- **Payload Security Pitfalls Triad** — agents_skills_payload_skill_local_api_bypass, agents_skills_payload_skill_transaction_atomicity, agents_skills_payload_skill_hook_loop_pattern [EXTRACTED 1.00]
- **Access Control Three Layers** — agents_skills_payload_reference_access_control_three_layers, agents_skills_payload_reference_access_control, agents_skills_payload_reference_access_control_advanced [EXTRACTED 1.00]
- **Payload Field Type Ecosystem** — agents_skills_payload_reference_fields, agents_skills_payload_reference_field_type_guards, agents_skills_payload_reference_structural_guards, agents_skills_payload_reference_capability_guards, agents_skills_payload_reference_data_guards [EXTRACTED 1.00]
- **Payload collection hook lifecycle (beforeValidate -> beforeChange -> afterChange -> afterRead)** — dot_agents_skills_payload_reference_HOOKS_collection_hooks, dot_agents_skills_payload_reference_HOOKS_context_sharing, dot_agents_skills_payload_reference_HOOKS_revalidate_page, dot_agents_skills_payload_reference_HOOKS_published_on_auto_set, dot_agents_skills_payload_reference_HOOKS_rationale_patterns [INFERRED 0.85]
- **Payload query surface (Local + REST + GraphQL sharing the Where filter language)** — dot_agents_skills_payload_reference_QUERIES_where_operators, dot_agents_skills_payload_reference_QUERIES_and_or, dot_agents_skills_payload_reference_QUERIES_local_api, dot_agents_skills_payload_reference_QUERIES_rest_endpoints, dot_agents_skills_payload_reference_QUERIES_graphql_examples [INFERRED 0.85]
- **Payload field type system (data fields, layout fields, virtual fields, type guards)** — dot_agents_skills_payload_reference_FIELDS_text, dot_agents_skills_payload_reference_FIELDS_relationship, dot_agents_skills_payload_reference_FIELDS_array, dot_agents_skills_payload_reference_FIELDS_blocks, dot_agents_skills_payload_reference_FIELDS_upload, dot_agents_skills_payload_reference_FIELDS_virtual, dot_agents_skills_payload_reference_FIELDS_layout, dot_agents_skills_payload_reference_FIELDS_type_guards [INFERRED 0.85]
- **Composition patterns state-management cluster** — vercel_composition_patterns_concept_decouple_state_from_ui, vercel_composition_patterns_concept_generic_context_interface, vercel_composition_patterns_concept_lift_state_into_providers, vercel_composition_patterns_section_state_management [EXTRACTED 0.95]
- **Async/waterfall elimination cluster** — vercel_react_best_practices_section_async, vercel_react_best_practices_concept_promise_all_independent, vercel_react_best_practices_concept_dependency_based_parallelization, vercel_react_best_practices_concept_prevent_waterfall_chains_api_routes, vercel_react_best_practices_concept_parallel_data_fetching_composition, vercel_react_best_practices_concept_parallel_nested_data_fetching [EXTRACTED 0.95]
- **React 19 modern APIs cluster** — vercel_composition_patterns_concept_react19_apis, vercel_react_best_practices_concept_useeffectevent_stable_callback_refs, vercel_react_best_practices_concept_use_activity_component, vercel_react_best_practices_concept_use_usetransition_over_loading [INFERRED 0.85]
- **JavaScript hot-path optimization principles** — agents_skills_vercel_react_best_practices_rules_js_cache_property_access_cachepropertyaccessinloops, agents_skills_vercel_react_best_practices_rules_js_cache_storage_cachestorageapicalls, agents_skills_vercel_react_best_practices_rules_js_combine_iterations_combinemultiplearrayiterations, agents_skills_vercel_react_best_practices_rules_js_set_map_lookups_usesetmapforo1lookups, agents_skills_vercel_react_best_practices_rules_js_min_max_loop_useloopforminmaxinsteadofsort [INFERRED 0.85]
- **SSR hydration safety patterns** — agents_skills_vercel_react_best_practices_rules_rendering_hydration_no_flicker_preventhydrationmismatchwithoutflickering, agents_skills_vercel_react_best_practices_rules_rendering_hydration_suppress_warning_suppressexpectedhydrationmismatches, agents_skills_vercel_react_best_practices_rules_rendering_conditional_render_useexplicitconditionalrendering [INFERRED 0.75]
- **Browser-side resource loading hints** — agents_skills_vercel_react_best_practices_rules_rendering_script_defer_async_usedeferorasynconscripttags, agents_skills_vercel_react_best_practices_rules_rendering_resource_hints_usereactdomresourcehints [INFERRED 0.85]
- **Async Waterfall Elimination Cluster** — agents_skills_vercel_react_best_practices_rules_async_parallel, agents_skills_vercel_react_best_practices_rules_async_api_routes, agents_skills_vercel_react_best_practices_rules_async_dependencies, agents_skills_vercel_react_best_practices_rules_async_defer_await, agents_skills_vercel_react_best_practices_rules_server_parallel_fetching, agents_skills_vercel_react_best_practices_rules_server_parallel_nested_fetching [INFERRED 0.85]
- **Server Caching Strategies Cluster** — agents_skills_vercel_react_best_practices_rules_server_cache_react, agents_skills_vercel_react_best_practices_rules_server_cache_lru, agents_skills_vercel_react_best_practices_rules_server_hoist_static_io, agents_skills_vercel_react_best_practices_rules_server_no_shared_module_state [INFERRED 0.85]
- **Bundle Size Optimization Cluster** — agents_skills_vercel_react_best_practices_rules_bundle_barrel_imports, agents_skills_vercel_react_best_practices_rules_bundle_conditional, agents_skills_vercel_react_best_practices_rules_bundle_defer_third_party, agents_skills_vercel_react_best_practices_rules_bundle_dynamic_imports, agents_skills_vercel_react_best_practices_rules_bundle_preload, agents_skills_vercel_react_best_practices_rules_bundle_analyzable_paths [INFERRED 0.85]
- **Section 5 Re-render Optimization** — vercel_react_best_practices_rules_rerender_derived_state, vercel_react_best_practices_rules_rerender_defer_reads, vercel_react_best_practices_rules_rerender_simple_expression_in_memo, vercel_react_best_practices_rules_rerender_no_inline_components, vercel_react_best_practices_rules_rerender_memo, vercel_react_best_practices_rules_rerender_dependencies, vercel_react_best_practices_rules_rerender_move_effect_to_event, vercel_react_best_practices_rules_rerender_split_combined_hooks, vercel_react_best_practices_rules_rerender_derived_state_no_effect, vercel_react_best_practices_rules_rerender_functional_setstate, vercel_react_best_practices_rules_rerender_lazy_state_init, vercel_react_best_practices_rules_rerender_transitions, vercel_react_best_practices_rules_rerender_use_deferred_value, vercel_react_best_practices_rules_rerender_use_ref_transient_values [EXTRACTED 1.00]
- **ViewTransition triggers (enter/exit/update/share)** — agents_skills_vercel_react_view_transitions_skill_viewtransition_component, agents_skills_vercel_react_view_transitions_skill_shared_element_transition, agents_skills_vercel_react_view_transitions_skill_addtransitiontype, agents_skills_vercel_react_view_transitions_skill_default_none_pattern [EXTRACTED 1.00]
- **Cache Components three blocker classes** — agents_skills_next_cache_components_adoption_skill_blocking_prerender, agents_skills_next_cache_components_adoption_skill_three_blocker_classes, agents_skills_next_cache_components_adoption_skill_use_cache_directive, agents_skills_next_cache_components_adoption_skill_suspense_boundary_placement [EXTRACTED 1.00]
- **Cache Components adoption artifacts** — agents_skills_next_cache_components_adoption_skill_incremental_vs_direct_strategy, agents_skills_next_cache_components_adoption_skill_cache_components_instant_false_codemod, agents_skills_next_cache_components_adoption_skill_top_down_walk, agents_skills_next_cache_components_adoption_skill_next_dev_loop [EXTRACTED 1.00]
- **Seed image set entries share alphabetical aspect-ratio naming convention** — src_assets_images_beam_1x1_webp, src_assets_images_beam_1x1_webp_concept_seed_image_asset, src_scripts_seed_ts_new_image_files [INFERRED 0.85]
- **21-image seed media asset pool distributed across posts, projects, things, and videos** — src_assets_images_com_16x9_webp, src_scripts_seed_new_image_files, src_scripts_seed_mediaids, src_scripts_seed_upsertseedmedia [EXTRACTED 1.00]
- **Forest theme across three aspect ratios** — src_assets_images_forest_1x1_webp, src_assets_images_forest_2x1_webp, src_assets_images_forest_16x9_webp [INFERRED 0.85]
- **Seed media upload pipeline (NEW_IMAGE_FILES -> upsertSeedMedia -> mediaIds)** — src_scripts_seed_new_image_files, src_scripts_seed_upsertseedmedia, src_scripts_seed_mediaids, src_collections_media_collection, src_assets_images_grass_3x4_webp [EXTRACTED 1.00]
- **leaf_4x3.webp seed pipeline (asset -> NEW_IMAGE_FILES -> mediaIds loop -> upsertSeedMedia -> media collection)** — src_assets_images_leaf_4x3_webp, src_scripts_seed_new_image_files, src_scripts_seed_mediaids_loop, src_scripts_seed_upsertseedmedia [INFERRED 0.95]
- **Leaf 5x4 webp is uploaded to media collection and assigned as posts[12].featuredImage** — src_assets_images_leaf_5x4, src_scripts_seed_new_image_files, src_scripts_seed_seed_loop_media_upload, src_scripts_seed_upsert_seed_media, src_scripts_seed_post_index_12 [INFERRED 0.85]
- **Seed WebP Image Library** — src_assets_images_orange_16x9_webp, src_scripts_seed_ts [EXTRACTED 1.00]
- **Decorative WebP Image Set Seeded to CMS** — src_assets_images_orange_3x4_webp_image_asset, src_scripts_seed_ts_new_image_files, src_scripts_seed_ts_seed_script [INFERRED 0.85]
- **Purple 9:16 mood illustration + its seed registration + vertical aspect consumer** — src_assets_images_purple_9x16_webp, src_assets_images_purple_9x16_webp_scene, src_assets_images_purple_9x16_webp_palette, src_assets_images_purple_9x16_webp_format, src_scripts_seed_ts_new_image_files, src_app_frontend_components_feed_video_feed_card_tsx_vertical_aspect [INFERRED 0.75]

## Communities (245 total, 151 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.00
Nodes (612): Ai_Cf_Ai4Bharat_Indictrans2_En_Indic_1B_Input, Ai_Cf_Ai4Bharat_Indictrans2_En_Indic_1B_Output, Ai_Cf_Aisingapore_Gemma_Sea_Lion_V4_27B_It_Async_Batch, Ai_Cf_Aisingapore_Gemma_Sea_Lion_V4_27B_It_AsyncResponse, Ai_Cf_Aisingapore_Gemma_Sea_Lion_V4_27B_It_Chat_Completion_Response, Ai_Cf_Aisingapore_Gemma_Sea_Lion_V4_27B_It_Input, Ai_Cf_Aisingapore_Gemma_Sea_Lion_V4_27B_It_JSON_Mode, Ai_Cf_Aisingapore_Gemma_Sea_Lion_V4_27B_It_JSON_Mode_1 (+604 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (36): FooterBlock(), FooterBlockProps, FooterLinkListProps, getCurrentYear(), PageBlocks(), PageBlocksProps, sectionDomIds(), CmsRichText() (+28 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (26): createFeedPageShell(), FeedPage(), generateMetadata(), FeedPageShellOptions, SiteShell, FeedSection(), { Page: PostsFeedPage, generateMetadata: generatePostsFeedMetadata }, { Page: ProjectsFeedPage, generateMetadata: generateProjectsFeedMetadata } (+18 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (43): Seed decorative media (5:4 aspect), 16:9 widescreen aspect ratio (3507x1973), Payload media collection entry, Seed media asset (community/communication themed), Dune 9x16 WebP Image, Grass landscape photograph (3360x4480, 3:4, WebP), leaf_4x3.webp as seed media #11 (stable alphabetical index 10), Leaf 5x4 Seed Image (+35 more)

### Community 4 - "Community 4"
Cohesion: 0.04
Nodes (7): AbortSignal, EventSource, EventTarget, MessagePort, ServiceWorkerGlobalScope, WebSocket, WorkerGlobalScope

### Community 5 - "Community 5"
Cohesion: 0.04
Nodes (12): CloseEvent, CustomEvent, EmailEvent, ErrorEvent, Event, ExtendableEvent, FetchEvent, MessageEvent (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (42): cachedLoadDecorationPack(), getActiveFooterItemId, getFeedDecorations, getFooterDecoration, getHero, loadShortStoryTexts, toMediaView(), isFeedPaginationMode() (+34 more)

### Community 7 - "Community 7"
Cohesion: 0.04
Nodes (45): Auth, Author, AuthorsSelect, CategoriesSelect, Category, CollectionsWidget, Config, ContactSubmission (+37 more)

### Community 8 - "Community 8"
Cohesion: 0.04
Nodes (45): class-variance-authority, clsx, cross-env, dotenv, graphql, lenis, motion, ogl (+37 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (41): cachedLoadShortStories(), cachedLoadShortStoryTexts(), cachedLoadSiteSettings(), FEED_DECORATIONS_POOL_LIMIT, FEED_POOL_LIMIT, getPayloadClient, getShortStories, isFeedDecorationFile() (+33 more)

### Community 10 - "Community 10"
Cohesion: 0.06
Nodes (42): Payload CMS Collections Reference, Globals (single-instance GlobalConfig with upload + array fields), Live Preview pattern (livePreview + preview), Media Upload Collection (imageSizes, focalPoint, crop, adminThumbnail), Posts CollectionConfig (basic), Users Auth Collection (token, verify, maxLoginAttempts, useAPIKey), Versioning & Drafts (versions.drafts, autosave, schedulePublish), Payload CMS Field Types Reference (+34 more)

### Community 11 - "Community 11"
Cohesion: 0.07
Nodes (21): Icon(), Icon(), Args, instant, importMap, Args, Args, instant (+13 more)

### Community 12 - "Community 12"
Cohesion: 0.07
Nodes (38): Big Schema Change Workflow (drop DB, clear migrations except slug_reservations, regenerate, re-seed), Core Principles (simplicity, consistency, modularity, reusability, maintainability, scalability, performance), Local API overrideAccess:false with user, Localization Rules (en default + fallback, vi, _status document-level, translationReady.vi flag), Next.js Docs Requirement (read node_modules/next/dist/docs/ before coding), Payload CMS Skill Reference (.agents/skills/payload/), Project Backend Map (src/payload/config.ts, collections, globals, access, fields, hooks, blocks, components, lib, migrations, scripts, proxy, api), Scheduled Publishing Rule (no jobs.autoRun on Workers, cron -> worker.ts -> /api/cron/jobs) (+30 more)

### Community 13 - "Community 13"
Cohesion: 0.06
Nodes (31): ScrambleHoverBlock(), ScrambleHoverBlockProps, TypewriterBlock(), TypewriterBlockProps, CmsPageView, ContentGalleryBlockView, ContentMediaBlockView, FeedSectionBase (+23 more)

### Community 14 - "Community 14"
Cohesion: 0.06
Nodes (33): DOM, DOM.Iterable, ES2022, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, ./src/payload/config.ts (+25 more)

### Community 15 - "Community 15"
Cohesion: 0.11
Nodes (23): BlankSpaceBlock(), BlankSpaceBlockProps, FooterDecoration(), FeedGrid(), FeedGridProps, Error(), NavigationMenu(), NavigationMenuContent() (+15 more)

### Community 16 - "Community 16"
Cohesion: 0.10
Nodes (28): barText(), BootSplash(), consoleBarSlots(), easeOutCubic(), graphemeSegmenter, GREETINGS, STATUS, visualWidth() (+20 more)

### Community 17 - "Community 17"
Cohesion: 0.22
Nodes (25): AccessUser, adminOrManager(), approvedOrStaff(), asUser(), canCreateOwnedContent(), canDeleteOwnedContent(), canReadOwnVersions(), canUpdateOwnedContent() (+17 more)

### Community 18 - "Community 18"
Cohesion: 0.11
Nodes (17): Background(), LocaleAwareShell(), LocaleMeta(), LENIS_OPTIONS, LenisProvider(), LocaleContext, LocaleContextValue, LocaleProvider() (+9 more)

### Community 19 - "Community 19"
Cohesion: 0.07
Nodes (27): scripts, build, deploy, deploy:app, deploy:database, dev, devsafe, format (+19 more)

### Community 20 - "Community 20"
Cohesion: 0.14
Nodes (19): FeedCardDoc, FeedSectionBaseProps, FeedSectionProps, ThingsGridSection(), ThingsGridSectionProps, ViewAllFeedTile(), ViewAllFeedTileProps, GridBreakpoints (+11 more)

### Community 21 - "Community 21"
Cohesion: 0.09
Nodes (25): Vertical aspect ratios in video feed card (TikTok/Instagram 3:4), Beam 1x1 WebP Image, Seed Image Asset (square aspect, beam theme), Dune 1x2 (1080x2160 portrait WebP image asset), Dune seed photo (decorative CMS asset, portrait 1:2 aspect ratio), Forest 16:9 WebP Image Asset, Decorative Forest Photo Asset (16:9 variant), Forest 1x1 WebP Image (+17 more)

### Community 22 - "Community 22"
Cohesion: 0.11
Nodes (25): Conventional Commit Types (feat, fix, refactor, perf, test, docs, chore, build, ci, style), Conventional Commits Convention (<type>(scope): subject, <=120 chars, lowercase imperative), Commit Splitting Strategy (group by directory, generated with source, lockfile with dep, migration per file), Commit Safety Rules (no git config, no force-push, no amend, no secrets like .env/.pem), Commit Staged Files Skill, Commit Workflow (inspect, group, stage/propose/commit, verify with git status + log), graphify add (fetch URL to corpus) and --watch (auto-rebuild on file changes), graphify Exports (wiki, neo4j, falkordb, svg, graphml, mcp, benchmark) (+17 more)

### Community 23 - "Community 23"
Cohesion: 0.08
Nodes (25): babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, @playwright/test (+17 more)

### Community 24 - "Community 24"
Cohesion: 0.08
Nodes (3): TABLES, VERSION_TABLES, migrations

### Community 25 - "Community 25"
Cohesion: 0.13
Nodes (23): React Best Practices AGENTS.md, React Compiler, Do Not Put Effect Events in Dependency Arrays, Initialize App Once, Not Per Mount, Check Cheap Conditions Before Async Flags, Deduplicate Global Event Listeners, Version and Minimize localStorage Data, Use Passive Event Listeners for Scrolling (+15 more)

### Community 26 - "Community 26"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 27 - "Community 27"
Cohesion: 0.13
Nodes (16): anyone(), Authors, Categories, DecorationPacks, Links, Posts, Projects, ShortStories (+8 more)

### Community 28 - "Community 28"
Cohesion: 0.12
Nodes (18): getIsDesktopServerSnapshot(), getIsDesktopSnapshot(), HeaderNav(), HeaderNavProps, NavList(), NavListProps, subscribeDesktopMedia(), externalLinkProps() (+10 more)

### Community 29 - "Community 29"
Cohesion: 0.15
Nodes (22): toPostCard(), toProjectCard(), toThingCard(), clampLimit(), FeedCardMap, FeedPaginationMode, FeedSourceAdapter, FeedSourceMode (+14 more)

### Community 30 - "Community 30"
Cohesion: 0.14
Nodes (12): LayoutBlankSpaceBlock, ContentGalleryBlock, ContentMediaBlock, LayoutFeedSectionBlock, LayoutFooterBlock, LayoutHeroBlock, pageBlocks, LayoutRelatedItemsBlock (+4 more)

### Community 31 - "Community 31"
Cohesion: 0.15
Nodes (16): BuyNowDialog(), COPY, getPlatformIcon(), TablerIcon, BUY_LABEL, ThingShowcaseTileProps, Button(), buttonVariants (+8 more)

### Community 33 - "Community 33"
Cohesion: 0.16
Nodes (16): ContactBody, isNonEmptyString(), isValidEmail(), POST(), ContactSubmissions, CONTACT_CATEGORIES, CONTACT_CATEGORY_VALUES, ContactCategory (+8 more)

### Community 34 - "Community 34"
Cohesion: 0.16
Nodes (16): ContentMediaBlock(), ContentMediaBlockProps, DetailHero(), DetailHeroProps, formatDate(), dateFormatters, FeedCard(), FeedCardProps (+8 more)

### Community 35 - "Community 35"
Cohesion: 0.20
Nodes (17): createMediaFromBuffer(), fetchYouTubeThumbnail(), importYouTubeThumbnail(), relationId(), UploadFile, detectVideoProvider(), hostOf(), INSTAGRAM_HOSTS (+9 more)

### Community 36 - "Community 36"
Cohesion: 0.10
Nodes (7): CompressionStream, DecompressionStream, FixedLengthStream, IdentityTransformStream, TextDecoderStream, TextEncoderStream, TransformStream

### Community 38 - "Community 38"
Cohesion: 0.19
Nodes (16): canDeleteOwnMedia, FeedDecorations, Media, createCollectionRevalidateDeleteHook(), createCollectionRevalidateHook(), createGlobalRevalidateHook(), isPublishedStatus(), RevalidateContext (+8 more)

### Community 39 - "Community 39"
Cohesion: 0.21
Nodes (14): fieldAdminOrManager(), Things, linkFields, ownerField(), publishedAtField(), socialLinkFields, translationReadyField(), seoFields() (+6 more)

### Community 40 - "Community 40"
Cohesion: 0.18
Nodes (19): await connection() + <Suspense> unblock pattern, Blocking prerender errors, cache-components-instant-false codemod, cacheComponents flag, experimental.dynamicIO fatal conflict, Incompatible segment configs (revalidate/dynamic/fetchCache), Incremental vs Direct adoption strategy, export const instant = false (opt-out) (+11 more)

### Community 41 - "Community 41"
Cohesion: 0.12
Nodes (12): GET, OPTIONS, POST, collections, globals, SiteSettings, LOCALES, cloudflareLogger (+4 more)

### Community 42 - "Community 42"
Cohesion: 0.19
Nodes (14): Pages, setReadingTime(), revalidatePagesDelete, revalidatePosts, revalidatePostsDelete, revalidateProjects, revalidateProjectsDelete, checkSlugReservationConflict() (+6 more)

### Community 43 - "Community 43"
Cohesion: 0.17
Nodes (15): Users, Videos, assignOwner(), assignUploadedBy(), asUser(), LayoutBlock, preventCreatorPublish(), preventLastAdminDelete() (+7 more)

### Community 44 - "Community 44"
Cohesion: 0.13
Nodes (18): Prevent Waterfall Chains in API Routes, Defer Await Until Needed, Dependency-Based Parallelization, Promise.all() for Independent Operations, Use SWR for Automatic Deduplication, Use after() for Non-Blocking Operations, Authenticate Server Actions Like API Routes, Cross-Request LRU Caching (+10 more)

### Community 46 - "Community 46"
Cohesion: 0.12
Nodes (15): PAYLOAD_SECRET, cloudflare, bindings, description, engines, bun, node, license (+7 more)

### Community 47 - "Community 47"
Cohesion: 0.18
Nodes (11): InlineBlock(), InlineBlockFields, InlineBlockProps, blockConverter(), BlockNode, CmsRichTextProps, hyphenToCamel(), jsxConverters() (+3 more)

### Community 48 - "Community 48"
Cohesion: 0.37
Nodes (14): generateDetailMetadata(), DetailPage(), CmsPage(), generateCmsPageMetadata(), isReservedPageSlug(), getPostBySlug, getProjectBySlug, resolveSlug (+6 more)

### Community 49 - "Community 49"
Cohesion: 0.15
Nodes (8): loadThingsFeed, loadThingsFeedCached(), { Page: ThingsFeedPage, generateMetadata: generateThingsFeedMetadata }, FEED_SOURCE_REGISTRY, ThingCardView, CACHE_TAGS, CacheTag, CMS_CACHE_VERSION

### Community 50 - "Community 50"
Cohesion: 0.16
Nodes (16): 5.1 Calculate Derived State During Rendering, 5.2 Defer State Reads to Usage Point, 5.5 Extract Default Non-primitive Parameter to Constant, 5.6 Extract to Memoized Components, 5.8 Put Interaction Logic in Event Handlers, 5.7 Narrow Effect Dependencies, 5.3 Do not wrap a simple expression with primitive result in useMemo, 5.9 Split Combined Hook Computations (+8 more)

### Community 51 - "Community 51"
Cohesion: 0.18
Nodes (15): Array Field, Blocks Field, Capability Field Type Guards, Conditional Field, Data Field Type Guards, Payload Field Type Guards Reference, Payload Field Types Reference, Join Field (Reverse Relationship) (+7 more)

### Community 56 - "Community 56"
Cohesion: 0.15
Nodes (14): 7.1 Avoid Layout Thrashing, 7.2 Build Index Maps for Repeated Lookups, 7.3 Cache Property Access in Loops, 7.4 Cache Repeated Function Calls, 7.5 Cache Storage API Calls, 7.6 Combine Multiple Array Iterations, 7.7 Defer Non-Critical Work with requestIdleCallback, 7.8 Early Length Check for Array Comparisons (+6 more)

### Community 57 - "Community 57"
Cohesion: 0.18
Nodes (13): Payload Advanced Features Reference, Payload Authentication (Login, Custom Strategy, API Keys), Payload Custom Admin Components, Endpoint Authentication Default, Endpoint Helper Functions (addDataAndFileToRequest, headersWithCors), Payload Custom API Endpoints Reference, Payload Jobs Queue (Tasks, Workflows), Payload Localization (+5 more)

### Community 58 - "Community 58"
Cohesion: 0.18
Nodes (13): React View Transitions Skill, addTransitionType, ::view-transition CSS pseudo-elements, DirectionalTransition (reusable wrapper), document.startViewTransition, react@canary requirement (outside Next.js), React View Transitions (Skill), references/css-recipes.md (+5 more)

### Community 60 - "Community 60"
Cohesion: 0.15
Nodes (3): Body, Request, Response

### Community 63 - "Community 63"
Cohesion: 0.18
Nodes (10): FooterLinkList(), FieldRow(), FieldRowProps, Hero(), HeroProps, LinkList(), LinkListVariant, SOCIAL_HOSTS (+2 more)

### Community 64 - "Community 64"
Cohesion: 0.17
Nodes (13): 6.1 Animate SVG Wrapper Instead of SVG Element, 6.2 CSS content-visibility for Long Lists, 6.8 Use defer or async on Script Tags, 6.9 Use Explicit Conditional Rendering, 7.10 Hoist RegExp Creation, 3.5 Hoist Static I/O to Module Level, 6.3 Hoist Static JSX Elements, 6.4 Optimize SVG Precision (+5 more)

### Community 65 - "Community 65"
Cohesion: 0.20
Nodes (12): Payload Access Control Reference, Payload Access Control Advanced Patterns, Three Layers of Access Control, Access Control Factory Functions, Access Control Performance Considerations, Context-Aware Access (Locale/Device/IP), Multi-Tenant Access Control, Role-Based Access Control (RBAC) Pattern (+4 more)

### Community 66 - "Community 66"
Cohesion: 0.17
Nodes (12): Avoid Layout Thrashing, Cache Property Access in Loops, Cache Storage API Calls, Hoist RegExp Creation, Use Set/Map for O(1) Lookups, Animate SVG Wrapper Instead of SVG Element, Use Explicit Conditional Rendering, CSS content-visibility for Long Lists (+4 more)

### Community 68 - "Community 68"
Cohesion: 0.41
Nodes (6): User, ensureTestUsers(), initPayload(), richText(), TestUsers, upsertUser()

### Community 69 - "Community 69"
Cohesion: 0.18
Nodes (11): Auth Collection, Payload Collections Reference, Payload Globals, Live Preview, Upload Collection, Upload Field, Versioning and Drafts, Draft/Publish Workflow (+3 more)

### Community 70 - "Community 70"
Cohesion: 0.25
Nodes (11): Collection Hooks, Field Hooks, Hook Context for State Sharing, Payload Hooks Reference, Local API, Next.js Revalidation Pattern, Threading req Through Nested Operations, Hook Loop Prevention via context (+3 more)

### Community 72 - "Community 72"
Cohesion: 0.31
Nodes (8): login(), LoginOptions, cleanupTestUser(), creatorUser, managerUser, seedTestUser(), testUser, upsertUser()

### Community 73 - "Community 73"
Cohesion: 0.25
Nodes (11): Avoid Boolean Prop Proliferation, Prefer Composing Children Over Render Props, Compound Components with Shared Context, Decouple State Management from UI, Explicit Component Variants, Generic Context Interface (state/actions/meta), Lift State into Provider Components, Section: Component Architecture (+3 more)

### Community 75 - "Community 75"
Cohesion: 0.27
Nodes (10): 3.1 Authenticate Server Actions Like API Routes, 3.2 Avoid Duplicate Serialization in RSC Props, 3.3 Avoid Shared Module State for Request Data, 3.4 Cross-Request LRU Caching, 3.6 Minimize Serialization at RSC Boundaries, 3.7 Parallel Data Fetching with Component Composition, 3.8 Parallel Nested Data Fetching, 3.9 Per-Request Deduplication with React.cache() (+2 more)

### Community 76 - "Community 76"
Cohesion: 0.22
Nodes (3): ByteLengthQueuingStrategy, CountQueuingStrategy, QueuingStrategy

### Community 87 - "Community 87"
Cohesion: 0.29
Nodes (6): dateFormatters, formatDate(), PROVIDER_LABEL, VIDEO_CARD_ASPECT, VideoFeedCard(), VideoFeedCardProps

### Community 92 - "Community 92"
Cohesion: 0.29
Nodes (6): plugins, printWidth, semi, singleQuote, trailingComma, prettier-plugin-tailwindcss

### Community 93 - "Community 93"
Cohesion: 0.29
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 94 - "Community 94"
Cohesion: 0.48
Nodes (6): getTrustedOrigins(), config, isPrivateIPv4(), isTrustedHost(), proxy(), requestHeadersProto()

### Community 95 - "Community 95"
Cohesion: 0.33
Nodes (7): React 19 API Changes (no forwardRef, use over useContext), Section: React 19 APIs, 8.2 Initialize App Once, Not Per Mount, 8.1 Do Not Put Effect Events in Dependency Arrays, 8.3 Store Event Handlers in Refs, 8.4 useEffectEvent for Stable Callback Refs, Section: Advanced Patterns (advanced)

### Community 96 - "Community 96"
Cohesion: 0.38
Nodes (7): 2.1 Avoid Barrel File Imports, 2.2 Conditional Module Loading, 2.3 Defer Non-Critical Third-Party Libraries, 2.4 Dynamic Imports for Heavy Components, 2.5 Prefer Statically Analyzable Paths, 2.6 Preload Based on User Intent, Section: Bundle Size Optimization (bundle)

### Community 97 - "Community 97"
Cohesion: 0.33
Nodes (7): 1.1 Check Cheap Conditions Before Async Flags, 1.2 Defer Await Until Needed, 1.3 Dependency-Based Parallelization (better-all), 1.4 Prevent Waterfall Chains in API Routes, 1.5 Promise.all() for Independent Operations, 1.6 Strategic Suspense Boundaries, Section: Eliminating Waterfalls (async)

### Community 98 - "Community 98"
Cohesion: 0.33
Nodes (6): Vercel Composition Patterns AGENTS.md (compiled), Vercel Composition Patterns _sections.md, Vercel Composition Patterns SKILL.md, Vercel React Best Practices AGENTS.md (compiled), Vercel React Best Practices _sections.md, Vercel React Best Practices SKILL.md

### Community 106 - "Community 106"
Cohesion: 0.60
Nodes (4): GET(), POST(), runJobs(), constantTimeEqual()

### Community 107 - "Community 107"
Cohesion: 0.60
Nodes (5): CursorPopup(), getFinePointerServerSnapshot(), getFinePointerSnapshot(), labelFromPoint(), subscribeFinePointer()

### Community 108 - "Community 108"
Cohesion: 0.40
Nodes (5): AND/OR Query Logic, Point (Geolocation) Field, Payload Querying Reference, Query Operators (equals, in, contains, near), REST API

### Community 121 - "Community 121"
Cohesion: 0.70
Nodes (4): ensureFeedDecorationRow(), getPlatformEnv(), upsertFeedDecorationFile(), UpsertFeedDecorationOptions

### Community 122 - "Community 122"
Cohesion: 0.40
Nodes (5): 4.1 Deduplicate Global Event Listeners, 4.2 Use Passive Event Listeners for Scrolling, 4.3 Use SWR for Automatic Deduplication, 4.4 Version and Minimize localStorage Data, Section: Client-Side Data Fetching (client)

### Community 123 - "Community 123"
Cohesion: 0.50
Nodes (4): Payload Adapters Reference, Database Adapters (MongoDB, Postgres, SQLite), Email Adapters (Nodemailer, Resend), Storage Adapters (S3, Azure, GCS, R2, Vercel, Uploadthing)

### Community 124 - "Community 124"
Cohesion: 0.50
Nodes (4): Conditional Module Loading, Dynamic Imports for Heavy Components, Preload Based on User Intent, Dynamic Import Lazy Loading

### Community 125 - "Community 125"
Cohesion: 0.50
Nodes (4): Combine Multiple Array Iterations, Early Return from Functions, Use Loop for Min/Max Instead of Sort, Use toSorted() Instead of sort() for Immutability

### Community 126 - "Community 126"
Cohesion: 0.67
Nodes (4): Animation priority order (shared, suspense, list, state, route), default="none" pattern (avoid spurious cross-fades), Nested ViewTransition limitation, Shared element transitions

### Community 142 - "Community 142"
Cohesion: 0.67
Nodes (4): TMCS Brand Logo SVG, TMCS Visual Brand Identity, Embedded Decorative PNG Icon, Geometric Monogram Mark

### Community 143 - "Community 143"
Cohesion: 1.00
Nodes (3): Avoid Duplicate Serialization in RSC Props, Minimize Serialization at RSC Boundaries, RSC Serialization Minimization

### Community 144 - "Community 144"
Cohesion: 0.67
Nodes (3): BasicImageTransformations, RequestInitCfPropertiesImage, RequestInitCfPropertiesImageDraw

### Community 164 - "Community 164"
Cohesion: 1.00
Nodes (3): com_9x16.webp (clock tower photograph, 2268x4032), Communication tower with clock face and broadcast antenna, Sunlit summer foliage backdrop scene

## Ambiguous Edges - Review These
- `Animation priority order (shared, suspense, list, state, route)` → `Animation priority order (shared, suspense, list, state, route)`  [AMBIGUOUS]
  .agents/skills/vercel-react-view-transitions/SKILL.md · relation: semantically_similar_to
- `<Suspense> boundary placement` → `<Suspense> boundary placement`  [AMBIGUOUS]
  .agents/skills/next-cache-components-adoption/SKILL.md · relation: semantically_similar_to
- `Beam 7x5 image asset` → `Beam 7x5 dimensions (7 by 5 units)`  [AMBIGUOUS]
  src/assets/images/beam_7x5.webp · relation: references
- `orange_3x4.webp Image Asset` → `Visual Content (orange theme, 3:4 portrait decorative image)`  [AMBIGUOUS]
  src/assets/images/orange_3x4.webp · relation: conceptually_related_to

## Knowledge Gaps
- **1065 isolated node(s):** `singleQuote`, `trailingComma`, `printWidth`, `semi`, `prettier-plugin-tailwindcss` (+1060 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **151 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Animation priority order (shared, suspense, list, state, route)` and `Animation priority order (shared, suspense, list, state, route)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `<Suspense> boundary placement` and `<Suspense> boundary placement`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Beam 7x5 image asset` and `Beam 7x5 dimensions (7 by 5 units)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `orange_3x4.webp Image Asset` and `Visual Content (orange theme, 3:4 portrait decorative image)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Event` connect `Community 5` to `Community 0`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `Headers` connect `Community 54` to `Community 0`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `FormData` connect `Community 61` to `Community 0`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._