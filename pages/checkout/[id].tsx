import { Checkout } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../../components/Head'
import environment from '../../environment'
import SmallLayout from '../../layouts/small'

export const getServerSideProps = Checkout.server(environment.GRAPHQL_URL)

const CheckoutPage: NextPage<Checkout.Props> = ({ now, offerId, meta }) => (
  <SmallLayout>
    <Head
      title={meta.title}
      description={meta.description}
      image={meta.image}
    />
    <Checkout.Template
      now={now}
      offerId={offerId}
      explorer={{
        name: environment.BLOCKCHAIN_EXPLORER_NAME,
        url: environment.BLOCKCHAIN_EXPLORER_URL,
      }}
      allowTopUp={true}
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

export default CheckoutPage
