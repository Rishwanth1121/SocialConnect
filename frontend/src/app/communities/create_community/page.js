'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCSRFToken } from '@/utils/csrf';
import './page.css';

export default function CreateCommunityPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purpose: '',
    profile_photo: null,
    members: []
  });

  const [fileName, setFileName] = useState('No file selected');
  const [messages, setMessages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/users/', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setAllUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profile_photo: file,
      }));
      setFileName(file.name);
    }
  };

  const handleMemberSelect = (e) => {
    const options = e.target.options;
    const selectedMembers = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selectedMembers.push(options[i].value);
    }
    setFormData((prev) => ({
      ...prev,
      members: selectedMembers,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('purpose', formData.purpose);
      if (formData.profile_photo) {
        formDataToSend.append('profile_photo', formData.profile_photo);
      }
      formData.members.forEach((member) => {
        formDataToSend.append('members', member);
      });

      const csrfToken = await getCSRFToken();

      const response = await fetch('http://localhost:8000/api/communities/create/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error('Failed to create community');
      }

      setMessages([{ text: 'Community created successfully!', type: 'success' }]);
      setTimeout(() => {
        router.push('/communities');
      }, 2000);
    } catch (error) {
      console.error(error);
      setMessages([{ text: 'Error creating community.', type: 'error' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1 className="formTitle">Create Your Community</h1>

      {messages.map((msg, idx) => (
        <div key={idx} className={`alert ${msg.type === 'success' ? 'alertSuccess' : 'alertError'}`}>
          {msg.text}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <div className="formGroup">
          <label className="formLabel">Community Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="formControl"
          />
        </div>

        <div className="formGroup">
          <label className="formLabel">Description</label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            className="formControl"
          />
        </div>

        <div className="formGroup">
          <label className="formLabel">Purpose</label>
          <textarea
            name="purpose"
            required
            value={formData.purpose}
            onChange={handleChange}
            className="formControl"
          />
        </div>

        <div className="formGroup">
          <label className="formLabel">Community Image</label>
          <input
            type="file"
            name="profile_photo"
            onChange={handleFileChange}
            accept="image/*"
            className="formControl"
          />
          <div className="fileName">{fileName}</div>
        </div>

        <div className="formGroup">
          <label className="formLabel">Add Members</label>
          <select
            name="members"
            multiple
            onChange={handleMemberSelect}
            className="membersSelect"
          >
            {allUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="submitBtn" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Community'}
        </button>
      </form>
    </div>
  );
}
