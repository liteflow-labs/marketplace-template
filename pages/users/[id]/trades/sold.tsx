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
import { dateFromNow, formatAddress } from '@nft/hooks'
import { HiExternalLink } from '@react-icons/all-files/hi/HiExternalLink'
import { HiOutlineSearch } from '@react-icons/all-files/hi/HiOutlineSearch'
import { NextPage } from 'next'
import Trans from 'next-translate/Trans'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import invariant from 'ts-invariant'
import Empty from '../../../../components/Empty/Empty'
import Head from '../../../../components/Head'
import Image from '../../../../components/Image/Image'
import Link from '../../../../components/Link/Link'
import Pagination from '../../../../components/Pagination/Pagination'
import Price from '../../../../components/Price/Price'
import UserProfileTemplate from '../../../../components/Profile'
import Select from '../../../../components/Select/Select'
import { convertFullUser, convertTrade } from '../../../../convert'
import environment from '../../../../environment'
import {
  FetchUserTradeSoldDocument,
  FetchUserTradeSoldQuery,
  TradesOrderBy,
  useFetchUserTradeSoldQuery,
} from '../../../../graphql'
import useAccount from '../../../../hooks/useAccount'
import { blockExplorer } from '../../../../hooks/useBlockExplorer'
import useEagerConnect from '../../../../hooks/useEagerConnect'
import useOrderByQuery from '../../../../hooks/useOrderByQuery'
import usePaginate from '../../../../hooks/usePaginate'
import usePaginateQuery from '../../../../hooks/usePaginateQuery'
import useSigner from '../../../../hooks/useSigner'
import LargeLayout from '../../../../layouts/large'
import { getLimit, getOffset, getOrder } from '../../../../params'
import { wrapServerSideProps } from '../../../../props'

type Props = {
  userAddress: string
  now: string
  meta: {
    title: string
    description: string
    image: string
  }
}

export const getServerSideProps = wrapServerSideProps<Props>(
  environment.GRAPHQL_URL,
  async (context, client) => {
    const userAddress = context.params?.id
      ? Array.isArray(context.params.id)
        ? context.params.id[0]?.toLowerCase()
        : context.params.id.toLowerCase()
      : null
    invariant(userAddress, 'userAddress is falsy')
    const limit = getLimit(context, environment.PAGINATION_LIMIT)
    const orderBy = getOrder<TradesOrderBy>(context, 'TIMESTAMP_DESC')
    const offset = getOffset(context, environment.PAGINATION_LIMIT)
    const now = new Date()
    const { data, error } = await client.query<FetchUserTradeSoldQuery>({
      query: FetchUserTradeSoldDocument,
      variables: {
        limit,
        offset,
        orderBy,
        address: userAddress,
        now,
      },
    })
    if (error) throw error
    if (!data) throw new Error('data is falsy')
    return {
      props: {
        userAddress,
        now: now.toJSON(),
        meta: {
          title: data.account?.name || userAddress,
          description: data.account?.description || '',
          image: data.account?.image || '',
        },
      },
    }
  },
)

const TradeSoldPage: NextPage<Props> = ({ meta, now, userAddress }) => {
  useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { replace, pathname, query } = useRouter()
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<TradesOrderBy>('TIMESTAMP_DESC')
  const [changePage, changeLimit] = usePaginate()
  const { address } = useAccount()

  const date = useMemo(() => new Date(now), [now])
  const { data } = useFetchUserTradeSoldQuery({
    variables: {
      address: userAddress,
      limit,
      offset,
      orderBy,
      now: date,
    },
  })

  const userAccount = useMemo(
    () => convertFullUser(data?.account || null, userAddress),
    [data, userAddress],
  )

  const changeOrder = useCallback(
    async (orderBy: any) => {
      await replace({ pathname, query: { ...query, orderBy } })
    },
    [replace, pathname, query],
  )

  const trades = useMemo(
    () => (data?.trades?.nodes || []).map(convertTrade),
    [data],
  )
  return (
    <LargeLayout>
      <Head
        title={meta.title}
        description={meta.description}
        image={meta.image}
      />

      <UserProfileTemplate
        signer={signer}
        currentAccount={address}
        account={userAccount}
        currentTab="trades"
        totals={
          new Map([
            ['created', data?.created?.totalCount || 0],
            ['on-sale', data?.onSale?.totalCount || 0],
            ['owned', data?.owned?.totalCount || 0],
          ])
        }
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
                  colorScheme="brand"
                  border="1px"
                  borderColor="brand.500"
                  borderRadius="full"
                >
                  <Text as="span" variant="text-sm" color="brand.600">
                    {t('user.trade-sold.nav.sold')}
                  </Text>
                </Tag>
              </Link>
              <Link href={`/users/${userAddress}/trades/purchased`}>
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
                    {t('user.trade-sold.nav.purchased')}
                  </Text>
                </Tag>
              </Link>
            </Flex>
            <Box ml="auto" w={{ base: 'full', md: 'min-content' }}>
              <Select<TradesOrderBy>
                label={t('user.trade-sold.orderBy.label')}
                name="Sort by"
                onChange={changeOrder}
                choices={[
                  {
                    label: t('user.trade-sold.orderBy.values.timestampDesc'),
                    value: 'TIMESTAMP_DESC',
                  },
                  {
                    label: t('user.trade-sold.orderBy.values.timestampAsc'),
                    value: 'TIMESTAMP_ASC',
                  },
                  {
                    label: t('user.trade-sold.orderBy.values.amountAsc'),
                    value: 'AMOUNT_IN_REF_ASC',
                  },
                  {
                    label: t('user.trade-sold.orderBy.values.amountDesc'),
                    value: 'AMOUNT_IN_REF_DESC',
                  },
                ]}
                value={orderBy}
                inlineLabel
              />
            </Box>
          </Flex>

          <TableContainer bg="white" shadow="base" rounded="lg">
            <Table>
              <Thead>
                <Tr>
                  <Th>{t('user.trade-sold.table.item')}</Th>
                  <Th isNumeric>{t('user.trade-sold.table.price')}</Th>
                  <Th>{t('user.trade-sold.table.to')}</Th>
                  <Th>{t('user.trade-sold.table.created')}</Th>
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
                            my="auto"
                            direction="column"
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
                                {t('user.trade-sold.sold', {
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
                      <Link href={`/users/${item.buyerAddress}`}>
                        {formatAddress(item.buyerAddress)}
                      </Link>
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
            {trades.length === 0 && (
              <Empty
                icon={
                  <Icon as={HiOutlineSearch} w={8} h={8} color="gray.400" />
                }
                title={t('user.trade-sold.table.empty.title')}
                description={t('user.trade-sold.table.empty.description')}
              />
            )}
          </TableContainer>

          <Pagination
            limit={limit}
            limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
            onLimitChange={changeLimit}
            onPageChange={changePage}
            page={page}
            total={data?.trades?.totalCount || 0}
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

export default TradeSoldPage
