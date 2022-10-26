import { Notification } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../components/Head'
import environment from '../environment'
import SmallLayout from '../layouts/small'

export const getServerSideProps = Notification.server(environment.GRAPHQL_URL)

const NotificationPage: NextPage<Notification.Props> = ({ address }) => (
  <SmallLayout>
    <Head title="Notifications" />
    <Notification.Template address={address} />
  </SmallLayout>
)

export default NotificationPage
