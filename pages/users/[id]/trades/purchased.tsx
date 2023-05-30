import {
  Box,
  Flex,
  Icon,
  IconButton,
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
} from '@chakra-ui/react'
import { dateFromNow } from '@nft/hooks'
import { HiExternalLink } from '@react-icons/all-files/hi/HiExternalLink'
import { HiOutlineSearch } from '@react-icons/all-files/hi/HiOutlineSearch'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import Empty from '../../../../components/Empty/Empty'
import Image from '../../../../components/Image/Image'
import Link from '../../../../components/Link/Link'
import Loader from '../../../../components/Loader'
import Pagination from '../../../../components/Pagination/Pagination'
import Price from '../../../../components/Price/Price'
import UserProfileTemplate from '../../../../components/Profile'
import Select from '../../../../components/Select/Select'
import Avatar from '../../../../components/User/Avatar'
import { convertTrade } from '../../../../convert'
import environment from '../../../../environment'
import {
  TradesOrderBy,
  useFetchUserTradePurchasedQuery,
} from '../../../../graphql'
import useAccount from '../../../../hooks/useAccount'
import { blockExplorer } from '../../../../hooks/useBlockExplorer'
import useOrderByQuery from '../../../../hooks/useOrderByQuery'
import usePaginate from '../../../../hooks/usePaginate'
import usePaginateQuery from '../../../../hooks/usePaginateQuery'
import useRequiredQueryParamSingle from '../../../../hooks/useRequiredQueryParamSingle'
import useSigner from '../../../../hooks/useSigner'
import LargeLayout from '../../../../layouts/large'

type Props = {
  now: string
}

const TradePurchasedPage: NextPage<Props> = ({ now }) => {
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { replace, pathname, query } = useRouter()
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<TradesOrderBy>('TIMESTAMP_DESC')
  const [changePage, changeLimit] = usePaginate()
  const { address } = useAccount()
  const userAddress = useRequiredQueryParamSingle('id')

  const date = useMemo(() => new Date(now), [now])
  const { data, loading, previousData } = useFetchUserTradePurchasedQuery({
    variables: {
      address: userAddress,
      limit,
      offset,
      orderBy,
    },
  })

  const tradeData = useMemo(() => data || previousData, [data, previousData])
  const trades = useMemo(
    () => (tradeData?.trades?.nodes || []).map(convertTrade),
    [tradeData],
  )

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
        currentTab="trades"
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
              <Link href={`/users/${userAddress}/trades`}>
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
                    {t('user.trade-purchased.nav.sold')}
                  </Text>
                </Tag>
              </Link>
              <Link href={`/users/${userAddress}/trades/purchased`}>
                <Tag
                  size="lg"
                  colorScheme="brand"
                  border="1px"
                  borderColor="brand.500"
                  borderRadius="full"
                >
                  <Text as="span" variant="text-sm" color="brand.600">
                    {t('user.trade-purchased.nav.purchased')}
                  </Text>
                </Tag>
              </Link>
            </Flex>
            <Box ml="auto" w={{ base: 'full', md: 'min-content' }}>
              <Select<TradesOrderBy>
                label={t('user.trade-purchased.orderBy.label')}
                name="Sort by"
                onChange={changeOrder}
                choices={[
                  {
                    label: t(
                      'user.trade-purchased.orderBy.values.timestampDesc',
                    ),
                    value: 'TIMESTAMP_DESC',
                  },
                  {
                    label: t(
                      'user.trade-purchased.orderBy.values.timestampAsc',
                    ),
                    value: 'TIMESTAMP_ASC',
                  },
                  {
                    label: t('user.trade-purchased.orderBy.values.amountAsc'),
                    value: 'AMOUNT_IN_REF_ASC',
                  },
                  {
                    label: t('user.trade-purchased.orderBy.values.amountDesc'),
                    value: 'AMOUNT_IN_REF_DESC',
                  },
                ]}
                value={orderBy}
                inlineLabel
              />
            </Box>
          </Flex>

          {loading && !tradeData ? (
            <Loader />
          ) : trades.length == 0 ? (
            <Empty
              icon={<Icon as={HiOutlineSearch} w={8} h={8} color="gray.400" />}
              title={t('user.trade-purchased.table.empty.title')}
              description={t('user.trade-purchased.table.empty.description')}
            />
          ) : (
            <TableContainer bg="white" shadow="base" rounded="lg">
              <Table>
                <Thead>
                  <Tr>
                    <Th>{t('user.trade-purchased.table.item')}</Th>
                    <Th isNumeric>{t('user.trade-purchased.table.price')}</Th>
                    <Th>{t('user.trade-purchased.table.from')}</Th>
                    <Th>{t('user.trade-purchased.table.created')}</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {trades.map((item, index) => (
                    <Tr fontSize="sm" key={index}>
                      <Td>
                        {item.asset ? (
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
                              {item.quantity.gt(1) && (
                                <Text
                                  as="span"
                                  variant="caption"
                                  color="gray.500"
                                >
                                  {t('user.trade-purchased.purchased', {
                                    value: item.quantity.toString(),
                                  })}
                                </Text>
                              )}
                            </Flex>
                          </Flex>
                        ) : (
                          '-'
                        )}
                      </Td>
                      <Td isNumeric>
                        {item.currency ? (
                          <Text
                            as={Price}
                            noOfLines={1}
                            amount={item.amount}
                            currency={item.currency}
                          />
                        ) : (
                          '-'
                        )}
                      </Td>
                      <Td>
                        <Avatar
                          address={item.seller.address}
                          image={item.seller.image}
                          name={item.seller.name}
                          verified={item.seller.verified}
                        />
                      </Td>
                      <Td>{dateFromNow(item.createdAt)}</Td>
                      <Td>
                        <IconButton
                          aria-label="external link"
                          as={Link}
                          href={
                            blockExplorer(item.asset?.chainId).transaction(
                              item.transactionHash,
                            ) || '#'
                          }
                          isExternal
                          variant="outline"
                          colorScheme="gray"
                          rounded="full"
                        >
                          <HiExternalLink />
                        </IconButton>
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
            total={tradeData?.trades?.totalCount || 0}
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

export default TradePurchasedPage
