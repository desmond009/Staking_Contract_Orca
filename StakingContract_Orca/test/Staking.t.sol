// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "../src/StakingContract.sol";

contract StakingContractTest is Test {
    StakingContract stakingContract;

    function setUp() public {
        stakingContract = new StakingContract();
    }

    // Make this contract ....to be payable
    // So that this test contract ...can accept ether 
    receive() external payable {}

    // Test the staking Contract
    function testStaking() public {
        stakingContract.stake{value: 100}();

        assert(stakingContract.checkBalance(address(this)) == 100);
    }
 
    // Test the unstaking Contract
    function testUnstaking() public {
        stakingContract.stake{value: 200}();

        stakingContract.Unstake(100);

        assert(stakingContract.checkBalance(address(this)) == 100);
    }
}