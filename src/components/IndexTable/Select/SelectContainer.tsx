import { poolsInfoDataType, Chain } from '@/helpers/getData/getPropsHelpers';
import { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import Select from './Select';
import clsx from 'clsx';
import styles from './selectStyles.module.css';
import { Search, X } from 'lucide-react';

export default function SelectContainer({
  indexData,
  coin,
  selectedNetwork,
  setFilterProtocol,
  setFilterProductQuery,
  setFilterWildcardQuery,
  isMobile,
}: {
  indexData: poolsInfoDataType;
  selectedNetwork: Chain;
  coin: string;
  setFilterProtocol: Dispatch<SetStateAction<string | null>>;
  setFilterProductQuery: Dispatch<SetStateAction<string | null>>;
  setFilterWildcardQuery: Dispatch<SetStateAction<string | null>>;
  isMobile?: boolean;
}) {
  const [isMobileSelectOpen, setIsMobileSelectMenuOpen] = useState(false);

  return (
    <div className={clsx(styles.selectContainer)}>
      <div
        className={styles.mobileToogler}
        onClick={() => setIsMobileSelectMenuOpen(!isMobileSelectOpen)}
      >
        {isMobileSelectOpen ? (
          <X size={14} color="#314158" />
        ) : (
          <Search size={14} color="#314158" />
        )}
        Search
      </div>
      <div
        className={clsx(
          styles.selectInputContainer,
          isMobileSelectOpen
            ? styles.selectInputContainerMobileOpen
            : styles.selectInputContainerMobileClosed
        )}
      >
        <div
          className={clsx('hideDesktop', styles.closeMobileSearch)}
          onClick={() => setIsMobileSelectMenuOpen(false)}
        >
          <X size={12} color="#314158" />
          Close Search
        </div>
        <Select
          indexData={indexData}
          coin={coin}
          selectedNetwork={selectedNetwork}
          setFilterProtocol={setFilterProtocol}
          setFilterProductQuery={setFilterProductQuery}
          setFilterWildcardQuery={setFilterWildcardQuery}
          isMobile={isMobile}
          setIsMobileSelectMenuOpen={setIsMobileSelectMenuOpen}
        />
      </div>
    </div>
  );
}
