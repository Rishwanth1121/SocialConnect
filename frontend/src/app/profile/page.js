'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import './page.css'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/profile/', {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to load profile')
        const data = await res.json()

        // Prepend backend URL to profile image if it exists
        if (data.profile_image) {
          data.profile_image = `http://localhost:8000${data.profile_image}`
        }

        setProfile(data)
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) return <p className="text-center">Loading profile...</p>
  if (!profile) return <p className="text-center">No profile found</p>

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img
          src={profile.profile_image || '/images/default-profile.png'}
          alt="Profile"
          className="profile-image"
        />
        <h2>{profile.user.username}</h2>
        <p>Email: {profile.user.email}</p>
        <div className="profile-info">
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Facebook:</strong> {profile.facebook || 'Not Provided'}</p>
          <p><strong>Twitter:</strong> {profile.twitter || 'Not Provided'}</p>
          <p><strong>Instagram:</strong> {profile.instagram || 'Not Provided'}</p>
          <p><strong>LinkedIn:</strong> {profile.linkedin || 'Not Provided'}</p>
        </div>
        <Link href="/profile/edit" className="edit-profile-btn">
          ✏️ Edit Profile
        </Link>
      </div>
    </div>
  )
}
