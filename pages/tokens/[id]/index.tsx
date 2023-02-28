import {
  AspectRatio,
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Stack,
  Switch,
  Tab,
  TabList,
  Tabs,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { formatError } from '@nft/hooks'
import { FaInfoCircle } from '@react-icons/all-files/fa/FaInfoCircle'
import { HiOutlineDotsHorizontal } from '@react-icons/all-files/hi/HiOutlineDotsHorizontal'
import { HiOutlineExternalLink } from '@react-icons/all-files/hi/HiOutlineExternalLink'
import useRefreshAsset from 'hooks/useRefreshAsset'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import invariant from 'ts-invariant'
import BidList from '../../../components/Bid/BidList'
import Head from '../../../components/Head'
import HistoryList from '../../../components/History/HistoryList'
import ChakraLink from '../../../components/Link/Link'
import SaleDetail from '../../../components/Sales/Detail'
import TokenMedia from '../../../components/Token/Media'
import TokenMetadata from '../../../components/Token/Metadata'
import TraitList from '../../../components/Trait/TraitList'
import {
  convertAuctionFull,
  convertBidFull,
  convertHistories,
  convertOwnership,
  convertSaleFull,
  convertTraits,
  convertUser,
} from '../../../convert'
import environment from '../../../environment'
import {
  AddressFilter,
  ChainCurrenciesDocument,
  ChainCurrenciesQuery,
  ChainCurrenciesQueryVariables,
  CurrencyFilter,
  FetchAssetDocument,
  FetchAssetIdFromTokenIdDocument,
  FetchAssetIdFromTokenIdQuery,
  FetchAssetIdFromTokenIdQueryVariables,
  FetchAssetQuery,
  IntFilter,
  useFetchAssetQuery,
} from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useChainCurrencies from '../../../hooks/useChainCurrencies'
import useEagerConnect from '../../../hooks/useEagerConnect'
import useNow from '../../../hooks/useNow'
import useSigner from '../../../hooks/useSigner'
import LargeLayout from '../../../layouts/large'
import { wrapServerSideProps } from '../../../props'

type Props = {
  assetId: string
  now: string
  currentAccount: string | null
  meta: {
    title: string
    description: string
    image: string
  }
}

enum AssetTabs {
  bids = 'bids',
  history = 'history',
}

export const getServerSideProps = wrapServerSideProps<Props>(
  environment.GRAPHQL_URL,
  async (ctx, client) => {
    const now = new Date()
    const assetId = ctx.params?.id
      ? Array.isArray(ctx.params.id)
        ? ctx.params.id[0]
        : ctx.params.id
      : null
    invariant(assetId, 'assetId is falsy')

    // check if assetId is only a tokenId
    if (!assetId.includes('-')) {
      const { data, error } = await client.query<
        FetchAssetIdFromTokenIdQuery,
        FetchAssetIdFromTokenIdQueryVariables
      >({
        query: FetchAssetIdFromTokenIdDocument,
        variables: { tokenId: assetId },
      })
      if (error) throw error
      const fullAssetId = data.assets?.nodes.at(0)
      if (!fullAssetId) return { notFound: true }
      return {
        redirect: {
          permanent: true,
          destination: `/tokens/${fullAssetId.id}`,
        },
      }
    }

    const { data, error } = await client.query<FetchAssetQuery>({
      query: FetchAssetDocument,
      variables: {
        id: assetId,
        now,
        address: ctx.user.address || '',
      },
    })
    if (error) throw error
    if (!data.asset) return { notFound: true }
    const chainCurrency = await client.query<
      ChainCurrenciesQuery,
      ChainCurrenciesQueryVariables
    >({
      query: ChainCurrenciesDocument,
      variables: {
        filter: {
          chainId: { equalTo: data.asset.collection.chainId } as IntFilter,
          address: { isNull: false } as AddressFilter,
        } as CurrencyFilter,
      },
    })
    if (chainCurrency.error) throw chainCurrency.error
    return {
      props: {
        now: now.toJSON(),
        assetId,
        currentAccount: ctx.user.address,
        meta: {
          title: data.asset.name,
          description: data.asset.description,
          image: data.asset.image,
        },
      },
    }
  },
)

const DetailPage: NextPage<Props> = ({
  currentAccount,
  assetId,
  now: nowProp,
  meta,
}) => {
  const ready = useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const toast = useToast()
  const { address } = useAccount()
  const { query } = useRouter()
  const [showPreview, setShowPreview] = useState(false)

  const date = useMemo(() => new Date(nowProp), [nowProp])
  const { data, refetch } = useFetchAssetQuery({
    variables: {
      id: assetId,
      now: date,
      address: (ready ? address : currentAccount) || '',
    },
  })
  const chainCurrency = useChainCurrencies(data?.asset?.collection.chainId, {
    onlyERC20: true,
  })

  const asset = useMemo(() => data?.asset, [data])
  const currencies = useMemo(
    () => chainCurrency.data?.currencies?.nodes || [],
    [chainCurrency],
  )

  const blockExplorer = useBlockExplorer(asset?.collection.chainId)

  const totalOwned = useMemo(
    () => BigNumber.from(asset?.owned.aggregates?.sum?.quantity || '0'),
    [asset],
  )
  const isOwner = useMemo(() => totalOwned.gt('0'), [totalOwned])
  const ownAllSupply = useMemo(
    () =>
      totalOwned.gte(
        BigNumber.from(asset?.ownerships.aggregates?.sum?.quantity || '0'),
      ),
    [asset, totalOwned],
  )
  const isSingle = useMemo(
    () => asset?.collection.standard === 'ERC721',
    [asset],
  )

  const tabs = [
    {
      title: t('asset.detail.tabs.bids'),
      href: `/tokens/${assetId}?filter=bids`,
      type: AssetTabs.bids,
    },
    {
      title: t('asset.detail.tabs.history'),
      href: `/tokens/${assetId}?filter=history`,
      type: AssetTabs.history,
    },
  ]

  const traits = useMemo(
    () =>
      asset &&
      asset.traits.nodes.length > 0 &&
      asset.collection.traits &&
      convertTraits(asset),
    [asset],
  )

  const defaultIndex = query.filter
    ? tabs.findIndex((tab) => tab.type === query.filter)
    : 0

  const assetExternalURL = useMemo(() => {
    if (!asset) return ''
    return blockExplorer.token(asset.collectionAddress, asset.tokenId)
  }, [asset, blockExplorer])

  const now = useNow()
  const activeAuction = useMemo(() => {
    const auction = asset?.auctions.nodes[0]
    if (!auction) return
    // check if auction is expired
    if (new Date(auction.expireAt) <= now) return
    // check if auction has a winning offer
    if (!!auction.winningOffer?.id) return
    return auction
  }, [asset, now])

  const bids = useMemo(() => {
    if (!asset) return []
    return activeAuction
      ? activeAuction.offers.nodes.map(convertBidFull)
      : asset.bids.nodes.length > 0
      ? asset.bids.nodes.map(convertBidFull)
      : []
  }, [activeAuction, asset])

  const directSales = useMemo(
    () => asset?.sales.nodes.map(convertSaleFull) || [],
    [asset],
  )

  const auction = useMemo(
    () =>
      asset?.auctions.nodes.map((auction) => convertAuctionFull(auction))[0],
    [asset],
  )

  const bestBid = useMemo(
    () => asset?.auctions.nodes[0]?.offers.nodes.map(convertBidFull)[0],
    [asset],
  )

  const creator = useMemo(
    () =>
      asset ? convertUser(asset.creator, asset.creator.address) : undefined,
    [asset],
  )

  const owners = useMemo(
    () => asset?.ownerships.nodes.map(convertOwnership) || [],
    [asset],
  )

  const histories = useMemo(
    () => asset?.histories.nodes.map(convertHistories) || [],
    [asset],
  )

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  const refreshAsset = useRefreshAsset()
  const refreshMetadata = useCallback(
    async (assetId: string) => {
      try {
        await refreshAsset(assetId)
        await refetch()
        toast({
          title: 'Successfully refreshed metadata',
          status: 'success',
        })
      } catch (e) {
        toast({
          title: formatError(e),
          status: 'error',
        })
      }
    },
    [refetch, refreshAsset, toast],
  )

  if (!asset) return <></>
  return (
    <LargeLayout>
      <Head
        title={meta.title}
        description={meta.description}
        image={meta.image}
      />
      <SimpleGrid spacing={6} columns={{ md: 2 }}>
        <AspectRatio ratio={1}>
          <Center
            flexDirection="column"
            rounded={{ md: 'xl' }}
            p={12}
            bg="brand.50"
          >
            <TokenMedia
              image={asset.image}
              animationUrl={asset.animationUrl}
              unlockedContent={showPreview ? undefined : asset.unlockedContent}
              defaultText={asset.name}
              controls
              sizes="
              (min-width: 80em) 500px,
              (min-width: 48em) 50vw,
              100vw"
            />
            {asset.hasUnlockableContent && (
              <Flex
                w="full"
                mt={3}
                direction={{ base: 'column', lg: 'row' }}
                justify={{
                  base: 'center',
                  lg: isOwner ? 'space-between' : 'center',
                }}
                align="center"
                gap={4}
              >
                <Flex align="center" gap={1.5}>
                  <Heading as="h3" variant="heading3" color="brand.black">
                    {t('asset.detail.unlockable.title')}
                  </Heading>
                  <Tooltip
                    label={
                      <Text as="span" variant="caption" color="brand.black">
                        {t('asset.detail.unlockable.tooltip')}
                      </Text>
                    }
                    placement="top"
                    rounded="xl"
                    shadow="lg"
                    p={3}
                    bg="white"
                  >
                    <span>
                      <Icon
                        as={FaInfoCircle}
                        color="gray.400"
                        h={4}
                        w={4}
                        cursor="pointer"
                      />
                    </span>
                  </Tooltip>
                </Flex>
                {isOwner && (
                  <Flex as={FormControl} w="auto" align="center">
                    <FormLabel mb={0} htmlFor="show-preview">
                      <Heading as="h3" variant="heading3" color="brand.black">
                        {t('asset.detail.show-preview')}
                      </Heading>
                    </FormLabel>
                    <Switch
                      id="show-preview"
                      isChecked={showPreview}
                      onChange={(event) => setShowPreview(event.target.checked)}
                    />
                  </Flex>
                )}
              </Flex>
            )}
          </Center>
        </AspectRatio>
        <Flex direction="column" my="auto" gap={8} p={{ base: 6, md: 0 }}>
          <Flex justify="space-between">
            <Stack spacing={1}>
              {asset.collection.name && (
                <Heading as="p" variant="heading1" color="gray.500">
                  <Link
                    href={`/collection/${asset.collection.chainId}/${asset.collection.address}`}
                  >
                    {asset.collection.name}
                  </Link>
                </Heading>
              )}
              <Heading
                as="h1"
                variant="title"
                color="brand.black"
                wordBreak="break-word"
              >
                {asset.name}
              </Heading>
            </Stack>
            <Flex direction="row" align="flex-start" gap={3}>
              <Menu>
                <MenuButton
                  as={IconButton}
                  variant="outline"
                  colorScheme="gray"
                  rounded="full"
                  aria-label="activator"
                  icon={<Icon as={HiOutlineDotsHorizontal} w={5} h={5} />}
                />
                <MenuList>
                  <MenuItem onClick={() => refreshMetadata(asset.id)}>
                    {t('asset.detail.menu.refresh-metadata')}
                  </MenuItem>
                  <ChakraLink
                    href={`mailto:${
                      environment.REPORT_EMAIL
                    }?subject=${encodeURI(
                      t('asset.detail.menu.report.subject'),
                    )}&body=${encodeURI(
                      t('asset.detail.menu.report.body', asset),
                    )}`}
                    isExternal
                  >
                    <MenuItem>{t('asset.detail.menu.report.label')}</MenuItem>
                  </ChakraLink>
                </MenuList>
              </Menu>
            </Flex>
          </Flex>

          <TokenMetadata
            assetId={asset.id}
            creator={creator}
            owners={owners}
            numberOfOwners={asset.ownerships.totalCount}
            saleSupply={BigNumber.from(
              asset.sales.aggregates?.sum?.availableQuantity || 0,
            )}
            standard={asset.collection.standard}
            totalSupply={BigNumber.from(
              asset.ownerships.aggregates?.sum?.quantity || '0',
            )}
          />
          <SaleDetail
            assetId={asset.id}
            chainId={asset.collection.chainId}
            blockExplorer={blockExplorer}
            currencies={currencies}
            signer={signer}
            currentAccount={address}
            isSingle={isSingle}
            isHomepage={false}
            isOwner={isOwner}
            auction={auction}
            bestBid={bestBid}
            directSales={directSales}
            ownAllSupply={ownAllSupply}
            onOfferCanceled={refresh}
            onAuctionAccepted={refresh}
          />
        </Flex>

        <Box p={6}>
          <Heading as="h4" variant="heading2" color="brand.black">
            {t('asset.detail.description')}
          </Heading>
          <Text as="p" variant="text-sm" color="gray.500" mt={3}>
            {asset.description}
          </Text>

          <Stack as="nav" mt={8} align="flex-start" spacing={3}>
            <Button
              as={Link}
              href={assetExternalURL}
              isExternal
              variant="outline"
              colorScheme="gray"
              width={48}
              justifyContent="space-between"
              rightIcon={<HiOutlineExternalLink />}
            >
              <Text as="span" isTruncated>
                {t('asset.detail.explorerLink', blockExplorer)}
              </Text>
            </Button>

            <Button
              as={Link}
              href={asset.image}
              isExternal
              variant="outline"
              colorScheme="gray"
              width={48}
              justifyContent="space-between"
              rightIcon={<HiOutlineExternalLink />}
            >
              <Text as="span" isTruncated>
                {t('asset.detail.ipfsLink')}
              </Text>
            </Button>
          </Stack>

          {traits && (
            <Box pt={8}>
              <Heading as="h4" variant="heading2" color="brand.black" pb={3}>
                {t('asset.detail.traits')}
              </Heading>
              <TraitList traits={traits} />
            </Box>
          )}
        </Box>

        <div>
          <Tabs
            isManual
            defaultIndex={defaultIndex}
            colorScheme="brand"
            overflowX="auto"
            overflowY="hidden"
          >
            <TabList>
              {tabs.map((tab, index) => (
                <ChakraLink
                  key={index}
                  href={tab.href}
                  whiteSpace="nowrap"
                  mr={4}
                >
                  <Tab>
                    <Text as="span" variant="subtitle1">
                      {tab.title}
                    </Text>
                  </Tab>
                </ChakraLink>
              ))}
            </TabList>
          </Tabs>
          <Box h={96} overflowY="auto" py={6}>
            {(!query.filter || query.filter === AssetTabs.bids) && (
              <BidList
                bids={bids}
                chainId={asset.collection.chainId}
                signer={signer}
                account={address}
                isSingle={isSingle}
                blockExplorer={blockExplorer}
                preventAcceptation={!isOwner || !!activeAuction}
                onAccepted={refresh}
                onCanceled={refresh}
                totalOwned={totalOwned}
              />
            )}
            {query.filter === AssetTabs.history && (
              <HistoryList
                histories={histories}
                blockExplorer={blockExplorer}
              />
            )}
          </Box>
        </div>
      </SimpleGrid>
    </LargeLayout>
  )
}

export default DetailPage
