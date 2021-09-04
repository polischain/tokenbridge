require("dotenv").config()

const Web3 = require("web3")
const {EternalStorageProxy} = require("./contracts");

const web3Foreign = new Web3(process.env.FOREIGN_RPC)
const web3Home = new Web3(process.env.HOME_RPC)

const DEPLOYER = web3Foreign.eth.accounts.privateKeyToAccount("0x" + process.env.DEPLOYER_PRIVATE_KEY)

web3Foreign.eth.accounts.wallet.add(DEPLOYER)
web3Foreign.eth.defaultAccount = DEPLOYER.address
web3Home.eth.accounts.wallet.add(DEPLOYER)
web3Home.eth.defaultAccount = DEPLOYER.address


async function main() {
    console.log("\n==> Deploying arbitrary message for:")
    console.log("HOME:                    ", await web3Home.eth.getChainId())
    console.log("FOREIGN:                 ", await web3Foreign.eth.getChainId())
    console.log("DEPLOYER:                ", DEPLOYER.address)

    console.log('==> Deploying storage for HOME validators')
    const storageValidatorsHome = new web3Home.eth.Contract(EternalStorageProxy.abi)
    await storageValidatorsHome.deploy({data: EternalStorageProxy.bytecode, arguments: []})
}

async function deployContract(contract, web3, args) {
    const instance = new web3.eth.Contract(contract.abi)
    const result = instance.deploy({data: contract.bytecode, arguments: args}).encodeABI()
}

async function getEstimateGas() {

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });