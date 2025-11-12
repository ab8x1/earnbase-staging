'use client';
import clsx from 'clsx';
import {
  OptionProps,
  StylesConfig,
  GroupBase,
  SingleValue,
  components,
  MenuListProps,
} from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { Search, X } from 'lucide-react';
import styles from './selectStyles.module.css';
import { Dispatch, SetStateAction, useMemo, useState, Children } from 'react';
import { tokenize, tokensMatch } from './selectHelpers';
import Image from 'next/image';
import { Chain, poolsInfoDataType } from '@/helpers/getData/getPropsHelpers';

export type ValueType = 'platform' | 'productName' | 'link' | 'wildcard';

export type SelectOption = {
  label: string;
  value: {
    id: string; //network-platform-productname || platform || url
    type: ValueType;
    content: string;
    beforeBeforeImg?: string;
    beforeImg?: string;
    afterImg?: string;
  };
};

export type Grouped = GroupBase<SelectOption>;

const keyOf = (o: SelectOption) => `${o?.value?.id?.toLocaleLowerCase()}`;

const customStyles: StylesConfig<SelectOption, false, GroupBase<SelectOption>> = {
  control: (base, state) => ({
    ...base,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0px 7px',
    borderRadius: '0.5rem',
    backgroundColor: '#f8fafc',
    borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 2px #dbeafe' : 'none',
    transitionProperty:
      'color, background-color, border-color, text-decoration-color, fill, stroke',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1',
    },
  }),
  valueContainer: base => ({
    ...base,
    padding: 0,
  }),
  input: base => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  menuList: base => ({
    ...base,
    padding: '0.5rem 0.75rem',
    maxHeight: '400px',
    zIndex: '100000',
  }),
  groupHeading: base => ({
    ...base,
    paddingLeft: 0,
    marginLeft: 0,
    marginBottom: '10px',
  }),
};

// Custom Control with Icon
/* eslint-disable  @typescript-eslint/no-explicit-any */
const CustomControl = (props: any) => (
  <components.Control {...props}>
    <Search size={14} color="#314158" />
    {props.children}
  </components.Control>
);

const TempClearIndicator = ({ setInput }: { setInput: Dispatch<SetStateAction<string>> }) => {
  return (
    <span
      className={styles.tempClearIndicator}
      style={{ cursor: 'pointer', width: '15px', height: '15px' }}
      onClick={() => setInput('')}
    >
      <X width={15} height={15} color="#314158" />
    </span>
  );
};

/* eslint-disable  @typescript-eslint/no-explicit-any */
const CustomClearIndicatorReactSelect = (props: any) => {
  const { selectProps } = props;
  return (
    <components.ClearIndicator {...props}>
      <span
        onClick={() => selectProps.onChange(null)}
        style={{ cursor: 'pointer', width: '15px', height: '15px' }}
      >
        <X width={15} height={15} />
      </span>
    </components.ClearIndicator>
  );
};

const CustomMenuList = (props: MenuListProps<any, false>) => {
  const children = Children.toArray(props.children);
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const createOption = children.find((child: any) => child?.props?.data?.__isNew__ === true);
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const normalOptions = children.filter((child: any) => child?.props?.data?.__isNew__ !== true);

  return (
    <components.MenuList {...props}>
      {createOption}
      {normalOptions}
    </components.MenuList>
  );
};

const Option = (props: OptionProps<SelectOption>) => {
  const { children, cx, isFocused, innerRef, innerProps, data } = props;
  return (
    <div
      ref={innerRef}
      className={cx(
        {
          option: true,
        },
        styles.option,
        isFocused ? styles.focusedOption : ''
      )}
      {...innerProps}
    >
      <div className={styles.optionContent}>
        {data.value?.beforeBeforeImg && (
          <Image
            src={data.value.beforeBeforeImg}
            width={10}
            height={10}
            alt={`${data.value.content} mid img`}
          />
        )}
        {data.value?.beforeImg && (
          <Image
            src={data.value.beforeImg}
            width={15}
            height={15}
            alt={`${data.value.content} before img`}
          />
        )}
        {children}
      </div>
      {data.value?.afterImg && (
        <Image
          src={data.value?.afterImg}
          width={20}
          height={20}
          alt={`${data.value.content} after img`}
        />
      )}
    </div>
  );
};

