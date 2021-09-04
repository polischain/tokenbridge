require("@nomiclabs/hardhat-ethers");
require('dotenv').config()

let private_key = process.env.PRIVATE_KEY;
let home = process.env.HOME;
let foreign = process.env.FOREIGN;

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
            version: "0.4.24",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            },
        }, {
            version: "0.7.6",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            },
        }, {
            version: "0.4.18",
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