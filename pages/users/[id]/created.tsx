import { UserCreatedAssets } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../../../components/Head'
import environment from '../../../environment'
import LargeLayout from '../../../layouts/large'

export const getServerSideProps = UserCreatedAssets.server(
  environment.GRAPHQL_URL,
  environment.PAGINATION_LIMIT,
)

const CreatedPage: NextPage<UserCreatedAssets.Props> = ({
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
    <UserCreatedAssets.Template
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

export default CreatedPage
