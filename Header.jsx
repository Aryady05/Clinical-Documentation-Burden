import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.pulse} />
        <span className={styles.brand}>
          <span className={styles.cliniق}>Cliniq</span>
          <span className={styles.ai}>AI</span>
        </span>
      </div>
      <p className={styles.tagline}>Clinical Documentation Assistant</p>
    </header>
  )
}
