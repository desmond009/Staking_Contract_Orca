// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OrcaCoin is ERC20 { 
    // Here we store the address of the staking contract
    address public stakingContract_address;

    constructor(address _stakingContract) ERC20 ("OrcaCoin", "ORCA") {
        stakingContract_address = _stakingContract;
    }

    // Mint Function only call by the staking Contract address
    function mint(address _to, uint _amount) public {
        _mint(_to, _amount);
    }
}
