import { useState, useMemo, useCallback } from 'react'
import { parseColorInput } from '../utils/colorParsing'

/**
 * Hook to manage color input state and parsing
 * @param {string} initialValue - Initial color value
 * @param {'hex'|'rgb'} initialType - Initial input type
 * @returns {{
 *   colorInput: string,
 *   inputType: 'hex'|'rgb',
 *   error: string,
 *   colorValue: object | null,
 *   setColorInput: (value: string) => void,
 *   handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   handleTypeChange: (type: 'hex'|'rgb') => void
 * }}
 */
export function useColorInput(initialValue = '#3498db', initialType = 'hex') {
  const [colorInput, setColorInput] = useState(initialValue)
  const [inputType, setInputType] = useState(initialType)
  const [error, setError] = useState('')

  // Memoize parsed color value
  const colorValue = useMemo(
    () => parseColorInput(colorInput, inputType),
    [colorInput, inputType]
  )

  const handleInputChange = useCallback((e) => {
    setColorInput(e.target.value)
    setError('')
  }, [])

  const handleTypeChange = useCallback((type) => {
    setInputType(type)
    // Reset input when switching types
    if (type === 'hex') {
      setColorInput('#3498db')
    } else {
      setColorInput('52, 152, 219')
    }
    setError('')
  }, [])

  return {
    colorInput,
    inputType,
    error,
    colorValue,
    setColorInput,
    handleInputChange,
    handleTypeChange,
  }
}
