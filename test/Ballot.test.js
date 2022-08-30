const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Ballot Unit Tests", () => {
          let deployer, ballot, chairperson
          const chainId = network.config.chainId

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              ballot = await ethers.getContract("Ballot", deployer)
              chairperson = await ballot.getChairperson()
          })

          describe("construtor", () => {
              it("allows proposals to be added to the array", async () => {
                  const firstProposal = await ballot.getProposalName(0)
                  assert.equal(firstProposal, "New_Dishwasher")
              })
              it("sets the owner as the chairperson", async () => {
                  assert.equal(chairperson, deployer)
              })
          })

          describe("giveRightToVote", () => {
              let accounts, attacker, attackerConnectedContract

              beforeEach(async () => {
                  accounts = await ethers.getSigners()
                  attacker = accounts[1]
                  attackerConnectedContract = await ballot.connect(attacker)
              })
              it("reverts if the person is not the chairperson", async () => {
                  await expect(
                      attackerConnectedContract.giveRightToVote(accounts[2].address)
                  ).to.be.revertedWith("You_are_not_the_chairperson")
              })
              it("reverts if the address has already voted", async () => {
                  await ballot.giveRightToVote(attacker.address)
                  await attackerConnectedContract.vote(0)
                  await expect(ballot.giveRightToVote(attacker.address)).to.be.revertedWith(
                      "User_already_voted"
                  )
              })
              it("updates the weight after giving someone the right to vote", async () => {
                  await attackerConnectedContract.enterBallot()
                  const attackerWeight = await ballot.getVoterWeight(0)
                  await ballot.giveRightToVote(attacker.address)
                  assert.equal(attackerWeight.toString(), "1")
              })
          })
          describe("vote", () => {
              let accounts, attacker, attackerConnectedContract

              beforeEach(async () => {
                  accounts = await ethers.getSigners()
                  attacker = accounts[1]
                  attackerConnectedContract = await ballot.connect(attacker)
              })
              it("updates the voted boolean", async () => {
                  await attackerConnectedContract.enterBallot()
                  await ballot.giveRightToVote(attacker.address)
                  await attackerConnectedContract.vote(0)
                  const attackerVoted = await ballot.getVotedBool(0)
                  assert.equal(attackerVoted.toString(), "true")
              })
              it("updates the votes accumulated for a given proposal", async () => {
                  await ballot.giveRightToVote(attacker.address)
                  await attackerConnectedContract.vote(0)
                  const proposalVotes = await ballot.getVotesAccumulated(0)
                  assert.equal(proposalVotes.toString(), "1")
              })
          })
      })

//   const additionalEntrants = 3
//   const startingAccountIndex = 1
//   const accounts = await ethers.getSigners()
//   for (
//       let i = startingAccountIndex;
//       i < startingAccountIndex + additionalEntrants;
//       i++
//   ) {
//       const accountConnectedBallot = await ballot.connect(accounts[i])
//       await accountConnectedBallot.enterBallot()
//   }
