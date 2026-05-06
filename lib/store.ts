import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from './i18n'

interface ThemeState {
  isDark: boolean
  toggle: () => void
  setDark: (dark: boolean) => void
}

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () => set((state) => ({ isDark: !state.isDark })),
      setDark: (dark) => set({ isDark: dark })
    }),
    {
      name: 'theme-storage'
    }
  )
)

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'zh',
      setLocale: (locale) => set({ locale }),
      toggle: () => set((state) => ({ locale: state.locale === 'zh' ? 'en' : 'zh' }))
    }),
    {
      name: 'locale-storage'
    }
  )
)
