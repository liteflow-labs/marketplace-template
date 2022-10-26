import { extendTheme } from '@chakra-ui/react'
import { baseTheme } from '@nft/components'

// Chakra foundations
// https://github.com/chakra-ui/chakra-ui/tree/main/packages/theme/src/foundations

export const COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    300: '#93C5FD',
    500: '#3B82F6',
    600: '#2563EB',
  },
  brand: {
    50: '#F5F7FF',
    100: '#D3E2FF',
    200: '#A7C4FF',
    300: '#7BA3FF',
    400: '#5A88FF',
    500: '#245BFF',
    600: '#1A45DB',
    700: '#1233B7',
    800: '#0B2393',
    900: '#06177A',
    black: '#060F27',
  },
  gray: {
    100: '#F3F4F6',
    200: '#E5E7Eb',
    300: '#D1D5Db',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
  },
  green: {
    50: '#ECFDF5',
    300: '#6EE7B7',
    500: '#10B981',
  },
  orange: {
    50: '#FFF7ED',
    300: '#FDBA74',
    500: '#F97316',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    300: '#FCA5A5',
    500: '#EF4444',
    900: '#7F1D1D',
  },
}

const radii = {
  none: '0',
  sm: '12px',
  base: '12px',
  md: '12px',
  lg: '12px',
  xl: '12px',
  '2xl': '12px',
  '3xl': '12px',
  full: '9999px',
}

export const theme = extendTheme({
  ...baseTheme,
  colors: COLORS,
  radii,
})
