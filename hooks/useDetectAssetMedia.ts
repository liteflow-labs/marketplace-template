import { useMemo } from 'react'

export type FileResult = {
  url: string
  mimetype?: string | null
} | null

export default function useDetectAssetMedia(
  asset:
    | {
        image: string
        animationUrl: string | null | undefined
        unlockedContent:
          | {
              url: string
              mimetype: string | null
            }
          | null
          | undefined
      }
    | undefined
    | null,
): {
  media: FileResult
  fallback: FileResult | null
} {
  const media = useMemo(() => {
    if (!asset) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="transparent" /></svg>`
      return {
        url: `data:image/svg+xml;base64,${btoa(svg)}`,
        mimetype: 'image/svg+xml',
      }
    }
    if (asset.unlockedContent) return asset.unlockedContent
    if (asset.animationUrl) return { url: asset.animationUrl }
    return { url: asset.image }
  }, [asset])

  const fallback = useMemo(() => {
    if (!asset) return null
    if (asset.animationUrl) return { url: asset.image }
    return null
  }, [asset])

  return {
    media,
    fallback,
  }
}
