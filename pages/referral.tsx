import { Referral } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../components/Head'
import environment from '../environment'
import SmallLayout from '../layouts/small'

const LoginPage: NextPage = () => (
  <SmallLayout>
    <Head title="Referral" />
    <Referral.Template
      platformName="Demo"
      percentage={{
        base: environment.REFERRAL_PERCENTAGE.base,
        secondary: environment.REFERRAL_PERCENTAGE.secondary,
      }}
      loginUrl={environment.BASE_URL + '/login'}
      login={{
        email: true,
        metamask: true,
        walletConnect: true,
        coinbase: true,
        networkName: environment.NETWORK_NAME,
      }}
    />
  </SmallLayout>
)

export default LoginPage
