import { Button, Icon, Text, useDisclosure, useToast } from '@chakra-ui/react'
import { Signer } from '@ethersproject/abstract-signer'
import { formatError, useInvitation } from '@nft/hooks'
import { HiOutlineClipboard } from '@react-icons/all-files/hi/HiOutlineClipboard'
import useTranslation from 'next-translate/useTranslation'
import { useCallback, useEffect, useMemo, useState, VFC } from 'react'
import useAccount from '../../hooks/useAccount'
import LoginModal from '../Modal/Login'

type Props = {
  baseUrl: string
  signer: Signer | undefined
}

const ReferralForm: VFC<Props> = ({ baseUrl, signer }) => {
  const { t } = useTranslation('components')
  const toast = useToast()
  const { isLoggedIn } = useAccount()
  const { create, creating } = useInvitation(signer)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [url, setUrl] = useState<string>()
  const loginUrl = baseUrl + '/login'

  useEffect(() => {
    if (!isLoggedIn) return // make sure the user is fully logged in
    if (url) return
    create()
      .then((id) => setUrl(`${loginUrl}?ref=${id}`))
      .catch((error) =>
        toast({
          title: formatError(error),
          status: 'error',
        }),
      )
  }, [url, create, loginUrl, toast, isLoggedIn])

  const handleClick = useCallback(() => {
    if (!url) return
    void navigator.clipboard.writeText(url)
    toast({
      title: t('referral.form.copy'),
      status: 'success',
    })
  }, [url, t, toast])

  const action = useMemo(() => {
    if (!isLoggedIn)
      return (
        <>
          <LoginModal
            isOpen={isOpen}
            onClose={onClose}
            baseUrl={baseUrl}
            chainId={undefined}
          />
          <Button onClick={onOpen} width="full">
            <Text as="span" isTruncated>
              {t('referral.form.connect')}
            </Text>
          </Button>
        </>
      )
    return (
      <Button
        variant="outline"
        isLoading={!url || creating}
        onClick={handleClick}
        type="button"
        width="full"
        rightIcon={<Icon as={HiOutlineClipboard} h={4} w={4} ml={2} />}
      >
        <Text as="span" isTruncated>
          {url}
        </Text>
      </Button>
    )
  }, [
    isLoggedIn,
    isOpen,
    onClose,
    baseUrl,
    onOpen,
    t,
    url,
    creating,
    handleClick,
  ])

  return action
}

export default ReferralForm
