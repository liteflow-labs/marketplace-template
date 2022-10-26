import { Login } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../components/Head'
import environment from '../environment'
import SmallLayout from '../layouts/small'

const LoginPage: NextPage = () => (
  <SmallLayout>
    <Head title="Login" />
    <Login.Template
      email={true}
      metamask={true}
      walletConnect={true}
      coinbase={true}
      networkName={environment.NETWORK_NAME}
    />
  </SmallLayout>
)

export default LoginPage
