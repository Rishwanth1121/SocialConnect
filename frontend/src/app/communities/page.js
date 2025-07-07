'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import './page.css'

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const isCreator = (community) => {
    // Adjust the condition as per your auth logic
    return community?.created_by?.id === 1
  }

  return (
    <div className="container">
      <h2 className="text-center">Your Communities</h2>

      <div className="text-right mb-4">
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
            <h3>
              <Link href={`/communities/${community.id}/chat`}>
                {community.name}
              </Link>
            </h3>
            <p>{community.description}</p>
            <p>
              <strong>Members:</strong>{' '}
              {community.members_info?.length > 0
                ? community.members_info.map((m) => m.username).join(', ')
                : 'No members'}
            </p>
            {isCreator(community) && (
              <Link href={`/communities/${community.id}/add-members`}>
                ➕ Add Members
              </Link>
            )}
          </div>
        ))
      ) : (
        <p className="text-center">You are not part of any communities yet.</p>
      )}
    </div>
  )
}
