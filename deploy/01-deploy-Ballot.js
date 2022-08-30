const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    log("-------------------------------------------")

    let proposalNames = ["New_Dishwasher", "New_TV", "New_BBQ"]

    const args = [proposalNames]

    const ballot = await deploy("Ballot", {
        from: deployer,
        args: args,
        log: true,
    })

    log("--------------------------------------------")
}

module.exports.tags = ["all"]
