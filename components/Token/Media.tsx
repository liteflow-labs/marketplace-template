import { Box, Center, Icon, Stack, Text, useTheme } from '@chakra-ui/react'
import { FaImage } from '@react-icons/all-files/fa/FaImage'
import { FC, useCallback, useEffect, useState } from 'react'
import { AssetMedia } from '../../hooks/useDetectAssetMedia'
import Image from '../Image/Image'

const TokenMedia: FC<{
  media: AssetMedia
  fallback: AssetMedia | null
  defaultText: string
  controls?: boolean
  fill?: boolean
  sizes: string
}> = ({ media, fallback, defaultText, fill, controls, sizes }) => {
  const { colors } = useTheme()

  const [imageError, setImageError] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [mediaToDisplay, setMediaToDisplay] = useState<AssetMedia | null>(media)

  const onImageError = useCallback(() => setImageError(true), [])
  const onVideoError = useCallback(() => setVideoError(true), [])

  // Switch to the fallback when there is an error with the main media
  useEffect(() => {
    if (!imageError) return
    if (!videoError) return
    if (mediaToDisplay?.url === fallback?.url) return
    setMediaToDisplay(fallback)
  }, [imageError, videoError, fallback, mediaToDisplay])

  // Reset all errors when the media to display changes (when switching to the fallback)
  useEffect(() => {
    setImageError(false)
    setVideoError(false)
  }, [mediaToDisplay])

  useEffect(() => setMediaToDisplay(media), [media])

  // cannot display anything
  if (!mediaToDisplay || (imageError && videoError && mediaToDisplay))
    return (
      <>
        <svg viewBox="0 0 1 1">
          <rect width="1" height="1" fill={colors.brand[100]} />
        </svg>
        <Center width="100%" height="100%" position="absolute">
          <Stack align="center" spacing={3}>
            <Icon as={FaImage} color="gray.500" boxSize="4em" />
            <Text color="gray.500" fontWeight="600">
              An issue occurred
            </Text>
          </Stack>
        </Center>
      </>
    )

  // display video
  if (
    (mediaToDisplay.mimetype?.startsWith('video/') || imageError) &&
    !videoError
  ) {
    return (
      <Box
        as="video"
        src={mediaToDisplay.url}
        autoPlay
        playsInline
        muted
        loop
        controls={controls}
        maxW="full"
        maxH="full"
        onError={onVideoError}
      />
    )
  }

  return (
    <Box position="relative" w="full" h="full">
      <Image
        src={mediaToDisplay.url}
        alt={defaultText}
        onError={onImageError}
        fill
        objectFit={fill ? 'cover' : 'contain'}
        sizes={sizes}
        unoptimized={mediaToDisplay.mimetype === 'image/gif'}
      />
    </Box>
  )
}

export default TokenMedia
