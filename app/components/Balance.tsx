import { useEffect, useState } from "react"
import { Text } from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { useProgram } from "@/contexts/ProgramContext"
import { useAccounts } from "@/contexts/AccountsContext"
import { AccountInfo } from "@solana/web3.js"

const Balance = () => {
  const { publicKey } = useWallet()
  const { connection } = useConnection()

  // Program from context
  const { program } = useProgram()
  // Account addresses from context
  const { vaultTokenAccountPDA, playerTokenAccount, playerStakeAccountPDA } =
    useAccounts()

  // Vault current token balance
  const [vaultBalance, setVaultBalance] = useState(0)
  // Player current token balance
  const [playerBalance, setPlayerBalance] = useState(0)
  // Accrued staking reward
  const [reward, setReward] = useState(0)
  // Player stake account state
  const [stakeState, setStakeState] = useState<any>()

  // Fetch token balances and stake state
  const fetchState = async () => {
    try {
      if (
        !playerTokenAccount ||
        !vaultTokenAccountPDA ||
        !playerStakeAccountPDA
      )
        return

      const vaultTokenbalance = await connection.getTokenAccountBalance(
        vaultTokenAccountPDA
      )

      const playerTokenBalance = await connection.getTokenAccountBalance(
        playerTokenAccount
      )

      const playerStakeAccount = await program!.account.stakeState.fetch(
        playerStakeAccountPDA
      )

      setVaultBalance(vaultTokenbalance.value.uiAmount!)
      setPlayerBalance(playerTokenBalance.value.uiAmount!)
      setStakeState(playerStakeAccount)
    } catch (error) {
      console.log(error)
      setPlayerBalance(0)
    }
  }

  useEffect(() => {
    fetchState()
  }, [playerTokenAccount, vaultTokenAccountPDA, playerStakeAccountPDA])

  // Calculate accrued staking reward, called every second and matches slot time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (stakeState?.isStaked) {
      interval = setInterval(async () => {
        const start = stakeState.timestamp
        const slot = await connection.getSlot()
        const timestamp = await connection.getBlockTime(slot)
        if (timestamp && start) {
          const timePassed = timestamp - start
          setReward(timePassed)
        }
      }, 1000)
    } else {
      fetchState()
      setReward(0)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [stakeState])

  // Handle player's stake account change event
  const handleAccountChange = (accountInfo: AccountInfo<Buffer>) => {
    try {
      // deserialize the game state account data
      const data = program?.coder.accounts.decode(
        "stakeState",
        accountInfo.data
      )
      setStakeState(data)
    } catch (error) {
      console.error("Error decoding account data:", error)
    }
  }

  // Subscribe to player's stake account onAccountChange
  useEffect(() => {
    if (!playerStakeAccountPDA) return

    const subscriptionId = connection.onAccountChange(
      playerStakeAccountPDA,
      handleAccountChange
    )

    return () => {
      // Unsubscribe from the account change subscription when the component unmounts
      connection.removeAccountChangeListener(subscriptionId)
    }
  }, [playerStakeAccountPDA])

  return (
    <>
      {publicKey && (
        <>
          <Text>Vault Balance: {vaultBalance}</Text>
          <Text>Player Balance: {playerBalance}</Text>
          <Text>Reward: {reward}</Text>
        </>
      )}
    </>
  )
}

export default Balance
