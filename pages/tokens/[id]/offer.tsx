import {
  Box,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  useRadioGroup,
  useToast,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { isSameAddress } from '@nft/hooks'
import { AiOutlineDollarCircle } from '@react-icons/all-files/ai/AiOutlineDollarCircle'
import { HiOutlineClock } from '@react-icons/all-files/hi/HiOutlineClock'
import { NextPage } from 'next'
import getT from 'next-translate/getT'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import invariant from 'ts-invariant'
import Head from '../../../components/Head'
import BackButton from '../../../components/Navbar/BackButton'
import Radio from '../../../components/Radio/Radio'
import SalesAuctionForm from '../../../components/Sales/Auction/Form'
import SalesDirectForm from '../../../components/Sales/Direct/Form'
import TokenCard from '../../../components/Token/Card'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertSale,
  convertUser,
} from '../../../convert'
import environment from '../../../environment'
import {
  ChainCurrenciesDocument,
  ChainCurrenciesQuery,
  ChainCurrenciesQueryVariables,
  CurrencyFilter,
  FeesForOfferDocument,
  FeesForOfferQuery,
  IntFilter,
  OfferForAssetDocument,
  OfferForAssetQuery,
  useFeesForOfferQuery,
  useOfferForAssetQuery,
} from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useBlockExplorer from '../../../hooks/useBlockExplorer'
import useChainCurrencies from '../../../hooks/useChainCurrencies'
import useEagerConnect from '../../../hooks/useEagerConnect'
import useLoginRedirect from '../../../hooks/useLoginRedirect'
import useSigner from '../../../hooks/useSigner'
import SmallLayout from '../../../layouts/small'
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

enum SaleType {
  FIXED_PRICE = 'FIXED_PRICE',
  TIMED_AUCTION = 'TIMED_AUCTION',
}

type SaleOption = {
  value: SaleType
  label: string
  icon: any
}

export const getServerSideProps = wrapServerSideProps<Props>(
  environment.GRAPHQL_URL,
  async (ctx, client) => {
    const t = await getT(ctx.locale, 'templates')
    const assetId = ctx.params?.id
      ? Array.isArray(ctx.params.id)
        ? ctx.params.id[0]
        : ctx.params.id
      : null
    invariant(assetId, 'assetId is falsy')
    const now = new Date()
    const { data, error } = await client.query<OfferForAssetQuery>({
      query: OfferForAssetDocument,
      variables: {
        id: assetId,
        address: ctx.user.address || '',
        now,
      },
    })
    if (error) throw error
    if (!data.asset) return { notFound: true }
    const feeQuery = await client.query<FeesForOfferQuery>({
      query: FeesForOfferDocument,
      variables: { id: assetId },
    })
    if (feeQuery.error) throw error
    const chainCurrency = await client.query<
      ChainCurrenciesQuery,
      ChainCurrenciesQueryVariables
    >({
      query: ChainCurrenciesDocument,
      variables: {
        filter: {
          chainId: { equalTo: data.asset.chainId } as IntFilter,
        } as CurrencyFilter,
      },
    })
    if (chainCurrency.error) throw chainCurrency.error
    if (!chainCurrency.data) return { notFound: true }
    return {
      props: {
        assetId,
        now: now.toJSON(),
        currentAccount: ctx.user.address,
        meta: {
          title: t('offers.form.meta.title', data.asset),
          description: t('offers.form.meta.description', data.asset),
          image: data.asset.image,
        },
      },
    }
  },
)

