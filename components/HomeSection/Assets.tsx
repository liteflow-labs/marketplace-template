import {
  Button,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertSale,
  convertUser,
} from '../../convert'
import environment from '../../environment'
import {
  useFetchAssetsQuery,
  useFetchDefaultAssetIdsQuery,
} from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import useOrderById from '../../hooks/useOrderById'
import Link from '../Link/Link'
import SkeletonGrid from '../Skeleton/Grid'
import SkeletonTokenCard from '../Skeleton/TokenCard'
import TokenCard from '../Token/Card'

type Props = {
  date: Date
}

const AssetsHomeSection: FC<Props> = ({ date }) => {
  const { address } = useAccount()
  const { t } = useTranslation('templates')
  const defaultAssetQuery = useFetchDefaultAssetIdsQuery({
    variables: { limit: environment.PAGINATION_LIMIT },
    skip: !!environment.HOME_TOKENS,
  })
  useHandleQueryError(defaultAssetQuery)
  const defaultAssetData = useMemo(
    () => defaultAssetQuery.data || defaultAssetQuery.previousData,
    [defaultAssetQuery.data, defaultAssetQuery.previousData],
  )

  const assetIds = useMemo(() => {
    if (environment.HOME_TOKENS) {
      // Pseudo randomize the array based on the date's seconds
      const tokens = [...environment.HOME_TOKENS]

      const seed = date.getTime() / 1000 // convert to seconds as date is currently truncated to the second
      const randomTokens = []
      while (
        tokens.length &&
        randomTokens.length < environment.PAGINATION_LIMIT
      ) {
        // generate random based on seed and length of the remaining tokens array
        // It will change when seed changes (basically every request) and also on each iteration of the loop as length of tokens changes
        const randomIndex = seed % tokens.length
        // remove the element from tokens
        const element = tokens.splice(randomIndex, 1)
        // push the element into the returned array in order
        randomTokens.push(...element)
      }
      return randomTokens
    }
    return (defaultAssetData?.assets?.nodes || []).map((x) => x.id)
  }, [defaultAssetData, date])

  const assetsQuery = useFetchAssetsQuery({
    variables: {
      now: date,
      limit: environment.PAGINATION_LIMIT,
      assetIds: assetIds,
      address: address || '',
    },
  })
  useHandleQueryError(assetsQuery)
  const assetData = useMemo(
    () => assetsQuery.data || assetsQuery.previousData,
    [assetsQuery.data, assetsQuery.previousData],
  )

  const assets = useOrderById(assetIds, assetData?.assets?.nodes)

  if (
    (defaultAssetQuery.loading && !defaultAssetData) ||
    (assetsQuery.loading && !assetData)
  )
    return (
      <Stack spacing={6}>
        <Skeleton noOfLines={1} height={8} width={200} />
        <SkeletonGrid
          items={environment.PAGINATION_LIMIT}
          columns={{ sm: 2, md: 3, lg: 4 }}
        >
          <SkeletonTokenCard />
        </SkeletonGrid>
      </Stack>
    )

  if (assets.length === 0) return null
  return (
    <Stack spacing={6}>
      <Flex flexWrap="wrap" align="center" justify="space-between" gap={4}>
        <Heading as="h2" variant="subtitle" color="brand.black">
          {t('home.nfts.title')}
        </Heading>
        <Link href="/explore">
          <Button
            variant="outline"
            colorScheme="gray"
            rightIcon={<Icon as={HiArrowNarrowRight} h={5} w={5} />}
            iconSpacing="10px"
          >
            <Text as="span" isTruncated>
              {t('home.nfts.explore')}
            </Text>
          </Button>
        </Link>
      </Flex>
      <SimpleGrid flexWrap="wrap" spacing={4} columns={{ sm: 2, md: 3, lg: 4 }}>
        {assets.map((item, i) => (
          <Flex key={i} justify="center" overflow="hidden">
            <TokenCard
              asset={convertAsset(item)}
              creator={convertUser(item.creator, item.creator.address)}
              sale={convertSale(item.firstSale.nodes[0])}
              auction={
                item.auctions.nodes[0]
                  ? convertAuctionWithBestBid(item.auctions.nodes[0])
                  : undefined
              }
              numberOfSales={item.firstSale.totalCount}
              hasMultiCurrency={item.firstSale.totalCurrencyDistinctCount > 1}
            />
          </Flex>
        ))}
      </SimpleGrid>
    </Stack>
  )
}

export default AssetsHomeSection
