'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface AgentAvatarProps {
  avatar: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: { outer: 'w-8 h-8', text: 'text-sm' },
  md: { outer: 'w-10 h-10', text: 'text-base' },
  lg: { outer: 'w-14 h-14', text: 'text-2xl' },
  xl: { outer: 'w-20 h-20', text: 'text-3xl' },
}

export function AgentAvatar({ avatar, name, size = 'lg', className }: AgentAvatarProps) {
  const [imgError, setImgError] = useState(false)
  const { outer, text } = sizeMap[size]

  const isUrl = avatar?.startsWith('http') || avatar?.startsWith('//')

  if (isUrl && !imgError) {
    return (
      <div className={cn('rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0', outer, className)}>
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  // emoji 或 fallback 首字
  const display = (!isUrl && avatar) ? avatar : name?.[0] ?? '?'
  return (
    <div className={cn(
      'rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold',
      outer, text, className
    )}>
      {display}
    </div>
  )
}
