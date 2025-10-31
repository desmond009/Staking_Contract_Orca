// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

interface IOrcaCoin {
    function mint(address _to, uint _amount) external;
}

contract StakingContract_Original {
    uint256 public totalStaked;
    mapping(address => uint256) public stakers_Balance;

    uint256 public constant REWARD_PER_SEC_PER_ETH = 1;

    IOrcaCoin public orcaCoin;

    struct UserInfo {
        uint256 amountStaked;
        uint256 lastRewardTime;
        uint256 rewardDebt;
    }

    mapping(address => UserInfo) public userInfo;

    // Constructor
    constructor(IOrcaCoin _orcaCoin_token) {
        orcaCoin = _orcaCoin_token;
    }


    // update rewards 
    function _updateRewards(address _user) internal {
        UserInfo storage user = userInfo[_user];

        if(user.lastRewardTime == 0){
            user.lastRewardTime = block.timestamp;
            return;
        }

        uint timeDiff = block.timestamp - user.lastRewardTime;

        uint additionalReward = (timeDiff * user.amountStaked * REWARD_PER_SEC_PER_ETH) / 1e18;

        user.rewardDebt += additionalReward;
        user.lastRewardTime = block.timestamp;
    }

    // Stake Function 
    function stake(uint _amount) public payable {
        require(_amount > 0, "Please send some value");
        require(msg.value > 0, "Please send some value");
        require(msg.value == _amount, "Please send the exact amount");

        // Update the rewards
        _updateRewards(msg.sender);

        userInfo[msg.sender].amountStaked += _amount;
        totalStaked += _amount;
        stakers_Balance[msg.sender] += _amount;
    }

    // Unstake Function
    function unstake(uint _amount) public {
        require(_amount > 0, "Please send some value");

        UserInfo storage user = userInfo[msg.sender];

        require(user.amountStaked >= _amount, "You don't have enough balance");

        _updateRewards(msg.sender);

        user.amountStaked -= _amount;
        totalStaked -= _amount;
        stakers_Balance[msg.sender] -= _amount;

        payable(msg.sender).transfer(_amount); 
    }

    // Claim Rewards
    function claimRewards() public {
        _updateRewards(msg.sender);
        UserInfo storage user = userInfo[msg.sender];

        orcaCoin.mint(msg.sender, user.rewardDebt);
        user.rewardDebt = 0;
    }

    // Get Rewards or Print Rewards
    function getRewards() public view returns (uint256) {
        UserInfo storage user = userInfo[msg.sender];
        uint timeDiff = block.timestamp - user.lastRewardTime;

        if(timeDiff == 0){
            return user.rewardDebt;
        }

        return ((timeDiff * user.amountStaked * REWARD_PER_SEC_PER_ETH) + user.rewardDebt);
    }
 }