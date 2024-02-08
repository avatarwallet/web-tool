[中文README](./README_CN.md)
# AvatarWallet  Rescue Web Tool

* This tool allows AvatarWallet users to transfer assets within their wallet without using the official Avatar API. 
* It is designed for emergency response scenarios, demonstrating the wallet's degree of decentralization.

## Prerequisites

1. A MetaMask wallet for paying gas fees on the blockchain.
2. The Google account used to create the AvatarWallet, for signing transactions.

## Installation & Running

```bash
yarn install
yarn dev
```
## Steps
1. Select the wallet environment, which for most users will be **production**.
2. Choose the blockchain you need to operate on.
3. Click 'Connect AvatarWallet with Google'.
4. Make sure that 'AvatarWalletAddress' is right
5. Enter the token address, the amount of tokens to transfer, and the recipient's token address.(If you want to send 1 usdt ,token amount is 1.)
6. Click 'Send token with MetaMask' and complete the subsequent process in your MetaMask wallet.


## Error Handling
### Audience not allowed
* If you are using the wallet created with AvatarWallet, it means AvatarWallet has not yet ceased service. You should use the client ID built into the code for login.
    * If AvatarWallet has announced the cessation of its services, you will need to prepare your own Google client ID to obtain OAuth information, as detailed here: https://support.google.com/cloud/answer/6158849?hl=en.
    * After creating the clientID, replace the clientId in client.config.ts.
    * Config  callback url whitelist in google cloud console to allow localhost to receive callback
* If you have created a wallet with another wallet service provider, please contact the corresponding service provider.