import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor"
import { Stake, IDL } from "../idl/stake"
import { PublicKey } from "@solana/web3.js"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"

// Define the structure of the Program context state
type ProgramContextType = {
  program: Program<Stake> | null
}

// Create the context with default values
const ProgramContext = createContext<ProgramContextType>({
  program: null,
})

// Custom hook to use the Program context
export const useProgram = () => useContext(ProgramContext)

// Provider component to wrap around components that need access to the context
export const ProgramProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const wallet = useAnchorWallet()
  const { connection } = useConnection()

  // State variable to hold the program values
  const [program, setProgram] = useState<Program<Stake> | null>(null)

  const setup = useCallback(async () => {
    const programId = new PublicKey(
      "Ez8TA8T2rEyGjuEy6D6iY7Z7g51mPm4Zz5CRLndfbSjL"
    )
    /// @ts-ignore
    const provider = new AnchorProvider(connection, wallet, {})
    setProvider(provider)
    const program = new Program<Stake>(IDL, programId, provider)

    setProgram(program)
  }, [connection, wallet])

  // Effect to fetch program when the component mounts
  useEffect(() => {
    setup()
  }, [setup])

  return (
    <ProgramContext.Provider value={{ program }}>
      {children}
    </ProgramContext.Provider>
  )
}
