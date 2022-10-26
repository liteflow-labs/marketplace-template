import { Box } from '@chakra-ui/react'
import { FC } from 'react'

const LargeLayout: FC = (props) => (
  <Box
    as="main"
    mx="auto"
    maxW="7xl"
    py={{ base: 8, lg: 12 }}
    px={{ base: 6, lg: 8 }}
    pb={10}
    {...props}
  />
)
export default LargeLayout
