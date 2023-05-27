import { Box, Flex, Spacer, VStack } from "@chakra-ui/react"
import WalletMultiButton from "@/components/WalletMultiButton"
import Balance from "@/components/Balance"
import AirdropButton from "@/components/AirdropButton"
import StakeButton from "@/components/StakeButton"
import UnstakeButton from "@/components/UnstakeButton"

export default function Home() {
  return (
    <Box>
      <Flex px={4} py={4}>
        <Spacer />
        <WalletMultiButton />
      </Flex>

      <VStack>
        <Balance />
        <AirdropButton />
        <StakeButton />
        <UnstakeButton />
      </VStack>
    </Box>
  )
}
