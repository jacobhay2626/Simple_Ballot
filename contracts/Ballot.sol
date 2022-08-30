//SPDX-License-Identifier: MIT

pragma solidity ^0.8.5;

error You_are_not_the_chairperson();
error User_already_voted();

contract Ballot {
    // ----------------------------------------------------
    // EVENTS

    event ballotEnter(address indexed entree);

    // ----------------------------------------------------

    struct Voter {
        address addressOfVoter;
        uint256 weight; // Weight of vote
        bool voted; // Have they voted yet or not
        uint256 vote; // Index of the proposal they voted for
    }

    struct Proposal {
        string name;
        uint256 votesAccumulated;
    }

    // ----------------------------------------------------

    // VARIABLES
    address public chairperson;
    mapping(address => Voter) public voter;
    Proposal[] public proposals;
    Voter[] public votersArray;

    // ----------------------------------------------------

    constructor(string[3] memory proposalNames) {
        chairperson = msg.sender;
        voter[chairperson].weight = 1;

        for (uint256 i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], votesAccumulated: 0}));
        }
    }

    // Initiating the contract, want to set the chairperson to the creator of the contract and the weight of their vote to 1 so they will be able to delegate.
    // Create for loop that allows us to add however many proposals we want to the array.

    // ----------------------------------------------------

    function giveRightToVote(address NewVoter) external {
        if (msg.sender != chairperson) {
            revert You_are_not_the_chairperson();
        }
        if (voter[NewVoter].voted) {
            revert User_already_voted();
        }
        require(voter[NewVoter].weight == 0);
        voter[NewVoter].weight = 1;
    }

    // function that allows the chairperson to give an address the right to vote.

    // ----------------------------------------------------

    function vote(uint256 proposal) external {
        Voter storage sender = voter[msg.sender];
        require(sender.weight != 0, "Cannot vote");
        require(!sender.voted, "Already voted");

        sender.voted = true;
        sender.vote = proposal;

        proposals[proposal].votesAccumulated += sender.weight;
    }

    // cannot vote if weight is 0 or if already voted.
    // modified the struct and added the vote to the proposal

    // ----------------------------------------------------

    function winningProposal() public view returns (uint256 winningProposal_) {
        uint256 winningVoteCount = 0;
        for (uint256 p = 0; p < proposals.length; p++) {
            if (proposals[p].votesAccumulated > winningVoteCount) {
                winningVoteCount = proposals[p].votesAccumulated;
                winningProposal_ = p;
            }
        }
    }

    // returns the identity of the proposal with the most votes.

    // ----------------------------------------------------

    function winnerName() external view returns (string memory winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }

    // ----------------------------------------------------

    function enterBallot() public payable {
        votersArray.push(Voter({addressOfVoter: msg.sender, weight: 0, voted: false, vote: 0}));

        emit ballotEnter(msg.sender);
    }

    // ----------------------------------------------------
    // Getter Functions

    function getProposalName(uint256 index) public view returns (string memory) {
        return proposals[index].name;
    }

    function getChairperson() public view returns (address) {
        return chairperson;
    }

    function getVoterWeight(uint256 index) public view returns (uint256) {
        return votersArray[index].weight;
    }

    function getVotedBool(uint256 index) public view returns (bool) {
        return votersArray[index].voted;
    }

    function getVotesAccumulated(uint256 index) public view returns (uint256) {
        return proposals[index].votesAccumulated;
    }
}

//         require(msg.sender == chairperson);
//         require(!voter[NewVoter].voted);
