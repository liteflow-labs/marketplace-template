import { Bid } from '@nft/templates'
import { NextPage } from 'next'
import Head from '../../../components/Head'
import environment from '../../../environment'
import SmallLayout from '../../../layouts/small'

export const getServerSideProps = Bid.server(environment.GRAPHQL_URL)

const BidPage: NextPage<Bid.Props> = ({ now, assetId, meta }) => (
  <SmallLayout>
    <Head
      title={meta.title}
      description={meta.description}
      image={meta.image}
    />
    <Bid.Template
      assetId={assetId}
      explorer={{
        name: environment.BLOCKCHAIN_EXPLORER_NAME,
        url: environment.BLOCKCHAIN_EXPLORER_URL,
      }}
      now={now}
      allowTopUp={true}
      auctionValidity={environment.AUCTION_VALIDITY_IN_SECONDS}
      offerValidity={environment.OFFER_VALIDITY_IN_SECONDS}
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

export default BidPage
