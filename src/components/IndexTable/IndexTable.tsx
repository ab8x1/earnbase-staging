'use client';
import clsx from 'clsx';
import { useEffect, useState, useRef } from 'react';
import styles from './indexTable.module.css';
import Image from 'next/image';
import { poolsInfoType } from '@/helpers/getData/getPropsHelpers';
import { formatMillions, formatMillionsToNumber } from '@/helpers/formatNumber';
import daysBetweenTimestamps from '@/helpers/daysBetween';
import SortArrow from './SortArrow';
import useOnClickOutside from '@/hooks/OnClickOutside';
import { ChevronUp } from 'lucide-react';
import { Chain } from '@/helpers/getData/getPropsHelpers';
import Link from 'next/link';
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from '../UI/TooltipMobileFriendly';
import { availableChains } from '@/consts/constants';
import SelectContainer from './Select/SelectContainer';

type SortableKey = 'spotApy' | 'tvl' | 'monthlyApy' | 'lifeTimeApy' | 'operatingSince';

export type sortType = {
  key: SortableKey;
  type: 'asc' | 'desc';
};

export default function VaultTable({
  poolsApyInfo,
  selectedNetwork,
  coin,
}: {
  poolsApyInfo: poolsInfoType;
  selectedNetwork: Chain;
  coin: string;
}) {
  const { indexData } = poolsApyInfo;
  const [selectedChainData] = useState(
    indexData.filter(pool => (selectedNetwork ? pool.network === selectedNetwork : true))
  );
  const [pools, setPools] = useState(selectedChainData.sort((a, b) => b.spotApy - a.spotApy));
  const [chains] = useState(
    availableChains.filter(({ chain }) => indexData.some(pool => pool.network === chain))
  );
  const [sortKey, setSortKey] = useState<sortType>({ key: 'spotApy', type: 'desc' });
  const [sortTVL, setSortTVL] = useState(0);
  const [filterProtocol, setFilterProtocol] = useState<string | null>(null);
  const [filterProductQuery, setFilterProductQuery] = useState<string | null>(null);
  const [filterWildcardtQuery, setFilterWildcardQuery] = useState<string | null>(null);
  const [openChainMobileMenu, setOpenChainMobileMenu] = useState(false);
  const [openTVLMobileMenu, setOpenTVLMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>();
  const chainSelectRef = useRef<HTMLDivElement>(null);
  const tvlSelectRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(chainSelectRef, () => setOpenChainMobileMenu(false));
  useOnClickOutside(tvlSelectRef, () => setOpenTVLMobileMenu(false));

  const sort = (key: SortableKey) => {
    setSortKey(prevSortKey => ({
      key,
      type: prevSortKey.key === key && prevSortKey.type === 'desc' ? 'asc' : 'desc',
    }));
  };

  useEffect(() => {
    const isMobile = window.innerWidth <= 1030;
    setIsMobile(isMobile);
  }, []);

  useEffect(() => {
    let sortedPools = [...selectedChainData];
    if (filterProtocol) sortedPools = sortedPools.filter(pool => pool.platform === filterProtocol);
    if (filterProductQuery)
      sortedPools = sortedPools.filter(pool => pool.productName === filterProductQuery);
    if (filterWildcardtQuery)
      sortedPools = sortedPools.filter(
        pool =>
          pool.platform.toLocaleLowerCase().includes(filterWildcardtQuery.toLocaleLowerCase()) ||
          pool.productName.toLocaleLowerCase().includes(filterWildcardtQuery.toLocaleLowerCase())
      );
    sortedPools = sortedPools
      .filter(pool => formatMillionsToNumber(pool.tvl, 2) >= sortTVL)
      .sort((a, b) => {
        const sortType =
          sortKey.key === 'operatingSince'
            ? sortKey.type === 'asc'
              ? 'desc'
              : 'asc'
            : sortKey.type;
        if (sortType === 'asc') {
          return a[sortKey.key] - b[sortKey.key];
        } else {
          return b[sortKey.key] - a[sortKey.key];
        }
      });
    setPools(sortedPools);
  }, [
    sortKey,
    indexData,
    selectedNetwork,
    sortTVL,
    filterProtocol,
    filterProductQuery,
    filterWildcardtQuery,
    selectedChainData,
  ]);

  return (
    <TooltipProvider>
      <div className={styles.tableContainer}>
        <div className={styles.topInfo}>
          <div ref={chainSelectRef}>
            <div
              className={styles.mobileMenuToogleButton}
              onClick={() => setOpenChainMobileMenu(!openChainMobileMenu)}
            >
              {
                <Image
                  width={17.5}
                  height={17.5}
                  src={
                    selectedNetwork
                      ? `/chains/${selectedNetwork.toLowerCase()}.svg`
                      : '/chains/allChains.png'
                  }
                  alt={selectedNetwork || 'chains select'}
                />
              }
              <ChevronUp
                className={'chevron'}
                style={openChainMobileMenu ? { transform: 'rotate(180deg)' } : {}}
              />
            </div>
            <div
              className={clsx(
                styles.selectChain,
                openChainMobileMenu && styles.mobileBottomMenuItem
              )}
            >
              {
                <Link
                  className={clsx(styles.chain, selectedNetwork === null && styles.selectedChain)}
                  href={`/${coin}`}
                >
                  All
                  <span className="hideDesktop"> Networks</span>
                </Link>
              }
              {chains.map(({ chain, imgUrl }) => (
                <Link
                  key={chain}
                  className={clsx(styles.chain, selectedNetwork === chain && styles.selectedChain)}
                  href={`/${coin}/${chain}`}
                >
                  <Image src={`/chains/${imgUrl}`} width={14} height={14} alt={chain} />
                  <span className="hideDesktop">{chain}</span>
                </Link>
              ))}
            </div>
          </div>

          <SelectContainer
            indexData={selectedChainData}
            coin={coin}
            selectedNetwork={selectedNetwork}
            setFilterProtocol={setFilterProtocol}
            setFilterProductQuery={setFilterProductQuery}
            setFilterWildcardQuery={setFilterWildcardQuery}
            isMobile={isMobile}
          />

          <div ref={tvlSelectRef}>
            <div
              className={styles.mobileMenuToogleButton}
              onClick={() => setOpenTVLMobileMenu(!openTVLMobileMenu)}
            >
              {sortTVL === 0 ? 'TVL: All' : sortTVL === 1 ? '>$1M' : '>$10M'}
              <ChevronUp
                className={'chevron'}
                style={openTVLMobileMenu ? { transform: 'rotate(180deg)' } : {}}
              />
            </div>
            <div className={clsx(styles.tvlFilter, openTVLMobileMenu && styles.openMobileTvlPopup)}>
              <div
                onClick={() => {
                  setSortTVL(0);
                  setOpenTVLMobileMenu(false);
                }}
                className={clsx(
                  styles.tvlFilterValue,
                  sortTVL === 0 && styles.tvlFilterValueSelected
                )}
              >
                All
              </div>
              <div
                onClick={() => {
                  setSortTVL(1);
                  setOpenTVLMobileMenu(false);
                }}
                className={clsx(
                  styles.tvlFilterValue,
                  sortTVL === 1 && styles.tvlFilterValueSelected
                )}
              >
                &gt;$1M
              </div>
              <div
                onClick={() => {
                  setSortTVL(10);
                  setOpenTVLMobileMenu(false);
                }}
                className={clsx(
                  styles.tvlFilterValue,
                  sortTVL === 10 && styles.tvlFilterValueSelected
                )}
              >
                &gt;$10M
              </div>
            </div>
          </div>

          <div className={styles.topInfoEmptyMobileRight}></div>
        </div>
        <div className={clsx('container', styles.vaultTableWrapper)}>
          <table className={styles.vaultTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th onClick={() => sort('spotApy')} className={styles.clickableHeader}>
                  <div className="alignY justifyBetween gap1">
                    24h APY
                    <SortArrow
                      asc={sortKey.key === 'spotApy' && sortKey.type === 'asc'}
                      desc={sortKey.key === 'spotApy' && sortKey.type === 'desc'}
                    />
                  </div>
                </th>
                <th onClick={() => sort('monthlyApy')} className={styles.clickableHeader}>
                  <div className="alignY justifyBetween gap1">
                    30d APY
                    <SortArrow
                      asc={sortKey.key === 'monthlyApy' && sortKey.type === 'asc'}
                      desc={sortKey.key === 'monthlyApy' && sortKey.type === 'desc'}
                    />
                  </div>
                </th>
                <th onClick={() => sort('tvl')} className={styles.clickableHeader}>
                  <div className="alignY justifyBetween gap1">
                    TVL
                    <SortArrow
                      asc={sortKey.key === 'tvl' && sortKey.type === 'asc'}
                      desc={sortKey.key === 'tvl' && sortKey.type === 'desc'}
                    />
                  </div>
                </th>
                <th onClick={() => sort('operatingSince')} className={styles.clickableHeader}>
                  <div className="alignY justifyBetween gap1">
                    <div className="alignY gap1">
                      Operating
                      <div
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Tooltip isMobile={isMobile}>
                          <TooltipTrigger
                            isMobile={isMobile}
                            style={{ border: 'none', background: 'transparent' }}
                          >
                            <Image src="/help.png" width={12} height={12} alt="help" />
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            sideOffset={10}
                            className={styles.tooltipContent}
                            isMobile={isMobile}
                          >
                            <p>
                              Days since this product was first tracked by our data source
                              (DeFiLlama). Some products may have technically launched earlier.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <SortArrow
                      asc={sortKey.key === 'operatingSince' && sortKey.type === 'asc'}
                      desc={sortKey.key === 'operatingSince' && sortKey.type === 'desc'}
                    />
                  </div>
                </th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {pools.map(
                (
                  {
                    vault,
                    platform,
                    productLink,
                    spotApy,
                    spotApyAlternative,
                    tvl,
                    tvlAlternative,
                    monthlyApy,
                    monthlyApyAlternative,
                    operatingSince,
                    productName,
                    network,
                  },
                  i
                ) => (
                  <tr key={`${selectedNetwork} ${productLink} ${i}`} className={styles.tableRow}>
                    <td>
                      <div className={styles.number}>{i + 1}</div>
                    </td>
                    <td>
                      <div className={`${styles.tableDataCol} `}>
                        <Image
                          src={`/chains/${network.toLowerCase()}.svg`}
                          width={14}
                          height={14}
                          alt={network}
                          style={{ marginRight: '7px' }}
                        />
                        <Image
                          src={`/coins/${vault.toLowerCase()}.svg`}
                          width={25}
                          height={25}
                          alt={vault}
                        />
                        <div className={styles.platformInfo}>
                          <b>{productName}</b>
                          <span>{platform}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div
                        className={styles.tableData}
                        style={{ color: '#00A63E', fontWeight: 600 }}
                      >
                        {spotApy.toFixed(2)}% _
                        <span style={{ color: 'orange' }}>{spotApyAlternative?.toFixed(2)}%</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.tableData}>
                        {monthlyApy.toFixed(2)}% _
                        <span style={{ color: 'orange' }}>{monthlyApyAlternative?.toFixed(2)}%</span>
                      </div>
                    </td>
                    {/* <td>
                        <div className={styles.tableData}>
                            {lifeTimeApy.toFixed(2)}%
                        </div>
                    </td> */}
                    <td>
                      <div className={styles.tableData}>
                        ${formatMillions(tvl, 2)}_
                        <span style={{ color: 'orange' }}>
                          {tvlAlternative ? formatMillions(tvlAlternative, 2) : '?M'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.tableData}>
                        {daysBetweenTimestamps(operatingSince)} d
                      </div>
                    </td>
                    <td>
                      <a
                        href={`${productLink}?ref=earnbase.finance`}
                        target="_blank"
                        className={styles.open}
                      >
                        <Image src="/external.svg" width={12} height={12} alt="external" />
                      </a>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
}
