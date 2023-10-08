import {
  AspectRatio,
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { FC, useMemo } from 'react'
import { convertAuctionFull, convertBid, convertSaleFull } from '../../convert'
import { FetchFeaturedAssetsQuery } from '../../graphql'
import useDetectAssetMedia from '../../hooks/useDetectAssetMedia'
import Link from '../Link/Link'
import SaleDetail from '../Sales/Detail'
import TokenMedia from '../Token/Media'
import TokenMetadata from '../Token/Metadata'

export type Props = {
  asset: NonNullable<FetchFeaturedAssetsQuery['assets']>['nodes'][0]
  currencies: {
    chainId: number
    image: string
  }[]
  isHomepage: boolean
  onOfferCanceled: (id: string) => Promise<void>
  onAuctionAccepted: (id: string) => Promise<void>
}

const TokenHeader: FC<Props> = ({
  asset,
  currencies,
  isHomepage,
  onOfferCanceled,
  onAuctionAccepted,
}) => {
  const media = useDetectAssetMedia(asset)

  const auction = useMemo(
    () =>
      asset.auctions.nodes[0]
        ? convertAuctionFull(asset.auctions.nodes[0])
        : undefined,
    [asset],
  )
  const bestAuctionBid = useMemo(
    () =>
      asset.auctions.nodes[0]?.bestBid?.nodes[0]
        ? convertBid(asset.auctions.nodes[0]?.bestBid?.nodes[0])
        : undefined,
    [asset],
  )
  const isOwner = useMemo(
    () => BigNumber.from(asset.owned?.quantity).gt('0'),
    [asset],
  )
  const isSingle = useMemo(
    () => asset.collection.standard === 'ERC721',
    [asset],
  )
  const ownAllSupply = useMemo(
    () => BigNumber.from(asset.owned?.quantity).gte(asset.quantity),
    [asset],
  )
  const sales = useMemo(() => asset.sales.nodes.map(convertSaleFull), [asset])

  const chainCurrencies = useMemo(
    () =>
      currencies.filter(
        (currency) => currency.chainId === asset.collection.chainId,
      ),
    [currencies, asset],
  )

  return (
    <SimpleGrid spacing={4} flex="0 0 100%" columns={{ base: 0, md: 2 }}>
      <Box my="auto" p={{ base: 6, md: 12 }} textAlign="center">
        <Flex
          as={Link}
          href={`/tokens/${asset.id}`}
          mx="auto"
          maxH="sm"
          w="full"
          h="full"
          maxW="sm"
          align="center"
          justify="center"
          overflow="hidden"
          rounded="lg"
          shadow="md"
        >
          <AspectRatio w="full" ratio={1}>
            <TokenMedia
              {...media}
              defaultText={asset.name}
              fill
              sizes="
              (min-width: 30em) 384px,
              100vw"
            />
          </AspectRatio>
        </Flex>
      </Box>
      <Stack spacing={8} p={{ base: 6, md: 12 }}>
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
          <Heading as="h1" variant="title" color="brand.black">
            {asset.name}
          </Heading>
        </Stack>
        <TokenMetadata asset={asset} />
        <SaleDetail
          assetId={asset.id}
          chainId={asset.collection.chainId}
          currencies={chainCurrencies}
          isHomepage={isHomepage}
          isOwner={isOwner}
          isSingle={isSingle}
          ownAllSupply={ownAllSupply}
          auction={auction}
          bestAuctionBid={bestAuctionBid}
          directSales={sales}
          onOfferCanceled={onOfferCanceled}
          onAuctionAccepted={onAuctionAccepted}
        />
      </Stack>
    </SimpleGrid>
  )
}

export default TokenHeader
