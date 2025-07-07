'use client'

import { useState, useEffect } from 'react'
import './page.css' 

export default function UsersPage() {
  const [profiles, setProfiles] = useState([])
  const [filteredProfiles, setFilteredProfiles] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const res = await fetch('http://localhost:8000/api/registered_users/', {
          credentials: 'include',
        })
        const data = await res.json()
        setProfiles(data)
        setFilteredProfiles(data)
      } catch (err) {
        console.error('Failed to load users:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const query = searchQuery.toLowerCase()
    const filtered = profiles.filter((profile) =>
      profile.user.username.toLowerCase().includes(query) ||
      (profile.user.first_name && profile.user.first_name.toLowerCase().includes(query)) ||
      (profile.user.last_name && profile.user.last_name.toLowerCase().includes(query))
    )
    setFilteredProfiles(filtered)
  }

  if (loading) return <p className="text-center">Loading users...</p>

  return (
    <div className="users-container">
      <h1 className="page-title">Community Members</h1>
      <p className="page-subtitle">Browse and connect with other members of the community</p>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by name or username"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>

      <div className="user-cards">
        {filteredProfiles.length > 0 ? (
          filteredProfiles.map((profile) => (
            <div key={profile.user.id} className="user-card">
              <img
                src={profile.profile_image || '/images/default-profile.png'}
                alt={profile.user.username}
                className="user-avatar"
              />
              <h3>{profile.user.first_name} {profile.user.last_name}</h3>
              <p className="username">@{profile.user.username}</p>
              <p className="role">{profile.role || 'Member'}</p>
              <div className="social-links">
                {profile.facebook && <a href={profile.facebook} target="_blank">📘</a>}
                {profile.twitter && <a href={profile.twitter} target="_blank">🐦</a>}
                {profile.instagram && <a href={profile.instagram} target="_blank">📸</a>}
                {profile.linkedin && <a href={profile.linkedin} target="_blank">💼</a>}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No users found</p>
        )}
      </div>
    </div>
  )
}
