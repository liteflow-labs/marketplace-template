import invariant from 'ts-invariant'

type Environment = {
  MAGIC_API_KEY: string
  PUBLIC_ETHEREUM_PROVIDER: string
  BLOCKCHAIN_EXPLORER_URL: string
  BLOCKCHAIN_EXPLORER_NAME: string
  GRAPHQL_URL: string
  FEATURED_TOKEN: string[]
  PAGINATION_LIMIT: number
  CHAIN_ID: number
  NETWORK_NAME: string
  REPORT_EMAIL: string
  HOME_TOKENS?: string[]
  OFFER_VALIDITY_IN_SECONDS: number
  AUCTION_VALIDITY_IN_SECONDS: number
  BUGSNAG_API_KEY?: string
  BASE_URL: string
  UPLOAD_URL: string
  REFERRAL_PERCENTAGE: { base: number; secondary?: number }
  ACTIVATE_LAZY_MINT: boolean
}

// magic api key
invariant(process.env.NEXT_PUBLIC_MAGIC_API_KEY, 'Missing magic API key')

// ethereum provider
invariant(
  process.env.NEXT_PUBLIC_ETHEREUM_PROVIDER,
  'Missing public Ethereum provider',
)

// blockchain explorer
invariant(
  process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL,
  'Missing blockchain explorer URL',
)
invariant(
  process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_NAME,
  'Missing blockchain explorer name',
)

// graphql
invariant(process.env.NEXT_PUBLIC_GRAPHQL_URL, 'Missing GraphQL URL')

// feature token
invariant(
  process.env.NEXT_PUBLIC_FEATURED_TOKEN,
  'Featured token is not defined',
)

// chain id
invariant(process.env.NEXT_PUBLIC_CHAIN_ID, 'missing env NEXT_PUBLIC_CHAIN_ID')
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID, 10)
invariant(!isNaN(CHAIN_ID), 'env NEXT_PUBLIC_CHAIN_ID must be an integer')

// network name
invariant(process.env.NEXT_PUBLIC_NETWORK_NAME, 'missing env NETWORK_NAME')

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

const environment: Environment = {
  MAGIC_API_KEY: process.env.NEXT_PUBLIC_MAGIC_API_KEY,
  PUBLIC_ETHEREUM_PROVIDER: process.env.NEXT_PUBLIC_ETHEREUM_PROVIDER,
  BLOCKCHAIN_EXPLORER_URL: process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL,
  BLOCKCHAIN_EXPLORER_NAME: process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_NAME,
  GRAPHQL_URL: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  FEATURED_TOKEN: process.env.NEXT_PUBLIC_FEATURED_TOKEN.split(','),
  PAGINATION_LIMIT: 12,
  CHAIN_ID: CHAIN_ID,
  NETWORK_NAME: process.env.NEXT_PUBLIC_NETWORK_NAME,
  REPORT_EMAIL: process.env.NEXT_PUBLIC_REPORT_EMAIL,
  HOME_TOKENS: process.env.NEXT_PUBLIC_HOME_TOKENS?.split(','),
  OFFER_VALIDITY_IN_SECONDS: OFFER_VALIDITY_IN_SECONDS,
  AUCTION_VALIDITY_IN_SECONDS: AUCTION_VALIDITY_IN_SECONDS,
  BUGSNAG_API_KEY: process.env.NEXT_PUBLIC_BUGSNAG_API_KEY,
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  UPLOAD_URL: process.env.NEXT_PUBLIC_UPLOAD_URL,
  REFERRAL_PERCENTAGE: { base: 20 * 0.025, secondary: 20 * 0.01 },
  ACTIVATE_LAZY_MINT:
    process.env.NEXT_PUBLIC_ACTIVATE_LAZY_MINT?.toLowerCase() === 'true',
}

export default environment
