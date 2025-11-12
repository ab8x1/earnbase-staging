'use client';
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import styles from './navbar.module.css';
import Link from 'next/link';
import { poolsInfoDataType } from '@/helpers/getData/getPropsHelpers';
import { usePathname, useParams } from 'next/navigation';
import UpdateInfo from '../IndexTable/UpdateInfo';
import SponsoredPool from './SponsoredPool';
import { ChevronUp } from 'lucide-react';
import useOnClickOutside from '@/hooks/OnClickOutside';
import MobileSponsoredPool from './MobileSponsoredPool';

const tokensUrls: { [key: string]: string } = {
  USDC: '/coins/usdc.svg',
  USDT: '/coins/usdt.svg',
  ETH: '/coins/eth.svg',
  EURC: '/coins/eurc.svg',
  WBTC: '/coins/wbtc.svg',
  cbBTC: '/coins/cbbtc.svg',
};

export const tokens = [
  {
    name: 'USDC',
    href: '/USDC',
    image: '/coins/usdc.svg',
  },
  {
    name: 'USDT',
    href: '/USDT',
    image: '/coins/usdt.svg',
  },
  {
    name: 'ETH',
    href: '/ETH',
    image: '/coins/eth.svg',
  },
  {
    name: 'EURC',
    href: '/EURC',
    image: '/coins/eurc.svg',
  },
  {
    name: 'WBTC',
    href: '/WBTC',
    image: '/coins/wbtc.svg',
  },
  {
    name: 'cbBTC',
    href: '/cbBTC',
    image: '/coins/cbbtc.svg',
  },
];

export default function Navbar({
  data,
}: {
  data: {
    poolCoinData: poolsInfoDataType;
    updatedAt: string;
  };
}) {
  const { poolCoinData, updatedAt } = data;
  const pathname = usePathname();
  const params = useParams();
  const [openMenu, setOpenMenu] = useState(false);
  const [coin, setCoin] = useState<string>();
  const sponsoredData = poolCoinData.find(data => data.sponsored);
  const navToogleRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(navToogleRef, () => setOpenMenu(false));

  useEffect(() => {
    setCoin((params?.coin || 'USDC') as string);
  }, [pathname, params?.coin]);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={clsx(styles.menuTop)}>
          <Link href="/" className={styles.navLogo}>
            <Image src={'/logo.svg'} width={35} height={35} alt="logo" />
            <div className={styles.navLogoText}>
              <span>EarnBase</span>
              <span>Real DeFi Yield</span>
            </div>
          </Link>
          <div className="hideDesktop alignY gap2" style={{ padding: '0px 14px' }}>
            <UpdateInfo updatedAt={updatedAt} />
            <a
              href="https://x.com/earnbasefinance"
              target="_blank"
              style={{ width: '15px', height: '15px' }}
            >
              <Image width={15} height={15} src="/twitter-x.svg" alt="X" />
            </a>
          </div>
        </div>
        <div className={clsx(styles.navbarToogle)} ref={navToogleRef}>
          <div className={clsx(styles.mobileMenuToogler)} onClick={() => setOpenMenu(!openMenu)}>
            {coin ? (
              <Image src={tokensUrls[coin]} width={17.5} height={17.5} alt="token" />
            ) : (
              <div style={{ width: '17.5px', height: '17.5px', marginLeft: '3.5px' }}></div>
            )}
            <ChevronUp
              className={'chevron'}
              style={openMenu ? { transform: 'rotate(180deg)' } : {}}
            />
          </div>
          <div className={clsx(styles.navbarContent, openMenu && styles.navbarToogleVisibleMobile)}>
            {sponsoredData && (
              <div className="hideDesktop">
                <MobileSponsoredPool sponsoredPool={sponsoredData} />
              </div>
            )}
            <ul className={styles.coins}>
              {tokens.map(({ name, href, image }) => (
                <li key={name}>
                  <Link
                    href={href}
                    className={clsx('alignY gap2', coin === name && styles.coinSelected)}
                    onClick={() => setOpenMenu(false)}
                  >
                    <div className="alignY gap2">
                      <Image src={image} width={24.5} height={24.5} alt={name} />
                      <div>{name}</div>
                    </div>
                    <span>{poolCoinData.filter(pool => pool.vault === name).length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={clsx(styles.navbarFooter, 'hideMobile')}>
            {sponsoredData && <SponsoredPool sponsoredPool={sponsoredData} />}
            <div className={styles.submitButtonContainer}>
              <a
                className={clsx(styles.navbarButton, styles.submitButton)}
                href="https://x.com/earnbasefinance"
                target="_blank"
              >
                Follow us on
                <Image src={'/twitter-x-white.svg'} width={15} height={15} alt="plus" />
              </a>
            </div>
            <div>
              EarnBase excludes manually claimable rewards, points programs, and hardcoded
              boosters—for a clean, transparent view of pure returns.
            </div>
            <div>
              <UpdateInfo updatedAt={updatedAt} />
            </div>
            <div className={styles.internalLinks}>
              <a
                className={styles.internalLink}
                href="https://earnbase.finance/openapi.json"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenAPI Spec (JSON)
              </a>
              <a
                className={styles.internalLink}
                href="https://earnbase.finance/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
