const hre = require("hardhat")

const BLOCK_REWARD_ADDRESS = "0x4c40CE3fb33A6781c903Bc830804DE4195Cc966f" // SPARTA
const FOREIGN_BRIDGE_TOKEN = "0xf4a772216e9266d062cee940b13a709f3542247b" // MockToken on Mumbai

async function main() {
    const ForeignBridgeErcToNative = await hre.ethers.getContractFactory("ForeignBridgeErcToNative")
    const HomeBridgeErcToNative = await hre.ethers.getContractFactory("HomeBridgeErcToNative")

    //const bridge = HomeBridgeErcToNative.attach("0x8B95D92bea3e67796A105c19c524Ee8ef87Bd537")
    const bridge = ForeignBridgeErcToNative.attach("0x1ED9cA7E442a91591AcecFb2D40e843e4FEE00ff")

    // MaxPerTx 50,000
    let tx = await bridge.setExecutionMaxPerTx("50000000000000000000000")
    await tx.wait()
    tx = await bridge.setMaxPerTx("50000000000000000000000")
    await tx.wait()

    // DailyLimit 100,000
    tx = await bridge.setExecutionDailyLimit("1000000000000000000000000")
    await tx.wait()
    tx = await bridge.setDailyLimit("1000000000000000000000000")
    await tx.wait()

    // MinLimit 10
    tx = await bridge.setMinPerTx("10000000000000000000")
    await tx.wait()

}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });