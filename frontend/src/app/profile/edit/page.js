'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import './page.css'

export default function EditProfilePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    role: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    profile_image: null,
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Helper to get csrftoken from cookie
  const getCookie = (name) => {
    let cookieValue = null
    if (typeof document !== 'undefined' && document.cookie) {
      const cookies = document.cookie.split(';')
      for (let cookie of cookies) {
        cookie = cookie.trim()
        if (cookie.startsWith(name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
          break
        }
      }
    }
    return cookieValue
  }

  useEffect(() => {
    async function fetchProfile() {
      // Fetch CSRF token cookie from the backend first
      await fetch('http://localhost:8000/api/csrf/', {
        credentials: 'include',
      })

      const res = await fetch('http://localhost:8000/api/profile/', {
        credentials: 'include',
      })
      if (!res.ok) return
      const data = await res.json()
      setFormData({
        role: data.role || '',
        facebook: data.facebook || '',
        twitter: data.twitter || '',
        instagram: data.instagram || '',
        linkedin: data.linkedin || '',
        profile_image: null,
      })
      setPreviewImage(data.profile_image)
    }

    fetchProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, profile_image: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value)
    })
    console.log([...data.entries()])

    try {
      const csrfToken = getCookie('csrftoken')

      const res = await fetch('http://localhost:8000/api/profile/', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        body: data,
      })

      const responseText = await res.text()

      if (!res.ok) {
        console.error('Failed to update profile:', res.status, responseText)
      } else {
        router.push('/profile')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Role
          <input type="text" name="role" value={formData.role} onChange={handleChange} />
        </label>

        <label>
          Facebook
          <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} />
        </label>

        <label>
          Twitter
          <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} />
        </label>

        <label>
          Instagram
          <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} />
        </label>

        <label>
          LinkedIn
          <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} />
        </label>

        <label>
          Profile Photo
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>

        {previewImage && <img src={previewImage} className="preview" alt="Preview" />}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
