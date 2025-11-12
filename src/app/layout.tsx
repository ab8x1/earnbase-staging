import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import { poolsInfoDataType } from '@/helpers/getData/getPropsHelpers';
import dbConnect from '../../lib/dbConnect';
import Pool from '../../lib/models/Pool';
import { getLastFullHourUTC } from '@/helpers/formatTimeAgo';
import { TooltipProvider } from '@/components/UI/TooltipMobileFriendly';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const emptyData = {
  poolCoinData: [],
  siteInfo: '',
  siteFAQ: [],
  updatedAt: '',
};

async function getLayoutData() {
  try {
    await dbConnect();
    const rawPoolData: poolsInfoDataType = (await Pool.find({})) || [];
    const poolCoinData: poolsInfoDataType = JSON.parse(JSON.stringify(rawPoolData));
    return {
      poolCoinData,
      updatedAt: getLastFullHourUTC(),
    };
  } catch (e) {
    console.log(e);
    return emptyData;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getLayoutData();
  return (
    <TooltipProvider>
      <html lang="en">
        <body className={`${inter.variable}`}>
          <div id="mainContainer">
            <Navbar data={data} />
            {children}
          </div>
        </body>

        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              strategy="beforeInteractive"
              id="twitterAds"
              dangerouslySetInnerHTML={{
                __html: `
                !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
                },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
                a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
                twq('config','qno86');
              `,
              }}
            />
            <Script src="https://cdn.usefathom.com/script.js" data-site="YIVKGYZX" defer />
          </>
        )}
      </html>{' '}
    </TooltipProvider>
  );
}
