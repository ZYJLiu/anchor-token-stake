import * as anchor from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor"
import { Stake } from "../target/types/stake"
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token"
import { PublicKey } from "@solana/web3.js"

describe("stake", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env())

  const program = anchor.workspace.Stake as Program<Stake>
  const wallet = anchor.workspace.Stake.provider.wallet
  const connection = program.provider.connection

  // Mint used for staking rewards
  let rewardTokenMint: PublicKey

  // Player's associated token account for the mint
  let playerTokenAccount: PublicKey

  // PDA used for the player's stake account
  const [playerStakeAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("stake"), wallet.publicKey.toBuffer()],
    program.programId
  )

  // PDA used for the player's stake token account
  const [playerStakeTokenAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("token"), wallet.publicKey.toBuffer()],
    program.programId
  )

  // PDA used for the program's vault token account (source of staking rewards)
  const [vaultTokenAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId
  )

  before(async () => {
    // Create a mint to test
    rewardTokenMint = await createMint(
      connection,
      wallet.payer, // Payer
      wallet.publicKey, // Mint authority
      wallet.publicKey, // Freeze authority
      2 // Decimals
    )

    // Create a token account for the player
    playerTokenAccount = await createAssociatedTokenAccount(
      connection,
      wallet.payer, // Payer
      rewardTokenMint, // Mint
      wallet.publicKey // Owner
    )

    // Mint some tokens to the player to initally stake with
    await mintTo(
      connection,
      wallet.payer, // Payer
      rewardTokenMint, // Mint
      playerTokenAccount, // Destination
      wallet.payer, // Mint authority
      1 * 10 ** 2 // Amount, minting 1 token, accounting for decimals (2)
    )
  })

  it("Initialize Vault Token Account", async () => {
    const tx = await program.methods
      .initializeVault()
      .accounts({
        signer: wallet.publicKey,
        vaultTokenAccount: vaultTokenAccountPDA,
        mint: rewardTokenMint,
      })
      .rpc()
    console.log("Your transaction signature", tx)

    // mint 100 tokens to the vault for staking rewards
    await mintTo(
      connection,
      wallet.payer,
      rewardTokenMint,
      vaultTokenAccountPDA,
      wallet.payer,
      100 * 10 ** 2
    )

    // Check the vault token account balance
    const vaultTokenbalance = await connection.getTokenAccountBalance(
      vaultTokenAccountPDA
    )
    console.log("vaultTokenbalance", vaultTokenbalance.value.uiAmount)
  })

  it("Stake", async () => {
    const tx = await program.methods
      .stake()
      .accounts({
        player: wallet.publicKey,
        playerTokenAccount: playerTokenAccount,
        playerStakeTokenAccount: playerStakeTokenAccountPDA,
        playerStakeAccount: playerStakeAccountPDA,
        mint: rewardTokenMint,
      })
      .rpc()
    console.log("Your transaction signature", tx)

    const playerStakeAccount = await program.account.stakeState.fetch(
      playerStakeAccountPDA
    )

    console.log(
      "playerStakeAccount",
      JSON.stringify(playerStakeAccount, null, 2)
    )

    // Check player's token account balance
    const playerTokenbalance = await connection.getTokenAccountBalance(
      playerTokenAccount
    )

    // Check player's stake token account balance
    const playerStakeTokenbalance = await connection.getTokenAccountBalance(
      playerStakeTokenAccountPDA
    )

    console.log("playerTokenbalance", playerTokenbalance.value.uiAmount)
    console.log(
      "playerStakeTokenbalance",
      playerStakeTokenbalance.value.uiAmount
    )
  })

  it("Unstake", async () => {
    await delay(5000) // wait for 5 seconds

    const tx = await program.methods
      .unstake()
      .accounts({
        player: wallet.publicKey,
        playerTokenAccount: playerTokenAccount,
        playerStakeTokenAccount: playerStakeTokenAccountPDA,
        playerStakeAccount: playerStakeAccountPDA,
        vaultTokenAccount: vaultTokenAccountPDA,
        mint: rewardTokenMint,
      })
      .rpc()
    console.log("Your transaction signature", tx)

    const playerStakeAccount = await program.account.stakeState.fetch(
      playerStakeAccountPDA
    )

    console.log(
      "playerStakeAccount",
      JSON.stringify(playerStakeAccount, null, 2)
    )

    // Check vault token account balance
    const vaultTokenbalance = await connection.getTokenAccountBalance(
      vaultTokenAccountPDA
    )

    // Check player's token account balance
    const playerTokenbalance = await connection.getTokenAccountBalance(
      playerTokenAccount
    )

    // Check player's stake token account balance
    const playerStakeTokenbalance = await connection.getTokenAccountBalance(
      playerStakeTokenAccountPDA
    )

    console.log("vaultTokenbalance", vaultTokenbalance.value.uiAmount)
    console.log("playerTokenbalance", playerTokenbalance.value.uiAmount)
    console.log(
      "playerStakeTokenbalance",
      playerStakeTokenbalance.value.uiAmount
    )
  })
})

// Helper function to delay execution
const delay = (ms) => new Promise((res) => setTimeout(res, ms))
