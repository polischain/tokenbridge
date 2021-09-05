const hre = require("hardhat")
const fs = require("fs")

const owner = {
    home: process.env.HOME_OWNER,
    foreign: process.env.FOREIGN_OWNER
}

const chainIds = {
    home: process.env.HOME_CHAINID,
    foreign: process.env.FOREIGN_CHAINID
}

const BLOCK_REWARD_ADDRESS = "0x4c40CE3fb33A6781c903Bc830804DE4195Cc966f" // SPARTA
const FOREIGN_BRIDGE_TOKEN = "0xf4a772216e9266d062cee940b13a709f3542247b" // MockToken on Mumbai

async function main() {
    const EternalStorageProxy = await hre.ethers.getContractFactory("EternalStorageProxy")
    const BridgeValidators = await hre.ethers.getContractFactory("BridgeValidators")
    const HomeBridgeErcToNative = await hre.ethers.getContractFactory("HomeBridgeErcToNative")
    const ForeignBridgeErcToNative = await hre.ethers.getContractFactory("ForeignBridgeErcToNative")

    console.log("==> Deploying contracts for:", hre.network.name.toUpperCase())
    const home = hre.network.name === "home"
    const net = home ? "home" : "foreign"

    let HOME_BRIDGE;
    if (!home) {
        let deployment = await fs.readFileSync("./home_native_deployment.json")
        HOME_BRIDGE = JSON.parse(deployment.toString()).bridge
    }

    console.log("==> Deploying storage for "  + net + " validators")
    const storageValidators = await EternalStorageProxy.deploy()
    await storageValidators.deployed()

    console.log("==> Deploying " + net + " bridge validators implementation")
    const bridgeValidators = await BridgeValidators.deploy()
    await bridgeValidators.deployed()

    console.log("==> Hook up eternal storage to BridgeValidators")
    let tx = await storageValidators.upgradeTo("1", bridgeValidators.address)
    await tx.wait()

    console.log("==> Initialize " + net + " bridge validators")
    const required = process.env.VALIDATORS_REQUIRED
    const validators = process.env.VALIDATORS.split(",")
    const bridgeValidatorsProxyAccess = BridgeValidators.attach(storageValidators.address)
    tx = await bridgeValidatorsProxyAccess.initialize(required, validators, owner[net])
    await tx.wait()

    console.log("==> Transfer bridge validators ownership")
    tx = await storageValidators.transferProxyOwnership(owner[net])
    await tx.wait()

    console.log("==> Deploying storage for " + net + " native bridge")
    const storageBridge = await EternalStorageProxy.deploy()
    await storageBridge.deployed()

    console.log("==> Deploying " + net + " native bridge implementation")
    let amb;
    if (home) {
        amb = await HomeBridgeErcToNative.deploy()
    } else {
        amb = await ForeignBridgeErcToNative.deploy()
    }
    await amb.deployed()

    console.log("==> Hook up eternal storage to native bridge")
    tx = await storageBridge.upgradeTo("1", amb.address)
    await tx.wait()

    console.log("==> Initialize " + net + " native bridge")
    let bridgeStorageAccess;
    if (home) {
        bridgeStorageAccess = await HomeBridgeErcToNative.attach(storageBridge.address)
    } else {
        bridgeStorageAccess = await ForeignBridgeErcToNative.attach(storageBridge.address)
    }

    if (home) {
        tx = await bridgeStorageAccess.initialize(
            bridgeValidatorsProxyAccess.address,
            [
                hre.ethers.utils.parseUnits("100000", "ether"), // Home Daily limit 100,000
                hre.ethers.utils.parseUnits("10000", "ether"),  // Home Max amount per tx 10,000
                hre.ethers.utils.parseUnits("10", "ether"),     // Home Min amount per tx 1
            ],
            process.env.HOME_GAS_PRICE,
            "3",
            BLOCK_REWARD_ADDRESS,
            [
                hre.ethers.utils.parseUnits("100000", "ether"), // Foreign Daily limit 100,000
                hre.ethers.utils.parseUnits("10000", "ether"),  // Foreign Max amount per tx 10,000
            ],
            owner[net],
            0
        )
    } else {
        tx = await bridgeStorageAccess.initialize(
            bridgeValidatorsProxyAccess.address,
            FOREIGN_BRIDGE_TOKEN,
            6,
            process.env.FOREIGN_GAS_PRICE,
            [
                hre.ethers.utils.parseUnits("100000", "ether"), // Foreign Daily limit 100,000
                hre.ethers.utils.parseUnits("10000", "ether"),  // Foreign Max amount per tx 10,000
                hre.ethers.utils.parseUnits("10", "ether"),     // Foreign Min amount per tx 1
            ],
            [
                hre.ethers.utils.parseUnits("100000", "ether"), // Home Daily limit 100,000
                hre.ethers.utils.parseUnits("10000", "ether"),  // Home Max amount per tx 10,000
            ],
            owner[net],
            0,
            HOME_BRIDGE
        )
    }

    await tx.wait()

    console.log("==> Transfer " + net + " native bridge ownership")
    tx = await storageBridge.transferProxyOwnership(owner[net])
    await tx.wait()

    console.log("==> Finished " + net.toUpperCase() + " Native Bridge deployment")

    console.log("\n")
    console.log(net.toUpperCase(), "Bridge Validators:     ", storageValidators.address)
    console.log(net.toUpperCase(), "Native Bridge:         ", storageBridge.address)
    console.log("\n")

    if (home) {
        await fs.writeFileSync('home_native_deployment.json', JSON.stringify({validators: storageValidators.address, bridge: storageBridge.address}))
    } else {
        await fs.writeFileSync('foreign_native_deployment.json', JSON.stringify({validators: storageValidators.address, bridge: storageBridge.address}))
    }
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });