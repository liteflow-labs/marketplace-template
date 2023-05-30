import { NextPage } from 'next'
import Error from 'next/error'
import { useMemo } from 'react'
import AccountTemplate from '../../components/Account/Account'
import Head from '../../components/Head'
import Loader from '../../components/Loader'
import WalletAccount from '../../components/Wallet/Account/Wallet'
import { useWalletCurrenciesQuery } from '../../graphql'
import useAccount from '../../hooks/useAccount'
import useLoginRedirect from '../../hooks/useLoginRedirect'
import SmallLayout from '../../layouts/small'

const WalletPage: NextPage = () => {
  const { address } = useAccount()
  useLoginRedirect()
  const { data, loading, previousData } = useWalletCurrenciesQuery()
  const currencyData = useMemo(() => data || previousData, [data, previousData])

  if (!loading && !currencyData) return <Error statusCode={404} />
  return (
    <SmallLayout>
      <Head title="Account - Wallet" />
      <AccountTemplate currentTab="wallet">
        {!currencyData || !address ? (
          <Loader fullPage />
        ) : (
          <WalletAccount
            account={address}
            currencies={currencyData.currencies?.nodes || []}
          />
        )}
      </AccountTemplate>
    </SmallLayout>
  )
}

export default WalletPage
