import { AspectRatio, Box, Flex, Heading, Text } from '@chakra-ui/react'
import { FC } from 'react'
import Image from '../Image/Image'
import Link from '../Link/Link'

export type Props = {
  description?: string
  descriptionIsTruncated?: boolean
  href: string
  isExternal?: boolean
  image?: string
  imageRatio?: number
  title: string
  titleIsTruncated?: boolean
}

const HomeSectionCard: FC<Props> = ({
  description,
  descriptionIsTruncated,
  href,
  isExternal,
  image,
  imageRatio,
  title,
  titleIsTruncated,
}) => {
  return (
    <Link href={href} isExternal={isExternal} w="full">
      <Box
        borderRadius="2xl"
        border="1px solid"
        borderColor="gray.200"
        shadow="sm"
        w="full"
        h="full"
        overflow="hidden"
      >
        <AspectRatio ratio={imageRatio || 16 / 9}>
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes="
              (min-width: 80em) 292px,
              (min-width: 62em) 25vw,
              50vw"
              objectFit="cover"
            />
          ) : (
            <Box bg="gray.200" height="full" />
          )}
        </AspectRatio>
        <Flex
          direction="column"
          justify="center"
          overflow="hidden"
          p={4}
          gap={1}
        >
          <Heading
            as="h3"
            variant="heading2"
            title={title}
            isTruncated={titleIsTruncated ? true : false}
          >
            {title}
          </Heading>
          {description && (
            <Text
              variant="subtitle2"
              color="gray.500"
              title={description}
              noOfLines={descriptionIsTruncated ? 2 : undefined}
            >
              {description}
            </Text>
          )}
        </Flex>
      </Box>
    </Link>
  )
}

export default HomeSectionCard
