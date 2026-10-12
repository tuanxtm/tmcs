import styles from './posts.module.css'

export function PostsSectionHeader({
  headingId,
  heading,
  description,
}: {
  headingId: string
  heading: string
  description?: string | null
}) {
  return (
    <div className={styles.header} data-posts-header>
      <h2 id={headingId} className={styles.heading}>
        <span className={styles.headingText}>{heading}</span>
      </h2>
      {description ? <p className={styles.description}>{description}</p> : null}
    </div>
  )
}
