import { create } from 'zustand'
import type { Pipeline, Notification, UserProfile } from '@/types'
import { pipelines as mockPipelines } from '@/data/pipelines'
import { notifications as mockNotifications } from '@/data/notifications'
import { userProfile as mockProfile } from '@/data/notifications'

interface AppState {
  currentTeam: string
  favoritePipelines: string[]
  notifications: Notification[]
  unreadCount: number
  userProfile: UserProfile
  pipelines: Pipeline[]
  
  setCurrentTeam: (teamId: string) => void
  toggleFavorite: (pipelineId: string) => void
  isFavorite: (pipelineId: string) => boolean
  markNotificationRead: (id: string) => void
  markAllRead: () => void
  toggleNotificationSetting: (key: keyof UserProfile['notificationSettings']) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  currentTeam: 'all',
  favoritePipelines: mockPipelines.filter(p => p.isFavorite).map(p => p.id),
  notifications: mockNotifications,
  unreadCount: mockNotifications.filter(n => !n.isRead).length,
  userProfile: mockProfile,
  pipelines: mockPipelines,

  setCurrentTeam: (teamId: string) => {
    console.log('[Store] setCurrentTeam:', teamId)
    set({ currentTeam: teamId })
  },

  toggleFavorite: (pipelineId: string) => {
    const { favoritePipelines } = get()
    const isFav = favoritePipelines.includes(pipelineId)
    const newFavorites = isFav
      ? favoritePipelines.filter(id => id !== pipelineId)
      : [...favoritePipelines, pipelineId]
    
    console.log('[Store] toggleFavorite:', pipelineId, '->', !isFav)
    set({ favoritePipelines: newFavorites })
  },

  isFavorite: (pipelineId: string) => {
    return get().favoritePipelines.includes(pipelineId)
  },

  markNotificationRead: (id: string) => {
    const { notifications } = get()
    const updated = notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    )
    set({
      notifications: updated,
      unreadCount: updated.filter(n => !n.isRead).length
    })
  },

  markAllRead: () => {
    const { notifications } = get()
    const updated = notifications.map(n => ({ ...n, isRead: true }))
    set({
      notifications: updated,
      unreadCount: 0
    })
  },

  toggleNotificationSetting: (key: keyof UserProfile['notificationSettings']) => {
    const { userProfile } = get()
    set({
      userProfile: {
        ...userProfile,
        notificationSettings: {
          ...userProfile.notificationSettings,
          [key]: !userProfile.notificationSettings[key]
        }
      }
    })
  }
}))
