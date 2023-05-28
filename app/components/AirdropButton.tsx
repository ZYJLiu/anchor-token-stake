import { useState } from "react"
import { Button } from "@chakra-ui/react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useProgram } from "@/contexts/ProgramContext"
import { useAccounts } from "@/contexts/AccountsContext"

const AirdropButton = () => {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [isLoading, setIsLoading] = useState(false)

  // Program from context
  const { program } = useProgram()
  // Account addresses from context
  const { playerTokenAccount, rewardTokenMint, vaultTokenAccountPDA } =
    useAccounts()

  // Airdrop player token, used for testing to initially fund new wallet with token to stake
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
    <Button
      w="100px"
      onClick={handleClick}
      isLoading={isLoading}
      isDisabled={!publicKey}
    >
      Airdrop
    </Button>
  )
}

export default AirdropButton
