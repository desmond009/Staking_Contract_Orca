// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "../src/OrcaCoin.sol";

contract OrcaCoinTest is Test {
    OrcaCoin oc;

    function setUp() public {
        oc = new OrcaCoin(address(this));
    }

    // CHeck that the initial supply will be zero
    function testInitalSupply() public view {
        assert(oc.totalSupply() == 0);
    }

    function testMint() public {
        oc.mint(msg.sender, 100);
        assert(oc.balanceOf(msg.sender) == 100);
    }

    function testChangingStakingContract() public {
        oc.updateStakingContractAddress(0x7361360D60BE09274EccfebAb510753cA894a7d7);
        vm.startPrank(0x7361360D60BE09274EccfebAb510753cA894a7d7);
        oc.mint(0x7361360D60BE09274EccfebAb510753cA894a7d7, 100);
        assert(oc.balanceOf(0x7361360D60BE09274EccfebAb510753cA894a7d7) == 100);
    }

}
