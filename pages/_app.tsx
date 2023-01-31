import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import { Box, ChakraProvider } from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { Web3Provider } from '@ethersproject/providers'
import { LiteflowProvider, useAuthenticate } from '@nft/hooks'
import { useWeb3React, Web3ReactProvider } from '@web3-react/core'
import dayjs from 'dayjs'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { GoogleAnalytics, usePageViews } from 'nextjs-google-analytics'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import React, {
  ComponentType,
  Fragment,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { CookiesProvider, useCookies } from 'react-cookie'
import Banner from '../components/Banner/Banner'
import ChatWindow from '../components/ChatWindow'
import Footer from '../components/Footer/Footer'
import Head from '../components/Head'
import Navbar from '../components/Navbar/Navbar'
import connectors from '../connectors'
import environment from '../environment'
import useEagerConnect from '../hooks/useEagerConnect'
import useSigner from '../hooks/useSigner'
import { APOLLO_STATE_PROP_NAME, PropsWithUserAndState } from '../props'
import {
  COOKIE_JWT_TOKEN,
  COOKIE_OPTIONS,
  currentJWT,
  jwtValidity,
} from '../session'
import { theme } from '../styles/theme'
require('dayjs/locale/ja')
require('dayjs/locale/zh-cn')
require('dayjs/locale/es-mx')

NProgress.configure({ showSpinner: false })

function web3Provider(provider: any): Web3Provider {
  return new Web3Provider(
    provider,
    typeof provider.chainId === 'number'
      ? provider.chainId
      : typeof provider.chainId === 'string'
      ? parseInt(provider.chainId)
      : 'any',
  )
}

function Layout({
  userAddress,
  children,
}: PropsWithChildren<{ userAddress: string | null }>) {
  const router = useRouter()
  const signer = useSigner()
  const userProfileLink = useMemo(
    () => (userAddress ? `/users/${userAddress}` : '/login'),
    [userAddress],
  )
  const footerLinks = useMemo(() => {
    const texts = {
      en: {
        explore: 'Explore',
        create: 'Create',
        profile: 'Profile',
        referral: 'Referral',
        support: 'Support',
        terms: 'Terms',
        privacy: 'Privacy',
      },
      ja: {
        explore: '検索',
        create: '作成',
        profile: 'プロフィール',
        referral: '紹介',
        support: 'サポート',
        terms: '利用規約',
        privacy: 'プライバシーポリシー',
      },
      'zh-cn': {
        explore: '探讨',
        create: '创造',
        profile: '资料',
        referral: '转介',
        support: '支持',
        terms: '条款',
        privacy: '隐私',
      },
      'es-mx': {
        explore: 'Explorar',
        create: 'Crear',
        profile: 'Perfil',
        referral: 'Recomendación',
        support: 'Apoyo',
        terms: 'Letra chica',
        privacy: 'Privacidad',
      },
    }
    const locale = (router.locale || 'en') as keyof typeof texts
    return [
      { href: '/explore', label: texts[locale].explore },
      { href: '/create', label: texts[locale].create },
      { href: userProfileLink, label: texts[locale].profile },
      { href: '/referral', label: texts[locale].referral },
      { href: '/', label: texts[locale].support },
      { href: '/', label: texts[locale].terms },
      { href: '/', label: texts[locale].privacy },
      { href: 'https://twitter.com', label: 'Twitter' },
      { href: 'https://discord.com', label: 'Discord' },
    ]
  }, [router.locale, userProfileLink])

  return (
    <ChatWindow>
      <Box mt={12}>
        <Banner />
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
            ...connectors,
            networkName: environment.NETWORK_NAME,
          }}
          multiLang={{
            locale: router.locale,
            pathname: router.pathname,
            choices: [
              { label: 'En', value: 'en' },
              { label: '日本語', value: 'ja' },
              { label: '中文', value: 'zh-cn' },
              { label: 'Spanish', value: 'es-mx' },
            ],
          }}
          signer={signer}
          disableMinting={environment.MINTABLE_COLLECTIONS.length === 0}
        />
        {children}
        <Footer name="MemeLand" links={footerLinks} />
      </Box>
    </ChatWindow>
  )
}

