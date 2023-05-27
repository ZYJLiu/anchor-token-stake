import { useState } from "react"
import { Button } from "@chakra-ui/react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useProgram } from "@/contexts/ProgramContext"
import { useAccounts } from "@/contexts/AccountsContext"

const StakeButton = () => {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { program } = useProgram()
  const {
    playerTokenAccount,
    rewardTokenMint,
    playerStakeAccountPDA,
    playerStakeTokenAccountPDA,
  } = useAccounts()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)

    try {
      const tx = await program!.methods
        .stake()
        .accounts({
          player: publicKey!,
          playerTokenAccount: playerTokenAccount!,
          playerStakeTokenAccount: playerStakeTokenAccountPDA!,
          playerStakeAccount: playerStakeAccountPDA!,
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
      Stake
    </Button>
  )
}

export default StakeButton
