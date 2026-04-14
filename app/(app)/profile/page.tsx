'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Clock } from 'lucide-react'

interface Profile {
  id: string
  email: string
  username: string
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setProfile(data)
        }
      }
      setLoading(false)
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown'

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Profile</h2>
        <p className="mt-2 text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary p-4 text-white">
              <User className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="text-lg font-semibold text-foreground">
                {profile?.username || 'Not set'}
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-start gap-4">
              <Mail className="h-5 w-5 text-primary/50" />
              <div>
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="text-foreground">{profile?.email || 'Loading...'}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-start gap-4">
              <Clock className="h-5 w-5 text-primary/50" />
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-foreground">{joinDate}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground">More Features Coming Soon</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Avatar customization, profile editing, and more account settings will be available soon.
        </p>
        <Button className="mt-4" disabled>
          Edit Profile (Coming Soon)
        </Button>
      </Card>
    </div>
  )
}
