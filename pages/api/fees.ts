import { createHmac } from 'crypto'
import { gql, request } from 'graphql-request'
import type { IncomingMessage } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import getRawBody from 'raw-body'

// PLATFORM_FEE_ADDRESS
if (!process.env.PLATFORM_FEE_ADDRESS)
  throw new Error('env PLATFORM_FEE_ADDRESS is missing')
const PLATFORM_FEE_ADDRESS = process.env.PLATFORM_FEE_ADDRESS

// REFERRAL_FEE_PERCENT
if (!process.env.REFERRAL_FEE_PERCENT)
  throw new Error('env REFERRAL_FEE_PERCENT is missing')
const REFERRAL_FEE_PERCENT = Number.parseInt(process.env.REFERRAL_FEE_PERCENT)
if (isNaN(REFERRAL_FEE_PERCENT))
  throw new Error('env REFERRAL_FEE_PERCENT is not a integer')

// PLATFORM_FEE_VALUE_PER_TEN_THOUSAND
if (!process.env.PLATFORM_FEE_VALUE_PER_TEN_THOUSAND)
  throw new Error('env PLATFORM_FEE_VALUE_PER_TEN_THOUSAND is missing')
const PLATFORM_FEE_VALUE_PER_TEN_THOUSAND = Number.parseInt(
  process.env.PLATFORM_FEE_VALUE_PER_TEN_THOUSAND,
)
if (isNaN(PLATFORM_FEE_VALUE_PER_TEN_THOUSAND))
  throw new Error('env PLATFORM_FEE_VALUE_PER_TEN_THOUSAND is not a integer')

// PLATFORM_FEE_SECONDARY_SALES_VALUE_PER_TEN_THOUSAND
if (!process.env.PLATFORM_FEE_SECONDARY_SALES_VALUE_PER_TEN_THOUSAND)
  throw new Error(
    'env PLATFORM_FEE_SECONDARY_SALES_VALUE_PER_TEN_THOUSAND is missing',
  )
const PLATFORM_FEE_SECONDARY_SALES_VALUE_PER_TEN_THOUSAND = Number.parseInt(
  process.env.PLATFORM_FEE_SECONDARY_SALES_VALUE_PER_TEN_THOUSAND,
)
if (isNaN(PLATFORM_FEE_SECONDARY_SALES_VALUE_PER_TEN_THOUSAND))
  throw new Error(
    'env PLATFORM_FEE_SECONDARY_SALES_VALUE_PER_TEN_THOUSAND is not a integer',
  )

// GRAPHQL_URL
if (!process.env.NEXT_PUBLIC_GRAPHQL_URL)
  throw new Error('env NEXT_PUBLIC_GRAPHQL_URL is missing')
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL

// LITEFLOW_SECRET
if (!process.env.LITEFLOW_SECRET)
  throw new Error('env LITEFLOW_SECRET is missing')
const LITEFLOW_SECRET = process.env.LITEFLOW_SECRET

const TradesAndReferralQuery = gql`
  query TradesAndReferral(
    $tokenId: String!
    $collection: Address!
    $chainId: Int!
    $userAddress: Address!
  ) {
    trades(
      filter: {
        tokenId: { equalTo: $tokenId }
        collectionAddress: { equalTo: $collection }
        chainId: { equalTo: $chainId }
      }
    ) {
      totalCount
    }

    account(address: $userAddress) {
      referrerAddress
    }
  }
`

const calculateFee = (trades: number, referralAddress: string | undefined) => {
  const isSecondarySale = trades > 0
  const platformFees = isSecondarySale
    ? {
        account: PLATFORM_FEE_ADDRESS,
        value: PLATFORM_FEE_SECONDARY_SALES_VALUE_PER_TEN_THOUSAND,
      }
    : {
        account: PLATFORM_FEE_ADDRESS,
        value: PLATFORM_FEE_VALUE_PER_TEN_THOUSAND,
      }

  if (!platformFees) return []
  if (!referralAddress) return [platformFees]
  return [
    {
      account: platformFees.account,
      value: (platformFees.value * (100 - REFERRAL_FEE_PERCENT)) / 100,
    },
    {
      account: referralAddress,
      value: (platformFees.value * REFERRAL_FEE_PERCENT) / 100,
    },
  ]
}

// TODO: to move in the sdk
async function parseAndVerifyRequest<T = any>(
  req: IncomingMessage,
  secret: string,
): Promise<{ type: string; payload: T }> {
  // decode request body
  const rawBody = await getRawBody(req, { encoding: true })

  // verify signature
  const signature =
    req.headers['X-Liteflow-Signature'] || req.headers['x-liteflow-signature']
  if (!signature || typeof signature !== 'string')
    throw new Error('invalid request, header X-Liteflow-Signature is missing')
  const sig = createHmac('sha256', secret).update(rawBody).digest('base64')
  if (sig !== signature)
    throw new Error('invalid request, signatures do not match')

  // decode and return body
  return JSON.parse(rawBody)
}

export default async function fees(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { payload } = await parseAndVerifyRequest<{
    tokenId: string
    collectionAddress: string
    chainId: number
    currentUser: string | undefined
  }>(req, LITEFLOW_SECRET)

  const { trades, account } = await request(
    GRAPHQL_URL,
    TradesAndReferralQuery,
    {
      tokenId: payload.tokenId,
      collection: payload.collectionAddress,
      chainId: payload.chainId,
      userAddress: payload.currentUser || '',
    },
  )

  const fees = calculateFee(trades.totalCount, account?.referrerAddress)

  res.status(200).json(fees)
}

export const config = {
  api: {
    bodyParser: false,
  },
}
