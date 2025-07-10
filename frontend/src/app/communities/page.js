'use client'
import './page.css'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([])
  const [userId, setUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/current_user/', {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          setUserId(data.id)
        }
      } catch (err) {
        console.error('Failed to fetch user', err)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/communities/user/', {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to fetch communities')
        const data = await res.json()
        setCommunities(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommunities()
  }, [])

  const toggleDropdown = (communityId) => {
    setDropdownOpen(dropdownOpen === communityId ? null : communityId)
  }

  const getCSRFToken = () => {
    const match = document.cookie.match(/csrftoken=([\w-]+)/)
    return match ? match[1] : ''
  }

  const handleDelete = async (communityId) => {
    try {
      const csrfToken = getCSRFToken()
      const res = await fetch(`http://localhost:8000/api/communities/${communityId}/delete/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfToken,
        },
      })

      if (res.ok) {
        setCommunities(prev => prev.filter(c => c.id !== communityId))
      } else {
        throw new Error('Delete failed')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete community.')
    }
  }

  const isCreator = (community) => {
    return community?.created_by?.id === userId
  }

  return (
    <div className="container">
      <div className="header-row">
        <h2>Your Communities</h2>
        <Link href="/communities/create_community" className="create-btn">
          ➕ Create a Community
        </Link>
      </div>

      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center alertError">Error: {error}</p>
      ) : communities.length > 0 ? (
        communities.map((community) => (
          <div key={community.id} className="community-card">
            {isCreator(community) && (
              <div className="dropdown-wrapper">
                <button
                  className="dots-button"
                  onClick={() => toggleDropdown(community.id)}
                >
                  ⋮
                </button>
                {dropdownOpen === community.id && (
                  <div className="community-dropdown-menu">
                    <Link href={`/communities/${community.id}/edit_members`}>Edit Members</Link>
                    <Link href={`/communities/${community.id}/edit`}>Edit Profile</Link>
                    <button onClick={() => handleDelete(community.id)}>Delete Community</button>
                  </div>
                )}
              </div>
            )}
            <div className="community-header">
              <img
  src={
    community.profile_photo
      ? community.profile_photo  // use full URL as-is
      : '/images/default-profile.jpg'
  }
  alt="Community"
  className="community-image"
  onError={(e) => { e.target.src = '/images/default-profile.jpg' }}
/>

              <h3>
                <Link href={`/communities/${community.id}/chat`}>
                  {community.name}
                </Link>
              </h3>
            </div>
            <p>{community.description}</p>
            <p>
              <strong>Members:</strong>{' '}
              {community.members_info?.length > 0
                ? community.members_info.map((m) => m.username).join(', ')
                : 'No members'}
            </p>
          </div>
        ))
      ) : (
        <p className="text-center">You are not part of any communities yet.</p>
      )}
    </div>
  )
}
