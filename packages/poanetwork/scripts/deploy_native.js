const hre = require("hardhat")

const owner = {
    home: process.env.HOME_OWNER,
    foreign: process.env.FOREIGN_OWNER
}

const chainIds = {
    home: process.env.HOME_CHAINID,
    foreign: process.env.FOREIGN_CHAINID
}

async function main() {

    const EternalStorageProxy = await hre.ethers.getContractFactory("EternalStorageProxy")
    const BridgeValidators = await hre.ethers.getContractFactory("BridgeValidators")
    const HomeBridgeErcToNative = await hre.ethers.getContractFactory("HomeBridgeErcToNative")
    const ForeignBridgeErcToNative = await hre.ethers.getContractFactory("ForeignBridgeErcToNative")

    console.log("==> Deploying contracts for:", hre.network.name.toUpperCase())
    const home = hre.network.name === "home"
    const net = home ? "home" : "foreign"

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
    tx = await bridgeStorageAccess.initialize(
        chainIds.home,
        chainIds.foreign,
        bridgeValidatorsProxyAccess.address,
        hre.ethers.utils.parseEther("100000"),
        "10000000000",
        "3",
        owner[net]
    )
    await tx.wait()

    console.log("==> Transfer " + net + " native bridge ownership")
    tx = await storageBridge.transferProxyOwnership(owner[net])
    await tx.wait()

    console.log("==> Finished " + net.toUpperCase() + " Native Bridge deployment")

    console.log("\n")
    console.log(net.toUpperCase(), "Bridge Validators:     ", storageValidators.address)
    console.log(net.toUpperCase(), "Native Bridge:              ", storageBridge.address)
    console.log("\n")
}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });