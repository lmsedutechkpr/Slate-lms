'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SellerNotificationsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    loadNotifications()

    // Real-time: new notifications
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const channel = supabase.channel(`seller-notifs-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload: any) => {
          setNotifications(prev => [payload.new as any, ...prev])
          toast.info(payload.new.title)
        })
        .subscribe()
      return () => supabase.removeChannel(channel)
    })
  }, [])

  async function loadNotifications() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, title, title_ta, message, message_ta, link, is_read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  async function markRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  async function markAllRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    await supabase.from('notifications').update({ is_read: true })
      .eq('user_id', user.id).eq('is_read', false)
    toast.success('All notifications marked as read')
  }

  async function deleteNotification(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id))
    await supabase.from('notifications').delete().eq('id', id)
  }

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'read') return n.is_read
    return true
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  const notifIcon = (notif: any) => {
    const title = notif.title?.toLowerCase() || ''
    if (title.includes('order')) return { icon: '🛍️', color: 'bg-emerald-50' }
    if (title.includes('approved') || title.includes('approval')) return { icon: '✅', color: 'bg-green-50' }
    if (title.includes('rejected')) return { icon: '❌', color: 'bg-red-50' }
    if (title.includes('review')) return { icon: '⭐', color: 'bg-amber-50' }
    if (title.includes('payment') || title.includes('payout')) return { icon: '💰', color: 'bg-blue-50' }
    return { icon: '🔔', color: 'bg-gray-50' }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated on your store's activity</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
            ✓ Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5">
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'read', label: 'Read', count: notifications.length - unreadCount },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
              ${filter === tab.key ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-3xl">🔔</div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            {filter === 'unread' ? 'All caught up!' : 'No notifications'}
          </h3>
          <p className="text-sm text-gray-400">
            {filter === 'unread' ? 'No unread notifications.' : 'Notifications about orders, reviews, and approvals will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(notif => {
            const { icon, color } = notifIcon(notif)
            return (
              <div key={notif.id}
                onClick={() => { if (!notif.is_read) markRead(notif.id); if (notif.link) router.push(notif.link) }}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all group
                  ${!notif.is_read ? 'bg-emerald-50/40 border-emerald-100 hover:border-emerald-200' : 'bg-white border-gray-100 hover:border-gray-200'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${color}`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${!notif.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-gray-400 whitespace-nowrap">
                        {new Date(notif.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                      </span>
                      {!notif.is_read && (
                        <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                      )}
                    </div>
                  </div>
                  {notif.message && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                  )}
                </div>
                <button onClick={e => { e.stopPropagation(); deleteNotification(notif.id) }}
                  className="p-1 text-gray-300 hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
