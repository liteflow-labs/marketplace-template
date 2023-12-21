import { Button, Flex, Text } from '@chakra-ui/react'
import { HiArrowNarrowRight } from '@react-icons/all-files/hi/HiArrowNarrowRight'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import useAccount from '../../../hooks/useAccount'
import { isSameAddress } from '../../../utils'
import Link from '../../Link/Link'
import type { Props as ModalProps } from './Modal'
import SaleDirectModal from './Modal'

export type Props = {
  assetId: string
  chainId: number
  isHomepage: boolean
  sales: ModalProps['sales']
  ownAllSupply: boolean
  onOfferCanceled: (id: string) => Promise<void>
}

const SaleDirectButton: FC<Props> = ({
  assetId,
  chainId,
  isHomepage,
  sales,
  ownAllSupply,
  onOfferCanceled,
}) => {
  const { address } = useAccount()
  const { t } = useTranslation('components')
  const bid = useMemo(() => {
    if (ownAllSupply) return
    return (
      <Button
        as={Link}
        href={`/tokens/${assetId}/bid`}
        variant="outline"
        colorScheme="gray"
        size="lg"
        width="full"
      >
        <Text as="span" isTruncated>
          {t('sales.direct.button.place-bid')}
        </Text>
      </Button>
    )
  }, [ownAllSupply, assetId, t])

  const buyNow = useMemo(() => {
    if (sales.length !== 1) return
    const sale = sales[0]
    if (!sale) return
    if (address && isSameAddress(sale.maker.address, address)) return
    if (ownAllSupply) return
    return (
      <Button as={Link} href={`/checkout/${sale.id}`} size="lg" width="full">
        <Text as="span" isTruncated>
          {t('sales.direct.button.buy')}
        </Text>
      </Button>
    )
  }, [sales, ownAllSupply, t, address])

  const seeOffers = useMemo(() => {
    if (sales.length <= 1) return
    return (
      <SaleDirectModal
        chainId={chainId}
        sales={sales}
        onOfferCanceled={onOfferCanceled}
      />
    )
  }, [chainId, sales, onOfferCanceled])

  if (ownAllSupply && isHomepage)
    return (
      <Button
        as={Link}
        href={`/tokens/${assetId}`}
        variant="outline"
        colorScheme="gray"
        bgColor="white"
        width="full"
        rightIcon={<HiArrowNarrowRight />}
      >
        <Text as="span" isTruncated>
          {t('sales.direct.button.view')}
        </Text>
      </Button>
    )

  if (!bid && !buyNow && !seeOffers) return null

  return (
    <Flex gap={6} direction={{ base: 'column', md: 'row' }}>
      {bid}
      {buyNow}
      {seeOffers}
    </Flex>
  )
}

export default SaleDirectButton
