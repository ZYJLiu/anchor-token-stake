import { createContext, useContext, useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useProgram } from "@/contexts/ProgramContext"
import { PublicKey } from "@solana/web3.js"
import { getAssociatedTokenAddressSync } from "@solana/spl-token"

// Define the structure of the Accounts context state
// Theses are addresses that will be used to interact with the program
type AccountsContextType = {
  rewardTokenMint: PublicKey | null
  vaultTokenAccountPDA: PublicKey | null
  playerTokenAccount: PublicKey | null
  playerStakeAccountPDA: PublicKey | null
  playerStakeTokenAccountPDA: PublicKey | null
}

// Create the context with default values
const AccountsContext = createContext<AccountsContextType>({
  rewardTokenMint: null,
  vaultTokenAccountPDA: null,
  playerTokenAccount: null,
  playerStakeAccountPDA: null,
  playerStakeTokenAccountPDA: null,
})

// Custom hook to use the Accounts context
export const useAccounts = () => useContext(AccountsContext)

// Provider component to wrap around components that need access to the context
export const AccountsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { publicKey } = useWallet()
  const { program } = useProgram()

  // Mint address for the token we are using to stake/unstake with and as staking reward
  const rewardTokenMint = new PublicKey(
    "Gw1dRVus1Logbm3zNuJ8c5ae9AjWLK2So73kNUpqcucg"
  )

  // State variable to hold the account addresses
  const [accounts, setAccounts] = useState<AccountsContextType>({
    rewardTokenMint,
    vaultTokenAccountPDA: null,
    playerTokenAccount: null,
    playerStakeAccountPDA: null,
    playerStakeTokenAccountPDA: null,
  })

  // Fetch the account addresses
  useEffect(() => {
    const setup = async () => {
      if (!publicKey || !program) return

      // Get player associated token account address
      const playerTokenAccount = getAssociatedTokenAddressSync(
        rewardTokenMint,
        publicKey
      )

      // Get player's stake token account address
      // Tokens transferred to this address will be "staked"
      const [playerStakeTokenAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("token"), publicKey.toBuffer()],
        program.programId
      )

      // Get vault token account address
      const [vaultTokenAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault")],
        program.programId
      )

      // Get player stake account address
      const [playerStakeAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("stake"), publicKey.toBuffer()],
        program.programId
      )

      setAccounts({
        rewardTokenMint,
        vaultTokenAccountPDA,
        playerTokenAccount,
        playerStakeAccountPDA,
        playerStakeTokenAccountPDA,
      })
    }

    setup()
  }, [publicKey, program])

  return (
    <AccountsContext.Provider value={accounts}>
      {children}
    </AccountsContext.Provider>
  )
}
