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

}
