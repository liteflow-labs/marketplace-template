# Marketplace template

This repository is an example of an application running on the Liteflow infrastructure to showcase the uses of the infrastructure and/or be used as a starter kit to launch a product fast.

## Feature included

This template includes a few important features likes:

- Listing the NFTs of the platform
- Highlight NFTs on the home page
- Explore with filters of NFTs
- Offers for NFTs
  - Fixed price
  - Open offer
  - Timed auctions
- Profile for users with
  - NFTs on sale
  - NFTs owned
  - NFTs created
  - Bids
  - Trades
  - Offers
- Notifications
- Search
- Creation of NFTs
- NFT history
- Multi-language support
- Wallet connection with
  - Metamask
  - Coinbase
  - Wallet connect
  - Magic link

It also includes optional features like:

- Lazymint for NFTs
- Unlockable content for NFTs
- Multicurrency support
- Advanced fee support

## Libraries used

This template is based on the following tech stack

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Typescript](https://www.typescriptlang.org/)
- [Liteflow](https://liteflow.com/)
- [ChakraUI](https://chakra-ui.com/)
- [Web3React](https://github.com/Uniswap/web3-react)
- [Next translate](https://github.com/aralroca/next-translate)

## Get started

To get started you will first need to set your environmental variables in the `.env` file based on the `.env.example` file.

Once done you can install all the dependencies with `npm i` then run

```
npm run dev
```

Your application is now accessible at http://localhost:3000

## Customization

#### Theme

The theme is based on [ChakraUI](https://chakra-ui.com/) and can be [customized](https://chakra-ui.com/docs/styled-system/customize-theme) in the `/styles/theme.ts` file.

#### Application

Your application includes default navigation, metadata, and wallets that can be updated directly from the `pages/_app.tsx` file.
