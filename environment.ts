import invariant from 'ts-invariant'

type Environment = {
  MAGIC_API_KEY?: string
  GRAPHQL_URL: string
  FEATURED_TOKEN: string[]
  PAGINATION_LIMIT: number
  CHAIN_ID: number
  CHAIN_IDS: number[]
  REPORT_EMAIL: string
  HOME_COLLECTIONS?: string[]
  HOME_TOKENS?: string[]
  HOME_USERS?: string[]
  OFFER_VALIDITY_IN_SECONDS: number
  AUCTION_VALIDITY_IN_SECONDS: number
  BUGSNAG_API_KEY?: string
  BASE_URL: string
  UPLOAD_URL: string
  REFERRAL_PERCENTAGE: { base: number; secondary?: number }
  // Set to true if you want only verified users to be able to create NFTs.
  // Set to false if you want everyone to be able to create NFTs.
  RESTRICT_TO_VERIFIED_ACCOUNT: boolean
  // Limit the maximum percentage for royalties
  MAX_ROYALTIES: number
  // Collections where user can mint
  MINTABLE_COLLECTIONS: {
    chainId: number
    address: string
  }[]
}

// graphql
invariant(process.env.NEXT_PUBLIC_GRAPHQL_URL, 'Missing GraphQL URL')

// featured token
invariant(
  process.env.NEXT_PUBLIC_FEATURED_TOKEN,
  'Featured token is not defined',
)

// chain id
const CHAIN_IDS = (process.env.NEXT_PUBLIC_CHAIN_IDS || '')
  .split(',')
  .map((x) => parseInt(x, 10))
  .filter((x) => !isNaN(x))
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID
  ? parseInt(process.env.NEXT_PUBLIC_CHAIN_ID, 10)
  : CHAIN_IDS[0]
invariant(CHAIN_ID, 'missing env CHAIN_ID or CHAIN_IDS')
invariant(!isNaN(CHAIN_ID), 'env NEXT_PUBLIC_CHAIN_ID must be an integer')

invariant(process.env.NEXT_PUBLIC_REPORT_EMAIL, 'missing env REPORT_EMAIL')

invariant(
  process.env.NEXT_PUBLIC_OFFER_VALIDITY_IN_SECONDS,
  'missing env OFFER_VALIDITY_IN_SECONDS',
)
const OFFER_VALIDITY_IN_SECONDS = parseInt(
  process.env.NEXT_PUBLIC_OFFER_VALIDITY_IN_SECONDS,
  10,
)
invariant(
  !isNaN(OFFER_VALIDITY_IN_SECONDS),
  'env NEXT_PUBLIC_OFFER_VALIDITY_IN_SECONDS must be an integer',
)

invariant(
  process.env.NEXT_PUBLIC_AUCTION_VALIDITY_IN_SECONDS,
  'missing env AUCTION_VALIDITY_IN_SECONDS',
)
const AUCTION_VALIDITY_IN_SECONDS = parseInt(
  process.env.NEXT_PUBLIC_AUCTION_VALIDITY_IN_SECONDS,
  10,
)
invariant(
  !isNaN(AUCTION_VALIDITY_IN_SECONDS),
  'env NEXT_PUBLIC_AUCTION_VALIDITY_IN_SECONDS must be an integer',
)

invariant(process.env.NEXT_PUBLIC_BASE_URL, 'Base url is not defined')

invariant(
  process.env.NEXT_PUBLIC_UPLOAD_URL,
  'env NEXT_PUBLIC_UPLOAD_URL is not defined',
)

const MINTABLE_COLLECTIONS = (
  process.env.NEXT_PUBLIC_MINTABLE_COLLECTIONS || ''
)
  .split(',')
  .filter(Boolean)
  .map((address) => ({ address: address.toLowerCase(), chainId: CHAIN_ID }))

const environment: Environment = {
  MAGIC_API_KEY: process.env.NEXT_PUBLIC_MAGIC_API_KEY,
  GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  FEATURED_TOKEN: process.env.NEXT_PUBLIC_FEATURED_TOKEN.split(','),
  PAGINATION_LIMIT: 12,
  CHAIN_ID: CHAIN_ID,
  CHAIN_IDS: CHAIN_IDS,
  REPORT_EMAIL: process.env.NEXT_PUBLIC_REPORT_EMAIL,
  HOME_COLLECTIONS: process.env.NEXT_PUBLIC_HOME_COLLECTIONS?.split(','),
  HOME_TOKENS: process.env.NEXT_PUBLIC_HOME_TOKENS?.split(','),
  HOME_USERS: process.env.NEXT_PUBLIC_HOME_USERS?.split(','),
  OFFER_VALIDITY_IN_SECONDS: OFFER_VALIDITY_IN_SECONDS,
  AUCTION_VALIDITY_IN_SECONDS: AUCTION_VALIDITY_IN_SECONDS,
  BUGSNAG_API_KEY: process.env.NEXT_PUBLIC_BUGSNAG_API_KEY,
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  UPLOAD_URL: process.env.NEXT_PUBLIC_UPLOAD_URL,
  REFERRAL_PERCENTAGE: { base: 20 * 0.025, secondary: 20 * 0.01 },
  RESTRICT_TO_VERIFIED_ACCOUNT: true,
  MAX_ROYALTIES: 30,
  MINTABLE_COLLECTIONS,
}

export default environment
