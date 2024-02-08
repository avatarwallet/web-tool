[README_EN](./README.md)
# AvatarWallet Web Tool

* 允许AvatarWallet用户在不使用Avatar官方API的情况下，转移钱包内资产。
* 用于应急响应场景，同时展示钱包的去中心化程度。

## 准备工作
1. 用于支付gas的metamask钱包，用于支付链上gas费用
2. 创建avatarwallet时使用的谷歌账号，用于签名和确认钱包地址

## 安装&运行
    yarn install
    yarn dev
## 步骤
1. 选择钱包环境，对普通用户来说一般是生产环境，
2. 选择你需要操作的链
3. 点击'Connect AvatarWallet with Google'
4. 确认 AvatarWalletAddress的正确性
5. 输入token地址和需要转移的token数量和接收token的地址（发送1usdt,token amount就填1）
6. 点击'Send token with MetaMask'，在metamask钱包完成后续流程

## 错误处理
### Audience not allowed
* 如果你使用avatarwallet创建钱包，说明avatarwallet还未停止服务，你需要使用代码内置的clientid进行登录
    * 如果avatarwallet钱包已宣布停止运营，你需要准备自己的google clientid用于获取oauth信息，参考链接https://support.google.com/cloud/answer/6158849?hl=cn
    * 创建clientId后替换`client.config.ts`中的clientId
    * 在google cloud console配置callback白名单来允许localhostj
* 如果你使用其他钱包服务商创建钱包，请联系对应的服务商

