import { poolInfoDataType } from '@/helpers/getData/getPropsHelpers';
import styles from './navbar.module.css';
import Image from 'next/image';
import { formatMillions } from '@/helpers/formatNumber';

export default function MobileSponsoredPool({
  sponsoredPool,
}: {
  sponsoredPool: poolInfoDataType;
}) {
  return (
    <div className={styles.mobileFooterAdd}>
      <div className={styles.mobileFooterAddSticker}>
        <span>Featured</span>
        <a href={`${sponsoredPool.productLink}?ref=earnbase.finance`} target="_blank">
          Open
        </a>
      </div>
      <div className="alignY gap2">
        <Image
          src={`/coins/${sponsoredPool.vault.toLocaleLowerCase()}.svg`}
          width={14}
          height={14}
          alt="coin"
        />
        <div className={styles.mobileFooterAddProductInfo}>
          <p>{sponsoredPool.productName}</p>
          <p>
            {sponsoredPool.platform} • {sponsoredPool.monthlyApy.toFixed(2)}% 30d APY • $
            {formatMillions(sponsoredPool.tvl, 2)} TVL
          </p>
        </div>
      </div>
      {/* <div className={styles.addProtocol}>
                <p>{sponsoredPool.productName}</p>
                <p>Powered by {sponsoredPool.platform}</p>
            </div> */}
      {/* <div className={styles.addData}>
                <div>
                    <span style={{color: "var(--green)"}}>{sponsoredPool.monthlyApy.toFixed(2)}%</span>
                    <span>30d Apy </span>
                </div>
                <div>
                    <span style={{color: "black"}}>${formatMillions(sponsoredPool.tvl, 2)}</span>
                    <span>TVL</span>
                </div>
            </div> */}
      {/* <a href={sponsoredPool.productLink} target="_blank" className={clsx(styles.navbarButton, styles.openVault)}>
                <Image src={"/external.svg"} width={15} height={15} alt="external"/>
                Open & Earn
            </a> */}
    </div>
  );
}
