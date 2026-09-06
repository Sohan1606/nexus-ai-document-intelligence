import { createContext, useContext } from 'react'

export interface CommandPaletteApi {
  open: boolean
  setOpen: (open: boolean) => void
}

export const CommandPaletteContext = createContext<CommandPaletteApi>({
  open: false,
  setOpen: () => {},
})

export function useCommandPalette() {
  return useContext(CommandPaletteContext)
}
