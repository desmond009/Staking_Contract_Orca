// script/DeployOriginal.s.sol
// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
// Import the two contracts we are deploying
import "src/StakingContract_Original.sol";
import "src/OrcaCoin.sol";

contract DeployOriginal is Script {

    function run() public returns (StakingContract_Original, OrcaCoin) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy OrcaCoin first (using its modified, empty constructor)
        OrcaCoin orcaCoin = new OrcaCoin();

        // 2. Deploy StakingContract_Original, passing the new OrcaCoin address
        StakingContract_Original stakingContract = new StakingContract_Original(
            IOrcaCoin(address(orcaCoin))
        );

        // 3. Inject the StakingContract's address into OrcaCoin
        // This completes the circular dependency.
        orcaCoin.updateStakingContractAddress(address(stakingContract));

        vm.stopBroadcast();

        return (stakingContract, orcaCoin);
    }
}