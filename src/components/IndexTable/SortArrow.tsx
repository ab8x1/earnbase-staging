import styles from './sortArrowStyle.module.css';

export default function SortArrow({ desc, asc }: { desc: boolean; asc: boolean }) {
  return (
    <div className={styles.sortArrowContainer}>
      <svg width="7" height="4" viewBox="0 0 7 4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6 3.5625L3.375 0.9375L0.75 3.5625"
          stroke={asc ? '#155DFC' : '#90A1B9'}
          strokeWidth="0.875"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg width="7" height="4" viewBox="0 0 7 4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0.75 0.9375L3.375 3.5625L6 0.9375"
          stroke={desc ? '#155DFC' : '#90A1B9'}
          strokeWidth="0.875"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
