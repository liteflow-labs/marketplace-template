import { OfferForm } from '@nft/templates'
import { connectors } from 'connectors'
import useEagerConnect from 'hooks/useEagerConnect'
import { NextPage } from 'next'
import Head from '../../../components/Head'
import environment from '../../../environment'
import SmallLayout from '../../../layouts/small'

export const getServerSideProps = OfferForm.server(environment.GRAPHQL_URL)

const OfferPage: NextPage<OfferForm.Props> = ({
  currentAccount,
  now,
  assetId,
  meta,
}) => {
  const reconnected = useEagerConnect(connectors, currentAccount)

  return (
    <SmallLayout>
      <Head
        title={meta.title}
        description={meta.description}
        image={meta.image}
      />

      <OfferForm.Template
        currentAccount={currentAccount}
        assetId={assetId}
        now={now}
        explorer={{
          name: environment.BLOCKCHAIN_EXPLORER_NAME,
          url: environment.BLOCKCHAIN_EXPLORER_URL,
        }}
        auctionValidity={environment.AUCTION_VALIDITY_IN_SECONDS}
        offerValidity={environment.OFFER_VALIDITY_IN_SECONDS}
        userHasBeenReconnected={reconnected}
      />
    </SmallLayout>
  )
}

export default OfferPage
