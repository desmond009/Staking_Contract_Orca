export const stakingWithEmissionsAbi = [
  {
    type: 'function',
    name: 'stake',
    stateMutability: 'payable',
    inputs: [{ name: '_amount', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'unstake',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_amount', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claimRewards',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getRewards',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'userInfo',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [
      { name: 'amountStaked', type: 'uint256' },
      { name: 'lastRewardTime', type: 'uint256' },
      { name: 'rewardDebt', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'totalStaked',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
]

