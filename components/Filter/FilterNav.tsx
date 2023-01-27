import {
  Box,
  Button,
  HStack,
  Icon,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { HiChevronLeft } from '@react-icons/all-files/hi/HiChevronLeft'
import { HiOutlineAdjustments } from '@react-icons/all-files/hi/HiOutlineAdjustments'
import { FC } from 'react'

type Props = {
  showFilters: boolean
  toggleFilters: () => void
  count: number
  onClear: () => void
}

const FilterNav: FC<Props> = ({
  count,
  showFilters,
  toggleFilters,
  onClear,
}) => {
  const isSmall = useBreakpointValue({ base: true, md: false })
  return (
    <HStack spacing={4}>
      <Button onClick={toggleFilters} colorScheme="gray" variant="outline">
        {showFilters ? (
          <Icon as={HiChevronLeft} />
        ) : (
          <Icon as={HiOutlineAdjustments} />
        )}
        <Text ml="2">Filters</Text>
      </Button>
      {count > 0 && !isSmall && (
        <Button
          variant="ghost"
          colorScheme="gray"
          onClick={onClear}
          leftIcon={
            <Box
              rounded="full"
              bg="brand.500"
              color="white"
              width="5"
              height="5"
              fontSize="80%"
              lineHeight="5"
            >
              {count}
            </Box>
          }
        >
          Clear filters
        </Button>
      )}
    </HStack>
  )
}

export default FilterNav
