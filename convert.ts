// Temporary file to centralize all the conversions.
// This file will be removed when the whole migration of the components is finalized

import { BigNumber } from '@ethersproject/bignumber'
import invariant from 'ts-invariant'
import {
  Account,
  AccountVerification,
  Collection,
  Drop,
  Maybe,
} from './graphql'

export type FileDef = {
  url: string
  mimetype: string | null
}

export const convertDropActive = (
  collectionWithDrops: Pick<
    Collection,
    'address' | 'chainId' | 'name' | 'image' | 'cover'
  > & {
    deployer: Pick<Account, 'address' | 'name' | 'username'> & {
      verification: Maybe<Pick<AccountVerification, 'status'>>
    }
  } & {
    drops: NonNullable<{
      nodes: Array<
        Pick<Drop, 'id' | 'startDate' | 'endDate' | 'unitPrice' | 'supply'> & {
          currency: {
            id: string
            decimals: number
            symbol: string
            image: string
          }
        }
      >
    }>
  },
): {
  id: string
  startDate: Date
  endDate: Date
  unitPrice: string
  supply: BigNumber | null
  collection: {
    address: string
    chainId: number
    cover: string | null
    image: string | null
    name: string
    deployer: {
      address: string
      name: string | null
      username: string | null
      verified: boolean
    }
  }
  currency: {
    id: string
    decimals: number
    symbol: string
    image: string
  }
} => {
  const totalSupply = collectionWithDrops.drops.nodes.some((x) => !x.supply)
    ? null
    : collectionWithDrops.drops.nodes.reduce(
        (acc, drop) => acc.add(BigNumber.from(drop.supply)),
        BigNumber.from(0),
      )

  const latestDrop = collectionWithDrops.drops.nodes[0]
  invariant(latestDrop, 'drop is required')

  return {
    ...latestDrop,
    supply: totalSupply,
    collection: {
      ...collectionWithDrops,
      deployer: {
        ...collectionWithDrops.deployer,
        verified:
          collectionWithDrops.deployer.verification?.status === 'VALIDATED',
      },
    },
    currency: latestDrop.currency,
  }
}

export const convertDropEnded = (
  collectionWithDrops: Pick<
    Collection,
    'address' | 'chainId' | 'name' | 'image' | 'cover'
  > & {
    deployer: Pick<Account, 'address' | 'name' | 'username'> & {
      verification: Maybe<Pick<AccountVerification, 'status'>>
    }
  } & {
    allDrops: NonNullable<{ nodes: Array<Pick<Drop, 'supply'>> }>
  } & {
    lastDrop: NonNullable<{
      nodes: Array<
        Pick<Drop, 'id' | 'startDate' | 'endDate' | 'unitPrice'> & {
          currency: {
            id: string
            decimals: number
            symbol: string
            image: string
          }
        }
      >
    }>
  },
): {
  id: string
  startDate: Date
  endDate: Date
  unitPrice: string
  supply: BigNumber | null
  collection: {
    address: string
    chainId: number
    cover: string | null
    image: string | null
    name: string
    deployer: {
      address: string
      name: string | null
      username: string | null
      verified: boolean
    }
  }
  currency: {
    id: string
    decimals: number
    symbol: string
    image: string
  }
} => {
  const totalSupply = collectionWithDrops.allDrops.nodes.some((x) => !x.supply)
    ? null
    : collectionWithDrops.allDrops.nodes.reduce(
        (acc, drop) => acc.add(BigNumber.from(drop.supply)),
        BigNumber.from(0),
      )

  const latestDrop = collectionWithDrops.lastDrop.nodes[0]
  invariant(latestDrop, 'lastDrop is required')
  return {
    ...latestDrop,
    supply: totalSupply,
    collection: {
      ...collectionWithDrops,
      deployer: {
        ...collectionWithDrops.deployer,
        verified:
          collectionWithDrops.deployer.verification?.status === 'VALIDATED',
      },
    },
    currency: latestDrop.currency,
  }
}
