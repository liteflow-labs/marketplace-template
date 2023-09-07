import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import UserProfileTemplate from '../../../components/Profile'
import TokenGrid from '../../../components/Token/Grid'
import {
  convertAsset,
  convertAuctionWithBestBid,
  convertSale,
  convertUser,
} from '../../../convert'
import {
  AssetDetailFragment,
  OwnershipsOrderBy,
  useFetchOwnedAssetsQuery,
} from '../../../graphql'
import useAccount from '../../../hooks/useAccount'
import useEnvironment from '../../../hooks/useEnvironment'
import useOrderByQuery from '../../../hooks/useOrderByQuery'
import usePaginate from '../../../hooks/usePaginate'
import usePaginateQuery from '../../../hooks/usePaginateQuery'
import useRequiredQueryParamSingle from '../../../hooks/useRequiredQueryParamSingle'
import useSigner from '../../../hooks/useSigner'
import LargeLayout from '../../../layouts/large'

type Props = {
  now: Date
}

const OwnedPage: NextPage<Props> = ({ now }) => {
  const { PAGINATION_LIMIT, BASE_URL } = useEnvironment()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { pathname, replace, query } = useRouter()
  const { limit, offset, page } = usePaginateQuery()
  const orderBy = useOrderByQuery<OwnershipsOrderBy>('CREATED_AT_DESC')
  const [changePage, changeLimit] = usePaginate()
  const { address } = useAccount()
  const userAddress = useRequiredQueryParamSingle('id')

  const { data } = useFetchOwnedAssetsQuery({
    variables: {
      address: userAddress,
      currentAddress: address || '',
      limit,
      offset,
      orderBy,
      now,
    },
  })

  const assets = useMemo(
    () =>
      data?.owned?.nodes
        .map((x) => x.asset)
        .filter((x): x is AssetDetailFragment => !!x)
        .map((x) => ({
          ...convertAsset(x),
          auction: x.auctions?.nodes[0]
            ? convertAuctionWithBestBid(x.auctions.nodes[0])
            : undefined,
          creator: convertUser(x.creator, x.creator.address),
          sale: convertSale(x.firstSale?.nodes[0]),
          numberOfSales: x.firstSale.totalCount,
          hasMultiCurrency: x.firstSale.totalCurrencyDistinctCount > 1,
        })),
    [data],
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
        signer={signer}
        currentAccount={address}
        address={userAddress}
        currentTab="owned"
        loginUrlForReferral={BASE_URL + '/login'}
      >
        <TokenGrid<OwnershipsOrderBy>
          assets={assets}
          orderBy={{
            value: orderBy,
            choices: [
              {
                label: t('user.owned-assets.orderBy.values.createdAtDesc'),
                value: 'CREATED_AT_DESC',
              },
              {
                label: t('user.owned-assets.orderBy.values.createdAtAsc'),
                value: 'CREATED_AT_ASC',
              },
            ],
            onSort: changeOrder,
          }}
          pagination={{
            limit,
            limits: [PAGINATION_LIMIT, 24, 36, 48],
            page,
            onPageChange: changePage,
            onLimitChange: changeLimit,
            hasNextPage: data?.owned?.pageInfo.hasNextPage,
            hasPreviousPage: data?.owned?.pageInfo.hasPreviousPage,
          }}
        />
      </UserProfileTemplate>
    </LargeLayout>
  )
}

export default OwnedPage
