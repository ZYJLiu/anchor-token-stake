import { useState } from "react"
import { Button } from "@chakra-ui/react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useProgram } from "@/contexts/ProgramContext"
import { useAccounts } from "@/contexts/AccountsContext"

const AirdropButton = () => {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { program } = useProgram()
  const { playerTokenAccount, rewardTokenMint, vaultTokenAccountPDA } =
    useAccounts()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)

    try {
      const tx = await program!.methods
        .airdrop()
        .accounts({
          player: publicKey!,
          playerTokenAccount: playerTokenAccount!,
          vaultTokenAccount: vaultTokenAccountPDA!,
          mint: rewardTokenMint!,
        })
        .transaction()

      const txSig = await sendTransaction(tx, connection)
      console.log(`https://explorer.solana.com/tx/${txSig}?cluster=devnet`)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button w="100px" onClick={handleClick} isLoading={isLoading}>
      Airdrop
    </Button>
  )
}

export default AirdropButton
