import {
  Box,
  Button,
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
import { useIsLoggedIn } from '@liteflow/react'
import { HiOutlineSearch } from '@react-icons/all-files/hi/HiOutlineSearch'
import { NextPage } from 'next'
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
import {
  OfferOpenBuysOrderBy,
  useFetchUserBidsReceivedQuery,
} from '../../../../graphql'
import useAccount from '../../../../hooks/useAccount'
import useEnvironment from '../../../../hooks/useEnvironment'
import useOrderByQuery from '../../../../hooks/useOrderByQuery'
import usePaginate from '../../../../hooks/usePaginate'
import usePaginateQuery from '../../../../hooks/usePaginateQuery'
import useRequiredQueryParamSingle from '../../../../hooks/useRequiredQueryParamSingle'
import useSigner from '../../../../hooks/useSigner'
import LargeLayout from '../../../../layouts/large'
import { dateFromNow, formatError } from '../../../../utils'

type Props = {
  now: Date
}

const BidReceivedPage: NextPage<Props> = ({ now }) => {
  const { BASE_URL, PAGINATION_LIMIT } = useEnvironment()
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

  const { data, refetch } = useFetchUserBidsReceivedQuery({
    variables: {
      address: userAddress,
      limit,
      offset,
      orderBy,
      now,
    },
  })

  const bids = useMemo(
    () =>
      data?.bids?.nodes.map((x) => ({
        ...convertBidFull(x),
        asset: x.asset,
      })),
    [data],
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
        signer={signer}
        currentAccount={address}
        address={userAddress}
        currentTab="bids"
        loginUrlForReferral={BASE_URL + '/login'}
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

          {bids === undefined ? (
            <Loader />
          ) : bids.length > 0 ? (
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
                            h={10}
                            w={10}
                            objectFit="cover"
                            rounded="2xl"
                            flexShrink={0}
                          />
                          <Flex
                            direction="column"
                            my="auto"
                            title={item.asset.name}
                          >
                            <Text as="span" noOfLines={1}>
                              {item.asset.name}
                              {item.auctionId && (
                                <Tag size="sm" ml={2}>
                                  {t('user.bid-received.auction')}
                                </Tag>
                              )}
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
                        {ownerLoggedIn &&
                          (item.auctionId ? (
                            <Button
                              as={Link}
                              variant="outline"
                              colorScheme="gray"
                              href={`/tokens/${item.asset.id}`}
                            >
                              {t('user.bid-received.actions.view')}
                            </Button>
                          ) : (
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
                          ))}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Empty
              icon={<Icon as={HiOutlineSearch} w={8} h={8} color="gray.400" />}
              title={t('user.bid-received.table.empty.title')}
              description={t('user.bid-received.table.empty.description')}
            />
          )}
          {bids?.length !== 0 && (
            <Pagination
              limit={limit}
              limits={[PAGINATION_LIMIT, 24, 36, 48]}
              page={page}
              onPageChange={changePage}
              onLimitChange={changeLimit}
              hasNextPage={data?.bids?.pageInfo.hasNextPage}
              hasPreviousPage={data?.bids?.pageInfo.hasPreviousPage}
            />
          )}
        </Stack>
      </UserProfileTemplate>
    </LargeLayout>
  )
}

export default BidReceivedPage
