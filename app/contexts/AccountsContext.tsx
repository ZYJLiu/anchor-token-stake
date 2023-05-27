import { createContext, useContext, useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useProgram } from "@/contexts/ProgramContext"
import { PublicKey } from "@solana/web3.js"
import { getAssociatedTokenAddressSync } from "@solana/spl-token"

type AccountsContextType = {
  rewardTokenMint: PublicKey | null
  vaultTokenAccountPDA: PublicKey | null
  playerTokenAccount: PublicKey | null
  playerStakeAccountPDA: PublicKey | null
  playerStakeTokenAccountPDA: PublicKey | null
}

const AccountsContext = createContext<AccountsContextType>({
  rewardTokenMint: null,
  vaultTokenAccountPDA: null,
  playerTokenAccount: null,
  playerStakeAccountPDA: null,
  playerStakeTokenAccountPDA: null,
})

export const useAccounts = () => useContext(AccountsContext)

export const AccountsProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { publicKey } = useWallet()
  const { program } = useProgram()

  const rewardTokenMint = new PublicKey(
    "Gw1dRVus1Logbm3zNuJ8c5ae9AjWLK2So73kNUpqcucg"
  )

  const [accounts, setAccounts] = useState<AccountsContextType>({
    rewardTokenMint,
    vaultTokenAccountPDA: null,
    playerTokenAccount: null,
    playerStakeAccountPDA: null,
    playerStakeTokenAccountPDA: null,
  })

  useEffect(() => {
    const setup = async () => {
      if (!publicKey || !program) return

      const playerTokenAccount = getAssociatedTokenAddressSync(
        rewardTokenMint,
        publicKey
      )

      const [playerStakeTokenAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("token"), publicKey.toBuffer()],
        program.programId
      )

      const [vaultTokenAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault")],
        program.programId
      )

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
