require("@nomiclabs/hardhat-ethers");
require('dotenv').config()

let private_key = process.env.PRIVATE_KEY;
let home = process.env.HOME_RPC;
let foreign = process.env.FOREIGN_RPC;

module.exports = {
    networks: {
        hardhat: {},
        home: {
            gasPrice: 1000000000,
            url: home,
            accounts: [private_key]
        },
        foreign: {
            gasPrice: 1000000000,
            url: foreign,
            accounts: [private_key]
        }
    },
    solidity: {
        compilers: [{
            version: "0.7.5",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            },
        }],
    }
};