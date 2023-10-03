import {
  AspectRatio,
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react'
import { BigNumber } from '@ethersproject/bignumber'
import { HiClock } from '@react-icons/all-files/hi/HiClock'
import { HiOutlineDotsHorizontal } from '@react-icons/all-files/hi/HiOutlineDotsHorizontal'
import Countdown from 'components/Countdown/Countdown'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo, useState } from 'react'
import useDetectAssetMedia from '../../hooks/useDetectAssetMedia'
import useEnvironment from '../../hooks/useEnvironment'
import Image from '../Image/Image'
import Link from '../Link/Link'
import SaleAuctionCardFooter from '../Sales/Auction/CardFooter'
import SaleDirectCardFooter from '../Sales/Direct/CardFooter'
import SaleOpenCardFooter from '../Sales/Open/CardFooter'
import Avatar from '../User/Avatar'
import TokenMedia from './Media'

export type Props = {
  asset: {
    id: string
    name: string
    collection: {
      address: string
      name: string
      chainId: number
    }
    image: string
    unlockedContent: { url: string; mimetype: string | null } | null
    animationUrl: string | null | undefined
    owned: BigNumber
    bestBid:
      | {
          unitPrice: BigNumber
          currency: {
            decimals: number
            symbol: string
          }
        }
      | undefined
  }
  creator: {
    address: string
    name: string | null | undefined
    image: string | null | undefined
    verified: boolean
  }
  auction:
    | {
        endAt: Date
        bestBid:
          | {
              unitPrice: BigNumber
              currency: {
                decimals: number
                symbol: string
              }
            }
          | undefined
      }
    | undefined
  sale:
    | {
        id: string
        unitPrice: BigNumber
        currency: {
          decimals: number
          symbol: string
        }
      }
    | undefined
  numberOfSales: number
  displayCreator?: boolean
  hasMultiCurrency: boolean
}

const TokenCard: FC<Props> = ({
  asset,
  creator,
  auction,
  sale,
  numberOfSales,
  displayCreator = false,
  hasMultiCurrency,
}) => {
  const { CHAINS, REPORT_EMAIL } = useEnvironment()
  const { t } = useTranslation('templates')
  const isOwner = useMemo(() => asset.owned.gt('0'), [asset])
  const [isHovered, setIsHovered] = useState(false)
  const media = useDetectAssetMedia(asset)

  const chainName = useMemo(
    () => CHAINS.find((x) => x.id === asset.collection.chainId)?.name,
    [asset.collection.chainId, CHAINS],
  )

  const footer = useMemo(() => {
    if (auction)
      return (
        <SaleAuctionCardFooter
          assetId={asset.id}
          bestBid={auction.bestBid}
          isOwner={isOwner}
          showButton={isHovered}
        />
      )
    if (sale)
      return (
        <SaleDirectCardFooter
          saleId={sale.id}
          unitPrice={sale.unitPrice}
          currency={sale.currency}
          numberOfSales={numberOfSales}
          hasMultiCurrency={hasMultiCurrency}
          isOwner={isOwner}
          showButton={isHovered}
        />
      )
    return (
      <SaleOpenCardFooter
        assetId={asset.id}
        bestBid={asset.bestBid}
        isOwner={isOwner}
        showButton={isHovered}
      />
    )
  }, [
    auction,
    asset.id,
    asset.bestBid,
    isOwner,
    isHovered,
    sale,
    numberOfSales,
    hasMultiCurrency,
  ])

  // TODO: is the width correct?
  return (
    <Flex
      direction="column"
      w="full"
      align="stretch"
      overflow="hidden"
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.200"
      shadow="sm"
      bgColor="white"
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Flex as={Link} href={`/tokens/${asset.id}`} w="full" position="relative">
        <AspectRatio w="full" ratio={1}>
          {media.media?.url ? (
            <TokenMedia
              {...media}
              defaultText={asset.name}
              fill
              sizes="
            (min-width: 80em) 292px,
            (min-width: 62em) 25vw,
            (min-width: 48em) 33vw,
            (min-width: 30em) 50vw,
            100vw"
            />
          ) : (
            <Box bg="brand.50" />
          )}
        </AspectRatio>
        {auction && (
          <HStack
            position="absolute"
            left={4}
            right={4}
            bottom={4}
            bgColor="white"
            rounded="full"
            justify="center"
            spacing={1}
            px={4}
            py={0.5}
          >
            <Icon as={HiClock} h={5} w={5} color="gray.500" />
            <Text as="span" variant="subtitle2" color="gray.500">
              <Countdown date={auction.endAt} hideSeconds />
            </Text>
          </HStack>
        )}
      </Flex>
      {isHovered && (
        <Flex
          rounded="full"
          position="absolute"
          top={4}
          left={4}
          title={chainName}
          cursor="pointer"
          overflow="hidden"
          filter="grayscale(100%)"
        >
          <Image
            src={`/chains/${asset.collection.chainId}.svg`}
            alt={asset.collection.chainId.toString()}
            width={24}
            height={24}
            w={6}
            h={6}
          />
        </Flex>
      )}
      <Flex justify="space-between" px={4} pt={4} pb={3} gap={2} align="start">
        <Stack spacing={0} w="full" overflow="hidden">
          {displayCreator ? (
            <Avatar
              address={creator.address}
              image={creator.image}
              name={creator.name}
              verified={creator.verified}
              size={5}
            />
          ) : (
            <Link
              href={`/collection/${asset.collection.chainId}/${asset.collection.address}`}
            >
              <Text variant="subtitle2" color="gray.500" isTruncated>
                {asset.collection.name}
              </Text>
            </Link>
          )}
          <Link href={`/tokens/${asset.id}`}>
            <Heading
              as="h4"
              variant="heading2"
              color="brand.black"
              title={asset.name}
              isTruncated
            >
              {asset.name}
            </Heading>
          </Link>
        </Stack>
        <Box display={isHovered ? 'block' : 'none'}>
          <Menu>
            <MenuButton>
              <Icon as={HiOutlineDotsHorizontal} />
            </MenuButton>
            <MenuList>
              <Link
                href={`mailto:${REPORT_EMAIL}?subject=${encodeURI(
                  t('asset.detail.menu.report.subject'),
                )}&body=${encodeURI(
                  t('asset.detail.menu.report.body', asset),
                )}`}
                isExternal
              >
                <MenuItem>{t('asset.detail.menu.report.label')}</MenuItem>
              </Link>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
      {footer && footer}
    </Flex>
  )
}

export default TokenCard