function AccountProvider(
  props: PropsWithChildren<{
    cache: NormalizedCacheObject
  }>,
) {
  const signer = useSigner()
  const ready = useEagerConnect()
  const { deactivate } = useWeb3React()
  const [authenticate, { setAuthenticationToken, resetAuthenticationToken }] =
    useAuthenticate()
  const [cookies, setCookie, removeCookie] = useCookies([COOKIE_JWT_TOKEN])

  const clearAuthenticationToken = useCallback(async () => {
    resetAuthenticationToken()
    removeCookie(COOKIE_JWT_TOKEN, COOKIE_OPTIONS)
  }, [removeCookie, resetAuthenticationToken])

  const authenticateSigner = useCallback(
    async (signer: Signer) => {
      try {
        const existingJWT = currentJWT(cookies)
        const currentAddress = (await signer.getAddress()).toLowerCase()
        const jwtAddress = existingJWT?.address.toLowerCase()
        if (existingJWT && currentAddress === jwtAddress)
          return setAuthenticationToken(existingJWT.jwt)
        const { jwtToken } = await authenticate(signer)
        setCookie(COOKIE_JWT_TOKEN, jwtToken, {
          ...COOKIE_OPTIONS,
          ...jwtValidity(jwtToken),
        })
      } catch {
        deactivate()
      }
    },
    [authenticate, setCookie, setAuthenticationToken, cookies, deactivate],
  )

  const client = useMemo(
    () =>
      new ApolloClient({
        uri: environment.GRAPHQL_URL,
        headers: cookies[COOKIE_JWT_TOKEN]
          ? {
              authorization: 'Bearer ' + cookies[COOKIE_JWT_TOKEN],
            }
          : {},
        cache: new InMemoryCache({
          typePolicies: {
            Account: {
              keyFields: ['address'],
            },
          },
        }).restore(props.cache),
        ssrMode: typeof window === 'undefined',
      }),
    [cookies, props.cache],
  )

  useEffect(() => {
    if (!ready) return
    if (!signer) return void clearAuthenticationToken()
    authenticateSigner(signer).catch(clearAuthenticationToken)
  }, [signer, ready, authenticateSigner, clearAuthenticationToken])

  return <ApolloProvider client={client}>{props.children}</ApolloProvider>
}

function MyApp({
  Component,
  pageProps,
}: AppProps<PropsWithUserAndState>): JSX.Element {
  const router = useRouter()
  dayjs.locale(router.locale)
  usePageViews()

  useEffect(() => {
    const handleStart = () => NProgress.start()
    const handleStop = () => NProgress.done()

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleStop)
    router.events.on('routeChangeError', handleStop)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleStop)
      router.events.off('routeChangeError', handleStop)
    }
  }, [router])

  if (environment.BUGSNAG_API_KEY) {
    Bugsnag.start({
      apiKey: environment.BUGSNAG_API_KEY,
      plugins: [new BugsnagPluginReact(React)],
    })
  }
  const ErrorBoundary = environment.BUGSNAG_API_KEY
    ? (Bugsnag.getPlugin('react')?.createErrorBoundary(React) as ComponentType)
    : Fragment

  return (
    <ErrorBoundary>
      <Head
        title="MemeLand NFT Marketplace"
        description="Bring Ownership to Every Community in the World."
      >
        <meta
          name="keywords"
          content="NFT, marketplace, platform, white-label, blockchain"
        />

        <meta name="author" content="MemeLand" />
        <meta name="application-name" content="MemeLand NFT Marketplace" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://memeland.liteflow.com" />

        <meta name="twitter:card" content="summary" />
      </Head>
      <GoogleAnalytics strategy="lazyOnload" />
      <Web3ReactProvider getLibrary={web3Provider}>
        <CookiesProvider>
          <ChakraProvider theme={theme}>
            <LiteflowProvider endpoint={environment.GRAPHQL_URL}>
              <AccountProvider cache={pageProps[APOLLO_STATE_PROP_NAME]}>
                <Layout userAddress={pageProps?.user?.address || null}>
                  <Component {...pageProps} />
                </Layout>
              </AccountProvider>
            </LiteflowProvider>
          </ChakraProvider>
        </CookiesProvider>
      </Web3ReactProvider>
    </ErrorBoundary>
  )
}
export default MyApp
