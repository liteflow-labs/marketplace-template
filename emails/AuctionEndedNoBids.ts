import { formatDate } from '@nft/hooks'
import { Events } from '@nft/webhook'
import environment from '../environment'

export default async function AuctionEndedNoBids({
  asset,
  creator,
  expireAt,
  bestBid,
}: Events['AUCTION_ENDED']): Promise<{
  html: string
  subject: string
  to: string
} | null> {
  if (!!bestBid) return null
  if (!creator?.email) return null
  return {
    to: creator.email,
    subject: `Your auction has ended but no bids were placed for ${asset.name}`,
    html: `Hi <strong>${creator.username || creator.address}</strong>,<br/>
    <br/>
    Your auction for the NFT <strong>${
      asset.name
    }</strong> has ended but hasn't received any bids.<br/>
    <br/>
    Friendly tips, create a new sale for this NFT and share it around you to gather interest.<br/>
    <br/>
    Without action from your side after the <strong>${formatDate(
      expireAt,
    )}</strong>, the auction and its bids will be canceled.<br/>
    <br/>
    <a href="${environment.BASE_URL}/tokens/${
      asset.id
    }">Create a new sale</a><br/>`,
  }
}