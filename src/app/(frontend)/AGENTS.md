# Frontend conventions

- Use CSS Modules for default public frontend presentation. Keep Tailwind available for optional direct styling and existing `className` props.
- Give each component module a kebab-case folder containing its TSX implementation and an explicit `index.ts`. Add a matching CSS Module only when needed.
- Indexes re-export only their implementation's named, default, and type exports. Do not add feature-wide barrels, `export *`, or client directives on indexes.
- Keep standalone TypeScript helpers and framework route entrypoints in place. Preserve server/client boundaries and lazy imports.
- Keep shared feature styles in that feature's `_styles` folder and cross-feature styles in `_components/_styles`. Do not copy shared rules into each component.
- Declare `@layer theme, base, components, utilities` at the start of CSS Modules. Put ordinary module rules in `@layer components` so Tailwind utilities can override defaults.
- Keep drawer primitive adapters and the splash Typewriter wrapping adapter unlayered. Existing important declarations and runtime inline values also require deliberate overrides.
- Use ordinary CSS and existing design tokens. Do not introduce `@apply` in modules. Retain inline styles for runtime geometry, Motion values, and CMS-authored presentation.
- Import vendor default CSS through the frontend stylesheet in the base layer so it cannot override component interaction rules.
- Keep global tokens, fonts, base rules, document state/scroll locks, reduced-motion safeguards, and view-transition recipes in the frontend stylesheet.
- Keep `.page-blocks` and `.boot-splash` as unstyled compatibility markers. Preserve document state classes and existing data attributes.
- Leave shared primitives in `src/components` on their established styling system.
