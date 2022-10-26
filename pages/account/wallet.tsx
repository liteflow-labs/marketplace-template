import { UserWallet } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../../components/Head'
import environment from '../../environment'
import SmallLayout from '../../layouts/small'

export const getServerSideProps = UserWallet.server(environment.GRAPHQL_URL)

const WalletPage: NextPage<UserWallet.Props> = () => (
  <SmallLayout>
    <Head title="Account - Wallet" />
    <UserWallet.Template networkName={environment.NETWORK_NAME} />
  </SmallLayout>
)

export default WalletPage
