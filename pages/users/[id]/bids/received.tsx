import {
  Box,
  Flex,
  Icon,
  Stack,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react'
import { dateFromNow, formatError, useIsLoggedIn } from '@nft/hooks'
import { HiOutlineSearch } from '@react-icons/all-files/hi/HiOutlineSearch'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import AcceptOfferButton from '../../../../components/Button/AcceptOffer'
import Empty from '../../../../components/Empty/Empty'
import Image from '../../../../components/Image/Image'
import Link from '../../../../components/Link/Link'
import Loader from '../../../../components/Loader'
import Pagination from '../../../../components/Pagination/Pagination'
import Price from '../../../../components/Price/Price'
import UserProfileTemplate from '../../../../components/Profile'
import Select from '../../../../components/Select/Select'
import Avatar from '../../../../components/User/Avatar'
import { convertBidFull } from '../../../../convert'
import environment from '../../../../environment'
import {
  OfferOpenBuysOrderBy,
  useFetchUserBidsReceivedQuery,
} from '../../../../graphql'
import useAccount from '../../../../hooks/useAccount'
import useOrderByQuery from '../../../../hooks/useOrderByQuery'
import usePaginate from '../../../../hooks/usePaginate'
import usePaginateQuery from '../../../../hooks/usePaginateQuery'
import useRequiredQueryParamSingle from '../../../../hooks/useRequiredQueryParamSingle'
import useSigner from '../../../../hooks/useSigner'
import LargeLayout from '../../../../layouts/large'

type Props = {
  now: string
}

const BidReceivedPage: NextPage<Props> = ({ now }) => {
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { replace, pathname, query } = useRouter()
  const { address } = useAccount()
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<OfferOpenBuysOrderBy>('CREATED_AT_DESC')
  const [changePage, changeLimit] = usePaginate()
  const toast = useToast()
  const userAddress = useRequiredQueryParamSingle('id')
  const ownerLoggedIn = useIsLoggedIn(userAddress)

  const date = useMemo(() => new Date(now), [now])
  const { data, refetch, loading, previousData } =
    useFetchUserBidsReceivedQuery({
      variables: {
        address: userAddress,
        limit,
        offset,
        orderBy,
        now: date,
      },
    })

  const bidData = useMemo(() => data || previousData, [data, previousData])

  const bids = useMemo(
    () =>
      (bidData?.bids?.nodes || []).map((x) => ({
        ...convertBidFull(x),
        asset: x.asset,
      })),
    [bidData],
  )

  const onAccepted = useCallback(async () => {
    toast({
      title: t('user.bid-received.notifications.accepted'),
      status: 'success',
    })
    await refetch()
  }, [refetch, t, toast])

  const changeOrder = useCallback(
    async (orderBy: any) => {
      await replace({ pathname, query: { ...query, orderBy } })
    },
    [replace, pathname, query],
  )

  return (
    <LargeLayout>
      <UserProfileTemplate
        now={date}
        signer={signer}
        currentAccount={address}
        address={userAddress}
        currentTab="bids"
        loginUrlForReferral={environment.BASE_URL + '/login'}
      >
        <Stack spacing={6}>
          <Flex
            justify={{ md: 'space-between' }}
            align={{ md: 'center' }}
            gap={4}
            direction={{ base: 'column', md: 'row' }}
          >
            <Flex as="nav" gap={2}>
              <Link href={`/users/${userAddress}/bids`}>
                <Tag
                  size="lg"
                  colorScheme="brand"
                  border="1px"
                  borderColor="brand.500"
                  borderRadius="full"
                >
                  <Text as="span" variant="text-sm" color="brand.600">
                    {t('user.bid-received.nav.received')}
                  </Text>
                </Tag>
              </Link>
              <Link href={`/users/${userAddress}/bids/placed`}>
                <Tag
                  size="lg"
                  variant="outline"
                  borderRadius="full"
                  boxShadow="none"
                  border="1px"
                  borderColor="gray.200"
                  _hover={{
                    bgColor: 'gray.100',
                  }}
                >
                  <Text as="span" variant="text-sm" color="brand.black">
                    {t('user.bid-received.nav.placed')}
                  </Text>
                </Tag>
              </Link>
            </Flex>
            <Box ml="auto" w={{ base: 'full', md: 'min-content' }}>
              <Select<OfferOpenBuysOrderBy>
                label={t('user.bid-received.orderBy.label')}
                name="Sort by"
                onChange={changeOrder}
                choices={[
                  {
                    label: t('user.bid-received.orderBy.values.createdAtDesc'),
                    value: 'CREATED_AT_DESC',
                  },
                  {
                    label: t('user.bid-received.orderBy.values.createdAtAsc'),
                    value: 'CREATED_AT_ASC',
                  },
                ]}
                value={orderBy}
                inlineLabel
              />
            </Box>
          </Flex>

          {loading && !bidData ? (
            <Loader />
          ) : bids.length == 0 ? (
            <Empty
              icon={<Icon as={HiOutlineSearch} w={8} h={8} color="gray.400" />}
              title={t('user.bid-received.table.empty.title')}
              description={t('user.bid-received.table.empty.description')}
            />
          ) : (
            <TableContainer bg="white" shadow="base" rounded="lg">
              <Table>
                <Thead>
                  <Tr>
                    <Th>{t('user.bid-received.table.item')}</Th>
                    <Th isNumeric>{t('user.bid-received.table.price')}</Th>
                    <Th>{t('user.bid-received.table.from')}</Th>
                    <Th>{t('user.bid-received.table.created')}</Th>
                    <Th isNumeric></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {bids.map((item) => (
                    <Tr fontSize="sm" key={item.id}>
                      <Td>
                        <Flex
                          as={Link}
                          href={`/tokens/${item.asset.id}`}
                          gap={3}
                        >
                          <Image
                            src={item.asset.image}
                            alt={item.asset.name}
                            width={40}
                            height={40}
                            layout="fixed"
                            objectFit="cover"
                            rounded="full"
                            h={10}
                            w={10}
                          />
                          <Flex
                            direction="column"
                            my="auto"
                            title={item.asset.name}
                          >
                            <Text as="span" noOfLines={1}>
                              {item.asset.name}
                            </Text>
                            {item.availableQuantity.gt(1) && (
                              <Text
                                as="span"
                                variant="caption"
                                color="gray.500"
                              >
                                {t('user.bid-received.requested', {
                                  value: item.availableQuantity.toString(),
                                })}
                              </Text>
                            )}
                          </Flex>
                        </Flex>
                      </Td>
                      <Td isNumeric>
                        <Text
                          as={Price}
                          noOfLines={1}
                          amount={item.unitPrice.mul(item.availableQuantity)}
                          currency={item.currency}
                        />
                      </Td>
                      <Td>
                        <Avatar
                          address={item.maker.address}
                          image={item.maker.image}
                          name={item.maker.name}
                          verified={item.maker.verified}
                        />
                      </Td>
                      <Td>{dateFromNow(item.createdAt)}</Td>
                      <Td isNumeric>
                        {ownerLoggedIn && (
                          <AcceptOfferButton
                            variant="outline"
                            colorScheme="gray"
                            signer={signer}
                            chainId={item.asset.chainId}
                            offer={item}
                            quantity={item.availableQuantity}
                            onAccepted={onAccepted}
                            onError={(e) =>
                              toast({
                                status: 'error',
                                title: formatError(e),
                              })
                            }
                            title={t('user.bid-received.accept.title')}
                          >
                            <Text as="span" isTruncated>
                              {t('user.bid-received.actions.accept')}
                            </Text>
                          </AcceptOfferButton>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}

          <Pagination
            limit={limit}
            limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
            onLimitChange={changeLimit}
            onPageChange={changePage}
            page={page}
            total={bidData?.bids?.totalCount || 0}
            result={{
              label: t('pagination.result.label'),
              caption: (props) => (
                <Trans
                  ns="templates"
                  i18nKey="pagination.result.caption"
                  values={props}
                  components={[
                    <Text as="span" color="brand.black" key="text" />,
                  ]}
                />
              ),
              pages: (props) =>
                t('pagination.result.pages', { count: props.total }),
            }}
          />
        </Stack>
      </UserProfileTemplate>
    </LargeLayout>
  )
}

export default BidReceivedPage
