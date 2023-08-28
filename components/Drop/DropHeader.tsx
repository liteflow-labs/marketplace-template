import {
  Box,
  Divider,
  Flex,
  Heading,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react'
import { FaDiscord } from '@react-icons/all-files/fa/FaDiscord'
import { FaGlobe } from '@react-icons/all-files/fa/FaGlobe'
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter'
import { HiBadgeCheck } from '@react-icons/all-files/hi/HiBadgeCheck'
import { HiOutlineDotsHorizontal } from '@react-icons/all-files/hi/HiOutlineDotsHorizontal'
import Etherscan from 'components/Icons/Etherscan'
import Image from 'components/Image/Image'
import Link from 'components/Link/Link'
import useBlockExplorer from 'hooks/useBlockExplorer'
import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import ChakraLink from '../../components/Link/Link'
import Truncate from '../../components/Truncate/Truncate'
import { chains } from '../../connectors'
import { convertCollectionDropDetail } from '../../convert'
import { formatAddress } from '../../utils'

type Props = {
  collection: ReturnType<typeof convertCollectionDropDetail> | null
  reportEmail: string
}

const DropHeader: FC<Props> = ({ collection, reportEmail }) => {
  const { t } = useTranslation('templates')
  const blockExplorer = useBlockExplorer(collection?.chainId)
  const chain = chains.find((x) => x.id === collection?.chainId)
  if (!collection) return null
  return (
    <>
      <Flex
        position="relative"
        h={200}
        w="full"
        rounded={{ base: 'none', sm: '2xl' }}
        bg="gray.200"
      >
        {collection.cover && (
          <Image
            src={collection.cover}
            alt={collection?.name || ''}
            fill
            sizes="
            (min-width: 80em) 1216px,
            100vw"
            borderRadius={{ base: 0, sm: '2xl' }}
            objectFit="cover"
          />
        )}
        <Box
          position="absolute"
          bottom="-64px"
          left={4}
          w={32}
          h={32}
          rounded="2xl"
          overflow="hidden"
          borderWidth="2px"
          borderColor="white"
          bg="gray.200"
        >
          {collection.image && (
            <Image
              src={collection.image}
              alt={collection?.name || ''}
              fill
              sizes="124px"
              objectFit="cover"
            />
          )}
        </Box>
      </Flex>
      <Flex
        flexDirection={{ base: 'column', sm: 'row' }}
        pt={24}
        align="flex-start"
        justify="space-between"
        gap={4}
      >
        <Box order={{ base: 1, sm: 0 }}>
          <Heading variant="title" pb={1}>
            {collection.name}
          </Heading>
          <Heading color="gray.500" variant="heading1">
            {t('collection.header.by')}{' '}
            <Text
              as={Link}
              href={`/users/${collection.deployer.address}`}
              color="brand.black"
            >
              <Text as="span">
                {collection.deployer.name ||
                  formatAddress(collection.deployer.address, 10)}
              </Text>
              {collection.deployer?.verified && (
                <Icon as={HiBadgeCheck} color="brand.500" boxSize={5} />
              )}
            </Text>
          </Heading>
        </Box>
        {collection && (
          <Flex
            justify="flex-end"
            alignSelf={{ base: 'flex-end', sm: 'normal' }}
            order={{ base: 0, sm: 1 }}
          >
            <Flex gap={4}>
              {collection.address && (
                <IconButton
                  as={Link}
                  aria-label={`Visit ${blockExplorer.name}`}
                  icon={<Etherscan boxSize={5} />}
                  rounded="full"
                  variant="outline"
                  colorScheme="gray"
                  href={blockExplorer.address(collection.address)}
                  isExternal
                />
              )}
              {collection.website && (
                <IconButton
                  as={Link}
                  aria-label="Visit Website"
                  icon={<FaGlobe />}
                  rounded="full"
                  variant="outline"
                  colorScheme="gray"
                  href={collection.website}
                  isExternal
                />
              )}
              {collection.discord && (
                <IconButton
                  as={Link}
                  aria-label="Visit Discord"
                  icon={<FaDiscord />}
                  rounded="full"
                  variant="outline"
                  colorScheme="gray"
                  href={collection.discord}
                  isExternal
                />
              )}
              {collection.twitter && (
                <IconButton
                  as={Link}
                  aria-label="Visit Twitter"
                  icon={<FaTwitter />}
                  rounded="full"
                  variant="outline"
                  colorScheme="gray"
                  href={collection.twitter}
                  isExternal
                />
              )}
            </Flex>
            <Divider orientation="vertical" h="40px" mx={4} />
            <Menu autoSelect={false}>
              <MenuButton
                as={IconButton}
                variant="outline"
                colorScheme="gray"
                rounded="full"
                aria-label="activator"
                icon={<Icon as={HiOutlineDotsHorizontal} w={5} h={5} />}
              />
              <MenuList>
                <ChakraLink
                  href={`mailto:${reportEmail}?subject=${encodeURI(
                    'Report a collection',
                  )}&body=${encodeURI(
                    `I would like to report the following collection "${collection.name}" (#${collection.address})\nReason: `,
                  )}`}
                  isExternal
                >
                  <MenuItem>{t('collection.header.menu.report')}</MenuItem>
                </ChakraLink>
              </MenuList>
            </Menu>
          </Flex>
        )}
      </Flex>
      {collection.description && (
        <Box mt={4}>
          <Truncate size="lg" color="gray.500" length={200}>
            {collection.description}
          </Truncate>
        </Box>
      )}
      <Flex flexDirection="column" mt={4}>
        <Text variant="button1" color="brand.black">
          {chain?.name || '-'}
        </Text>
        <Text variant="subtitle2" color="gray.500">
          {t('collection.header.data-labels.chain')}
        </Text>
      </Flex>
    </>
  )
}

export default DropHeader