type LinkLike = {
  newTab?: boolean | null
  external?: boolean | null
}

/** Shared target/rel attributes for external or new-tab links. */
export function externalLinkProps(link: LinkLike): {
  target?: '_blank'
  rel?: 'noopener noreferrer'
} {
  const openInNewTab = Boolean(link.newTab)
  const needsRel = openInNewTab || Boolean(link.external)

  return {
    target: openInNewTab ? '_blank' : undefined,
    rel: needsRel ? 'noopener noreferrer' : undefined,
  }
}
