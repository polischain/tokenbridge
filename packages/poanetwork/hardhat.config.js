require("@nomiclabs/hardhat-ethers");

require('dotenv').config()

let private_key = process.env.DEPLOYER_PRIVATE_KEY;

module.exports = {
  networks: {
    hardhat: {},
    sparta: {
      chainId: 333888,
      gasPrice: 1000000000,
      url: "https://sparta-rpc.polis.tech",
      accounts: [private_key]
    },
    olympus: {
      chainId: 333999,
      gasPrice: 1000000000,
      url: "https://rpc.polis.tech",
      accounts: [private_key]
    }
  },
  solidity: {
    compilers: [{
      version: "0.4.24",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }],
  },
  mocha: {
    timeout: 2000000
  }
};