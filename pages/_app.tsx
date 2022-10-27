import { NormalizedCacheObject } from "@apollo/client";
import LiteflowNFTApp, {
  APOLLO_STATE_PROP_NAME,
  Footer,
  Navbar,
} from "@nft/components";
import { EmailConnector } from "@nft/email-connector";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import dayjs from "dayjs";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { GoogleAnalytics, usePageViews } from "nextjs-google-analytics";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect, useMemo } from "react";
import ChatWindow from "../components/ChatWindow";
import Head from "../components/Head";
import environment from "../environment";
import { theme } from "../styles/theme";
require("dayjs/locale/ja");
require("dayjs/locale/zh-cn");

NProgress.configure({ showSpinner: false });

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  [APOLLO_STATE_PROP_NAME]: NormalizedCacheObject;
  user?: {
    address?: string;
    token?: string;
  };
}>): JSX.Element {
  const router = useRouter();
  dayjs.locale(router.locale);
  usePageViews();

  useEffect(() => {
    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router]);

  const footerLinks = useMemo(() => {
    const texts = {
      en: {
        explore: "Explore",
        terms: "Terms",
        privacy: "Privacy",
        referral: "Referral",
      },
      ja: {
        explore: "検索",
        terms: "利用規約",
        privacy: "プライバシーポリシー",
        referral: "紹介",
      },
      "zh-cn": {
        explore: "探讨",
        terms: "条款",
        privacy: "隐私",
        referral: "转 介",
      },
    };
    const locale = (router.locale || "en") as keyof typeof texts;

    return [
      { href: "https://liteflow.com", label: "About" },
      { href: "https://liteflow.com/#nft", label: "NFT Solution" },
      { href: "/explore", label: texts[locale].explore },
      { href: "/terms", label: texts[locale].terms },
      { href: "/privacy", label: texts[locale].privacy },
      { href: "/referral", label: texts[locale].referral },
      { href: "https://facebook.com", label: "Facebook" },
      { href: "https://instagram.com", label: "Instagram" },
      { href: "https://twitter.com", label: "Twitter" },
      { href: "https://github.com", label: "Github" },
      { href: "https://dribbble.com", label: "Dribble" },
    ];
  }, [router.locale]);

  const connectors = useMemo(
    () => ({
      email: new EmailConnector({
        apiKey: environment.MAGIC_API_KEY,
        options: {
          network: {
            rpcUrl: environment.PUBLIC_ETHEREUM_PROVIDER,
            chainId: environment.CHAIN_ID,
          },
        },
      }),
      injected: new InjectedConnector({
        supportedChainIds: [environment.CHAIN_ID],
      }),
      walletConnect: new WalletConnectConnector({
        rpc: {
          [environment.CHAIN_ID]: environment.PUBLIC_ETHEREUM_PROVIDER,
        },
        supportedChainIds: [environment.CHAIN_ID],
        chainId: environment.CHAIN_ID,
      }),
      coinbase: new WalletLinkConnector({
        supportedChainIds: [environment.CHAIN_ID],
        appName: "Liteflow",
        url: "https://nft.liteflow.com",
      }),
    }),
    []
  );

  return (
    <>
      <Head
        title="Liteflow NFT Marketplace - Test"
        description="The next-generation NFT Marketplace tailored to your needs"
      >
        <meta
          name="keywords"
          content="NFT, marketplace, platform, white-label, blockchain"
        />

        <meta name="author" content="Liteflow, Inc." />
        <meta name="application-name" content="Liteflow NFT Marketplace" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nft.liteflow.com" />

        <meta name="twitter:card" content="summary" />
      </Head>
      <GoogleAnalytics strategy="lazyOnload" />
      <LiteflowNFTApp
        ssr={typeof window === "undefined"}
        endpointUri={environment.GRAPHQL_URL}
        cache={pageProps[APOLLO_STATE_PROP_NAME]}
        user={pageProps.user}
        connectors={connectors}
        bugsnagAPIKey={environment.BUGSNAG_API_KEY}
        theme={theme}
      >
        <ChatWindow>
          <Navbar
            allowTopUp={true}
            router={{
              asPath: router.asPath,
              isReady: router.isReady,
              push: router.push,
              query: router.query,
              events: router.events,
            }}
            login={{
              email: true,
              metamask: true,
              walletConnect: true,
              coinbase: true,
              networkName: environment.NETWORK_NAME,
            }}
            multiLang={{
              locale: router.locale,
              pathname: router.pathname,
              choices: [
                { label: "En", value: "en" },
                { label: "日本語", value: "ja" },
                { label: "中文", value: "zh-cn" },
              ],
            }}
          />
          <Component {...pageProps} />
          <Footer name="Liteflow" links={footerLinks} />
        </ChatWindow>
      </LiteflowNFTApp>
    </>
  );
}
export default MyApp;
