interface Oracle {
    event RandomRequested(address indexed requester, uint256 indexed id);
    event RandomIssued(uint256 indexed id, uint256 entropy);
    function getEntropy(uint256 id) external view returns (address, uint256);
    function requestRandom(address contractAddress) external returns (uint256);
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./RandomConsumerBase.sol";

contract VerifiableRandomService is RandomConsumerBase {
    event RandomReceived(uint256 requestId, uint256 PUFentropy, uint256 currentEntropy);
    uint256 public currentRequestId = 0;
    uint256 public currentEntropy = 0;
    uint256 public tempEntropy = 0;
    address public manager;
    address payable[] public players;
    Oracle public oracle = Oracle(0x0000000000000000000000000000000000000801); // Add Oracle contract address as a constant

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > .005 ether);
        players.push(payable(msg.sender));
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, players, tempEntropy)));
    }

    function pickWinner() public restricted {
            oracle.requestRandom(address(this));
            // uint256 requestId = oracle.requestRandom(address(this));
            // currentRequestId = random()+requestId;
            // uint index = currentRequestId % players.length;
            // players[index].transfer(address(this).balance);
            // players = new address payable[](0);
            // emit RandomReceived(currentRequestId, currentRequestId, address(this));

    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }

    function executeImpl(uint256 requestId, uint256 PUFentropy) internal virtual override {

        currentRequestId = requestId;
        tempEntropy = PUFentropy;
        currentEntropy = random();
        uint index = currentEntropy % players.length;
        players[index].transfer(address(this).balance);
        players = new address payable[](0);
        emit RandomReceived(currentRequestId, PUFentropy, currentEntropy);
    }
}