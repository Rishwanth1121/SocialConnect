'use client'
import './page.css'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function FriendsPage() {
  const [friends, setFriends] = useState([])

  useEffect(() => {
    fetch('http://localhost:8000/api/user/friends/', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setFriends(data))
      .catch((err) => console.error(err))
  }, [])

  return (
    <div className="friends-page">
      <h1>My Friends</h1>
      {friends.length === 0 ? (
        <p>No friends yet.</p>
      ) : (
        <ul className="friends-list">
          {friends.map((friend) => (
            <li key={friend.id} className="friend-card">
              <img
                src={friend.profile_picture || '/images/default_profile.png'}
                alt="Profile"
                className="friend-avatar"
              />
              <div className="friend-details">
                <h3>
                  <Link href={`/chat/${friend.id}`} className="friend-username-link">
                    {friend.username}
                  </Link>
                </h3>
                <p>{friend.email}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
