// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingContract{
    uint public totalStaked;
    mapping(address => uint) public stakers_Balance;

    // Constructor
    constructor(){

    }

    // Staking Function
    function stake() public payable{
        require(msg.value > 0, "Please send some value");
        uint _amount = msg.value;

        totalStaked += _amount;
        stakers_Balance[msg.sender] += _amount;
    }

    // Unstaking Function 
    function Unstake(uint _amount) public {
        require(stakers_Balance[msg.sender] >= _amount, "You don't have enough balance");
        stakers_Balance[msg.sender] -= _amount;
        totalStaked -= _amount;

        payable(msg.sender).transfer(_amount);
    }

    // Get Rewards 
    function getRewards () public {

    }

    // Claim Rewards
    function claimRewards () public {

    }

    // Check balances
    function checkBalance(address _address) public view returns (uint){
        return stakers_Balance[_address];
    }
}