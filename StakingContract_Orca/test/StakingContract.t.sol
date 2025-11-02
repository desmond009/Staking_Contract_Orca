// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/StakingContract_Original.sol";
import "../src/OrcaCoin.sol";

contract StakingContract_OriginalTest is Test {
    StakingContract_Original stakingContract;
    OrcaCoin orcaCoin;

    // Make this test contract ....to be payable
    // So that this test contract ...can accept ether
    receive() external payable {}

    function setUp() public {
        orcaCoin = new OrcaCoin();
        stakingContract = new StakingContract_Original(IOrcaCoin(address(orcaCoin)));
        orcaCoin.updateStakingContractAddress(address(stakingContract));
    }

    // Test the staking function
    function testStaking() public {
        uint amount = 1 ether;
        stakingContract.stake{value: amount}(amount);

        assert(stakingContract.totalStaked() == amount);
    }

    // Test the Unstake function
    function testUnstaking() public {
        uint amount = 1 ether;
        stakingContract.stake{value: amount}(amount);

        stakingContract.unstake(amount);
        assert(stakingContract.totalStaked() == 0);
    }

    // Test the get rewards function
    function testGetRewards() public {
        uint amount = 1 ether;
        stakingContract.stake{value: amount}(amount);

        vm.warp(block.timestamp + 1);
        uint rewards = stakingContract.getRewards();

        assert(rewards == 1 ether);
    }

    // Test the get rewards function in a complex way
    function testGetRewardsComplex() public {
        uint amount = 1 ether;
        stakingContract.stake{value: amount}(amount);
        vm.warp(block.timestamp + 1);
        stakingContract.stake{value: amount}(amount);
        vm.warp(block.timestamp + 1);
        uint rewards = stakingContract.getRewards();

        assert(rewards == 3 ether);
    }

    // Test the redeem reward function 
    function testRedeemRewards() public {
        uint amount = 1 ether;
        stakingContract.stake{value: amount}(amount);

        vm.warp(block.timestamp + 1);
        stakingContract.claimRewards();
        console.log("balance of ");
        console.log(orcaCoin.balanceOf(address(this)));
        
        assert(orcaCoin.balanceOf(address(this)) == 1 ether);
    }
}