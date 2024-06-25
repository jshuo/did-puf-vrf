// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

/**
 * *****************************************************************************
 * @dev USAGE
 *
 * @dev Randomness Consumer contracts must inherit from RandomConsumerBase and
 * implement `randomCallbackImpl` to override the virtual base function.
 *
 * @dev   contract MyContract is RandomConsumerBase {
 * @dev     function executeImpl(uint256 requestId, uint256 entropy) internal override(RandomConsumerBase) {
 * @dev       // YOUR CUSTOM CODE HERE
 * @dev     }
 * @dev   }
 * */
abstract contract RandomConsumerBase is Context {
    error CanOnlyBeCalledByPrecompile(address have, address want);

    /**
     * @dev Receives `entropy` for `requestId`.  Contract must override this function
     *
     * Returns null
     */
    function executeImpl(uint256 requestId, uint256 entropy) internal virtual;

    /**
     * @dev `executeEntropy` delegates the data to the `executeImpl`
     *
     * Returns null
     */
    function executeEntropy(uint256 requestId, uint256 entropy) external {
        if (msg.sender != 0x0000000000000000000000000000000000000801) {
            revert CanOnlyBeCalledByPrecompile(
                msg.sender,
                0x0000000000000000000000000000000000000801
            );
        }
        executeImpl(requestId, entropy);
    }
}