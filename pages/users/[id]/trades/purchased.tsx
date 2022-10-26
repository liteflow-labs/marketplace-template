import { UserTradePurchased } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../../../../components/Head'
import environment from '../../../../environment'
import LargeLayout from '../../../../layouts/large'

export const getServerSideProps = UserTradePurchased.server(
  environment.GRAPHQL_URL,
  environment.PAGINATION_LIMIT,
)

const TradePurchasedPage: NextPage<UserTradePurchased.Props> = ({
  meta,
  now,
  limit,
  page,
  offset,
  orderBy,
  userAddress,
}) => (
  <LargeLayout>
    <Head
      title={meta.title}
      description={meta.description}
      image={meta.image}
    />
    <UserTradePurchased.Template
      explorer={{
        name: environment.BLOCKCHAIN_EXPLORER_NAME,
        url: environment.BLOCKCHAIN_EXPLORER_URL,
      }}
      limit={limit}
      limits={[environment.PAGINATION_LIMIT, 24, 36, 48]}
      now={now}
      offset={offset}
      orderBy={orderBy}
      page={page}
      userAddress={userAddress}
      loginUrlForReferral={environment.BASE_URL + '/login'}
    />
  </LargeLayout>
)

export default TradePurchasedPage
