import UserCard from 'components/User/UserCard'
import { convertUserWithCover } from 'convert'
import environment from 'environment'
import { useOrderByAddress } from 'hooks/useOrderByAddress'
import useTranslation from 'next-translate/useTranslation'
import { FC, useMemo } from 'react'
import { FetchUsersQuery, useFetchUsersQuery } from '../../graphql'
import useHandleQueryError from '../../hooks/useHandleQueryError'
import HomeGridSection from './Grid'

type Props = {}

const UsersHomeSection: FC<Props> = () => {
  const { t } = useTranslation('templates')
  const usersQuery = useFetchUsersQuery({
    variables: {
      userIds: environment.HOME_USERS || '',
      limit: environment.PAGINATION_LIMIT,
    },
    skip: !environment.HOME_USERS,
  })
  useHandleQueryError(usersQuery)

  const userData = useMemo(
    () => usersQuery.data || usersQuery.previousData,
    [usersQuery.data, usersQuery.previousData],
  )

  const orderedUsers = useOrderByAddress(
    environment.HOME_USERS,
    userData?.users?.nodes || [],
  )

  return (
    <HomeGridSection
      explore={{
        href: '/explore/users',
        title: t('home.users.explore'),
      }}
      isLoading={usersQuery.loading && !userData}
      items={orderedUsers}
      itemRender={(
        user: NonNullable<FetchUsersQuery['users']>['nodes'][number],
      ) => <UserCard user={convertUserWithCover(user, user.address)} />}
      title={t('home.users.title')}
    />
  )
}

export default UsersHomeSection
