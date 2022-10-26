import NextHead from 'next/head'
import { FC, PropsWithChildren } from 'react'
import environment from '../environment'

type Props = {
  title: string
  description?: string
  image?: string
}

const Head: FC<PropsWithChildren<Props>> = ({
  title,
  description,
  image,
  children,
}) => {
  return (
    <NextHead>
      <title>{title} - Liteflow NFT Marketplace</title>
      <meta property="og:title" content={title} />
      <meta name="twitter:title" content={title} />
      {description && (
        <>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
          <meta name="twitter:description" content={description} />
        </>
      )}
      <meta
        property="og:image"
        content={image || `${environment.BASE_URL}/og-image.jpg`}
      />
      <meta
        name="twitter:image"
        content={image || `${environment.BASE_URL}/twitter-card.jpg`}
      />
      {children}
    </NextHead>
  )
}

export default Head
