import { useToast } from '@chakra-ui/react'
import { NextPage } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useAccount } from 'wagmi'
import AccountTemplate from '../../components/Account/Account'
import Head from '../../components/Head'
import UserFormEdit from '../../components/User/Form/Edit'
import environment from '../../environment'
import { useGetAccountQuery } from '../../graphql'
import useEagerConnect from '../../hooks/useEagerConnect'
import useLoginRedirect from '../../hooks/useLoginRedirect'
import useSigner from '../../hooks/useSigner'
import SmallLayout from '../../layouts/small'

const EditPage: NextPage = () => {
  const ready = useEagerConnect()
  const signer = useSigner()
  const { t } = useTranslation('templates')
  const { push } = useRouter()
  const { address } = useAccount()
  useLoginRedirect(ready)

  const toast = useToast()

  const { data } = useGetAccountQuery({
    variables: {
      address: address?.toLowerCase() || '',
    },
    skip: !address,
  })

  const onSubmit = useCallback(
    async (address: string) => {
      toast({
        title: t('users.form.notifications.updated'),
        status: 'success',
      })
      await push(`/users/${address}`)
    },
    [toast, t, push],
  )

  if (!data?.account) return <></>
  return (
    <SmallLayout>
      <Head title="Account - Edit profile" />

      <AccountTemplate currentTab="edit-profile">
        <UserFormEdit
          signer={signer}
          onUpdated={onSubmit}
          uploadUrl={environment.UPLOAD_URL}
          account={data.account}
        />
      </AccountTemplate>
    </SmallLayout>
  )
}

export default EditPage
