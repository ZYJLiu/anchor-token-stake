export type Stake = {
  version: "0.1.0"
  name: "stake"
  instructions: [
    {
      name: "initializeVault"
      accounts: [
        {
          name: "signer"
          isMut: true
          isSigner: true
        },
        {
          name: "vaultTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "mint"
          isMut: false
          isSigner: false
        },
        {
          name: "tokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "systemProgram"
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: "airdrop"
      accounts: [
        {
          name: "player"
          isMut: true
          isSigner: true
        },
        {
          name: "playerTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "vaultTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "mint"
          isMut: false
          isSigner: false
        },
        {
          name: "tokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "associatedTokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "systemProgram"
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: "stake"
      accounts: [
        {
          name: "player"
          isMut: true
          isSigner: true
        },
        {
          name: "playerStakeAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "playerStakeTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "playerTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "mint"
          isMut: false
          isSigner: false
        },
        {
          name: "tokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "associatedTokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "systemProgram"
          isMut: false
          isSigner: false
        }
      ]
      args: []
    },
    {
      name: "unstake"
      accounts: [
        {
          name: "player"
          isMut: true
          isSigner: true
        },
        {
          name: "playerStakeAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "playerStakeTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "playerTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "vaultTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "mint"
          isMut: false
          isSigner: false
        },
        {
          name: "tokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "associatedTokenProgram"
          isMut: false
          isSigner: false
        }
      ]
      args: []
    }
  ]
  accounts: [
    {
      name: "stakeState"
      type: {
        kind: "struct"
        fields: [
          {
            name: "isStaked"
            type: "bool"
          },
          {
            name: "timestamp"
            type: "i64"
          }
        ]
      }
    }
  ]
  errors: [
    {
      code: 6000
      name: "IsStaked"
      msg: "Tokens Already Staked"
    },
    {
      code: 6001
      name: "NotStaked"
      msg: "Tokens Not Staked Yet"
    }
  ]
}

export const IDL: Stake = {
  version: "0.1.0",
  name: "stake",
  instructions: [
    {
      name: "initializeVault",
      accounts: [
        {
          name: "signer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "vaultTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "airdrop",
      accounts: [
        {
          name: "player",
          isMut: true,
          isSigner: true,
        },
        {
          name: "playerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "stake",
      accounts: [
        {
          name: "player",
          isMut: true,
          isSigner: true,
        },
        {
          name: "playerStakeAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "playerStakeTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "playerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "unstake",
      accounts: [
        {
          name: "player",
          isMut: true,
          isSigner: true,
        },
        {
          name: "playerStakeAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "playerStakeTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "playerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "stakeState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "isStaked",
            type: "bool",
          },
          {
            name: "timestamp",
            type: "i64",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "IsStaked",
      msg: "Tokens Already Staked",
    },
    {
      code: 6001,
      name: "NotStaked",
      msg: "Tokens Not Staked Yet",
    },
  ],
}