export default function CustomSelect({
  indexData,
  coin,
  selectedNetwork,
  setFilterProtocol,
  setFilterProductQuery,
  setFilterWildcardQuery,
  isMobile,
  setIsMobileSelectMenuOpen,
}: {
  indexData: poolsInfoDataType;
  selectedNetwork: Chain;
  coin: string;
  setFilterProtocol: Dispatch<SetStateAction<string | null>>;
  setFilterProductQuery: Dispatch<SetStateAction<string | null>>;
  setFilterWildcardQuery: Dispatch<SetStateAction<string | null>>;
  isMobile?: boolean;
  setIsMobileSelectMenuOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [allGroupedOptions] = useState<Grouped[]>([
    {
      label: `Tracked ${coin} Protocols ${selectedNetwork ? `on ${selectedNetwork}` : ''}`,
      options: Array.from(new Set(indexData.map(data => data.platform))).map(dedupedPlatform => ({
        value: {
          id: dedupedPlatform.toLocaleLowerCase(),
          type: 'platform',
          content: dedupedPlatform,
          beforeImg: `/protocols/${dedupedPlatform.toLocaleLowerCase().replace(/\s/g, '-')}.webp`,
        },
        label: dedupedPlatform,
      })),
    },
    {
      label: `Tracked ${coin} Products ${selectedNetwork ? `on ${selectedNetwork}` : ''}`,
      options: indexData.map(data => ({
        value: {
          id: `${data.network}-${data.platform}-${data.productName}`,
          type: 'productName',
          content: data.productName,
          beforeBeforeImg: `/chains/${data.network.toLocaleLowerCase()}.svg`,
          beforeImg: `/coins/${data.vault.toLowerCase()}.svg`,
          afterImg: `/protocols/${data.platform.toLocaleLowerCase().replace(/\s/g, '-')}.webp`,
        },
        label: data.productName,
      })),
    },
  ]);
  const [popularGroupedOptions] = useState<Grouped[]>([
    {
      label: 'SEARCH BY PROTOCOL NAME:',
      options: allGroupedOptions[0].options.slice(0, 2),
    },
    {
      label: 'SEARCH BY PRODUCT OR CURATOR NAME:',
      options: allGroupedOptions[1].options.slice(0, 2),
    },
  ]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [userTempOption, setUserTempOption] = useState<SelectOption | null>(null);
  const [inputValue, setInputValue] = useState('');

  const showAll = !!selectedKey || inputValue.trim().length > 0;
  const optionsSource = showAll ? allGroupedOptions : popularGroupedOptions;

  const flatOptions = useMemo(() => optionsSource.flatMap(g => g.options), [optionsSource]);

  // Re-derive the value object from the current options
  const derivedValue = useMemo<SelectOption | null>(() => {
    if (userTempOption) return userTempOption;
    if (!selectedKey) return null;
    return flatOptions.find(o => keyOf(o) === selectedKey) ?? null;
  }, [flatOptions, selectedKey, userTempOption]);

  const onChange = (v: SingleValue<SelectOption>) => {
    const opt = v as SingleValue<SelectOption>;
    //user created option
    if (opt?.value && !opt?.value?.id) {
      setUserTempOption({
        label: opt?.value.toString(),
        value: {
          id: 'new',
          content: opt?.value.toString(),
          type: 'wildcard',
        },
      });
      setIsMobileSelectMenuOpen(false);
      setFilterWildcardQuery(opt?.value.toString());
      setFilterProtocol(null);
      setFilterProductQuery(null);
      setSelectedKey(null);
    }
    //options from list or list cleared
    else {
      switch (opt?.value.type) {
        case 'platform':
          {
            setFilterProtocol(opt.value.content);
            setFilterProductQuery(null);
            setIsMobileSelectMenuOpen(false);
          }
          break;
        case 'productName':
          {
            setFilterProductQuery(opt.value.content);
            setFilterProtocol(null);
            setIsMobileSelectMenuOpen(false);
          }
          break;
        default: {
          //list cleared
          setFilterProtocol(null);
          setFilterProductQuery(null);
        }
      }
      setUserTempOption(null);
      setFilterWildcardQuery(null);
      setSelectedKey(opt ? keyOf(opt) : null);
    }
    setInputValue('');
  };

  return (
    <>
      <CreatableSelect<SelectOption, false, Grouped>
        value={derivedValue}
        onChange={onChange}
        components={{
          Control: CustomControl,
          Option,
          ClearIndicator: CustomClearIndicatorReactSelect,
          MenuList: CustomMenuList,
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null,
        }}
        placeholder={`${coin} projects, curators or products ${selectedNetwork ? `on ${selectedNetwork}` : ''}`}
        options={optionsSource}
        getOptionValue={keyOf}
        isOptionSelected={(opt, selectValue) => selectValue.some(v => keyOf(v) === keyOf(opt))}
        styles={customStyles}
        className={clsx(styles.select)}
        isClearable
        instanceId="search-select"
        inputId="search-select-input"
        menuIsOpen={isMobile ? true : undefined}
        inputValue={inputValue}
        onInputChange={(val, meta) => {
          if (meta.action === 'input-change') setInputValue(val);
        }}
        filterOption={(candidate, rawInput) => {
          // show everything when there's no query
          if (!rawInput) return true;

          /* eslint-disable  @typescript-eslint/no-explicit-any */
          const data: any = candidate.data;

          // Always show the "Create …" row, even if its label is JSX
          if (data && data.__isNew__) return true;

          const tokens = tokenize(rawInput);

          // Safely get strings for matching
          const labelStr =
            typeof candidate.label === 'string'
              ? candidate.label
              : typeof data?.label === 'string'
                ? data.label
                : '';

          const contentStr = typeof data?.value?.content === 'string' ? data.value.content : '';

          const typeStr = typeof data?.value?.type === 'string' ? data.value.type : '';

          return (
            tokensMatch(tokens, labelStr) ||
            tokensMatch(tokens, contentStr) ||
            tokensMatch(tokens, typeStr)
          );
        }}
        formatCreateLabel={inputValue => (
          <>
            Search for anything<em>&quot;{inputValue}&quot;</em>related
          </>
        )}
      />
      {!selectedKey && !userTempOption && inputValue.trim().length > 0 && (
        <TempClearIndicator setInput={setInputValue} />
      )}
    </>
  );
}
