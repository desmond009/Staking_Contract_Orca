// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OrcaCoin is ERC20, Ownable {
    
    // Here we store the address of the staking contract
    address public stakingContract;

    constructor() ERC20 ("OrcaCoin", "ORCA") Ownable(msg.sender) { }

    // Mint Function only call by the staking Contract address
    function mint(address _to, uint _amount) public {
        require(msg.sender == stakingContract);
        _mint(_to, _amount);
    }

    // THe owner who deployed the contract can change the stakingContract Address
    function updateStakingContractAddress(address _stakingContract) public onlyOwner {
        stakingContract = _stakingContract;
    }
}