const OfferPage: NextPage<Props> = ({ currentAccount, now, assetId, meta }) => {
  const ready = useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { back, push } = useRouter()
  const toast = useToast()
  const { address } = useAccount()
  useLoginRedirect(ready)

  const date = useMemo(() => new Date(now), [now])
  const { data } = useOfferForAssetQuery({
    variables: {
      id: assetId,
      now: date,
      address: (ready ? address : currentAccount) || '',
    },
  })

  const blockExplorer = useBlockExplorer(data?.asset?.chainId)

  const currencyRes = useChainCurrencies(data?.asset?.chainId)

  const fees = useFeesForOfferQuery({
    variables: {
      id: assetId,
    },
  })

  const feesPerTenThousand = fees.data?.orderFees.valuePerTenThousand || 0

  const royaltiesPerTenThousand =
    data?.asset?.royalties.reduce((sum, { value }) => sum + value, 0) || 0

  const asset = useMemo(() => data?.asset, [data])

  const quantityAvailable = useMemo(
    () => BigNumber.from(asset?.owned.aggregates?.sum?.quantity || '0'),
    [asset],
  )

  const isCreator =
    asset && address
      ? isSameAddress(asset.creator.address.toLowerCase(), address)
      : false

  const currencies = useMemo(
    () => currencyRes.data?.currencies?.nodes || [],
    [currencyRes],
  )

  const saleOptions: [SaleOption, SaleOption] = useMemo(
    () => [
      {
        value: SaleType.FIXED_PRICE,
        label: t('offers.form.options.values.fixed'),
        icon: AiOutlineDollarCircle,
      },
      {
        value: SaleType.TIMED_AUCTION,
        label: t('offers.form.options.values.auction'),
        icon: HiOutlineClock,
        disabled: asset?.collection.standard !== 'ERC721',
      },
    ],
    [asset, t],
  )

  const [sale, setSale] = useState<SaleType>(saleOptions[0].value)

  const { getRadioProps, getRootProps } = useRadioGroup({
    defaultValue: sale,
    onChange: (e: any) => setSale(e.toString() as SaleType),
  })

  const onCreated = useCallback(async () => {
    toast({
      title: t('offers.form.notifications.created'),
      status: 'success',
    })
    await push(`/tokens/${assetId}`)
  }, [toast, t, push, assetId])

  const saleForm = useMemo(() => {
    if (!currencies) return
    if (!asset) return
    if (sale === SaleType.FIXED_PRICE)
      return (
        <SalesDirectForm
          assetId={assetId}
          chainId={asset.chainId}
          standard={asset.collection.standard}
          currencies={currencies}
          blockExplorer={blockExplorer}
          feesPerTenThousand={feesPerTenThousand}
          royaltiesPerTenThousand={royaltiesPerTenThousand}
          quantityAvailable={quantityAvailable}
          signer={signer}
          isCreator={isCreator}
          offerValidity={environment.OFFER_VALIDITY_IN_SECONDS}
          onCreated={onCreated}
        />
      )
    if (sale === SaleType.TIMED_AUCTION)
      return (
        <SalesAuctionForm
          signer={signer}
          assetId={asset.id}
          currencies={currencies.filter((c) => c.address)} // Keep only non-native currency for bids on auction
          auctionValidity={environment.AUCTION_VALIDITY_IN_SECONDS}
          onCreated={onCreated}
        />
      )
    throw new Error('invalid sale')
  }, [
    currencies,
    asset,
    sale,
    assetId,
    blockExplorer,
    feesPerTenThousand,
    royaltiesPerTenThousand,
    quantityAvailable,
    signer,
    isCreator,
    onCreated,
  ])

  if (!asset) return <></>
  return (
    <SmallLayout>
      <Head
        title={meta.title}
        description={meta.description}
        image={meta.image}
      />

      <BackButton onClick={back} />
      <Heading as="h1" variant="title" color="brand.black" my={12}>
        {t('offers.form.title')}
      </Heading>

      <Grid
        mt={12}
        mb={6}
        gap={12}
        templateColumns={{ base: '1fr', md: '1fr 2fr' }}
      >
        <GridItem overflow="hidden">
          <Box pointerEvents="none">
            <TokenCard
              asset={convertAsset(asset)}
              creator={convertUser(asset.creator, asset.creator.address)}
              sale={convertSale(asset.firstSale.nodes[0])}
              auction={
                asset.auctions.nodes[0]
                  ? convertAuctionWithBestBid(asset.auctions.nodes[0])
                  : undefined
              }
              numberOfSales={asset.firstSale.totalCount}
              hasMultiCurrency={
                parseInt(
                  asset.currencySales.aggregates?.distinctCount?.currencyId,
                  10,
                ) > 1
              }
            />
          </Box>
        </GridItem>
        <GridItem>
          <Flex direction="column" gap={8} grow={1} shrink={1} basis="0%">
            <FormControl>
              <FormLabel>{t('offers.form.options.label')}</FormLabel>
              <FormHelperText mb={2}>
                {sale === SaleType.FIXED_PRICE
                  ? t('offers.form.options.hints.fixed')
                  : t('offers.form.options.hints.auction')}
              </FormHelperText>
              <Flex mt={3} flexWrap="wrap" gap={4} {...getRootProps()}>
                {saleOptions.map((choice, i) => {
                  const radio = getRadioProps({ value: choice.value })
                  return <Radio key={i} choice={choice} {...radio} />
                })}
              </Flex>
            </FormControl>

            {saleForm && saleForm}
          </Flex>
        </GridItem>
      </Grid>
    </SmallLayout>
  )
}

export default OfferPage
