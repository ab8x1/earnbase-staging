'use client';
import clsx from 'clsx';
import styles from './indexTable.module.css';
import Image from 'next/image';
import formatTimeAgo, { getLastFullHour } from '@/helpers/formatTimeAgo';
import { useRef, useState } from 'react';
import useOnClickOutside from '@/hooks/OnClickOutside';

export default function UpdateInfo({ updatedAt }: { updatedAt: string }) {
  const [opened, setOpened] = useState(false);
  const stickerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(stickerRef, () => setOpened(false));
  return (
    <div className={styles.sticker} ref={stickerRef}>
      <div
        className={clsx(styles.updatedAtStickerMobile, styles.updatedAtSticker)}
        onClick={() => setOpened(!opened)}
      >
        <Image src={`/refresh.svg`} width={10.5} height={10.5} alt="refresh" />
        {formatTimeAgo(getLastFullHour())}
      </div>
      <div className={clsx(styles.updatedAtContainer, opened && styles.openedUpdatedAtContainer)}>
        <span>
          <Image src={`/refresh.svg`} width={10.5} height={10.5} alt="refresh" />
          <span>Last update:</span>
        </span>
        <span>{updatedAt}</span>
      </div>
    </div>
  );
}
