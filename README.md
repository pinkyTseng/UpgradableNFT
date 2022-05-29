# Upgradable NFT based on OpenZeppelin

## Introduction
This project is the Upgradable NFT project based on OpenZeppelin build with Hardhat. It is built based on my previous project. The features are the same as my [previous NFT project](https://github.com/pinkyTseng/NftTruffle1), but add the upgradable ability through OpenZeppelin TransparentUpgradeableProxy. Building upgradable smart contracts are needed and important in some situations, such as the contract has the concept of version, or some unexpected serious bug or attack happened is needed to fix, etc. Therefore the main goal is to build a contract that can be upgraded, not focus on what the new function the contract provides. Therefore, I remove some features and their storage variables from my [previous NFT project](https://github.com/pinkyTseng/NftTruffle1) in the pre-upgraded version and add them back to the upgraded version. The changing upgraded features are below two features.

- It should be able to set up the max count when the user mints each time.
- It should be able to set up the max count each user owns.

## Demo and Hint
The project online demo on the Rinkeby test network is [here](https://rinkeby.etherscan.io/address/0xa55658f3b38443A87dA102A9674D0E2D2394FDD8), and you also can search "CharlieNft U15" at OpenSea Testnet to find them. A note worth mentioning is that OpenSea Testnet sometimes delays very seriously that it looks like it fails to associate with OpenSea. I have experienced that it takes a night for the correct results to show up at OpenSea correctly. The serious very long delay at OpenSea Testnet occurs seldom, but you hardly know when it happens.

