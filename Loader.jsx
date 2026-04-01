import styles from './Loader.module.css'

export default function Loader({ message = 'Processing…' }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.dots}>
        <span /><span /><span />
      </div>
      <p className={styles.msg}>{message}</p>
    </div>
  )
}
