'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import './page.css'; // Your CSS module or global CSS
import { register } from '@/lib/api'; // assumes you have a register() function

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleRegister(e) {
    e.preventDefault();

    const res = await register(formData);

    if (res.message === 'User created') {
      setMessage('✅ Registration successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 1500);
    } else {
      setMessage(res.message || '❌ Registration failed.');
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Register | Workcohol</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="leftSection">
        <div className="formWrapper">
          <div className="logo">Workcohol</div>
          <h2>Create your account</h2>
          <p>Join the community</p>

          <form onSubmit={handleRegister}>
            <label>First Name</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />

            <label>Last Name</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />

            <label>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />

            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />

            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />

            <button type="submit">Register</button>

            {message && <p className="errorMessage">{message}</p>}
          </form>

          <div className="footerLink">
            Already have an account? <Link href="/login">Login</Link>
          </div>

          <div className="socialIcons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <Image src="/icons/instagram.png" alt="Instagram" width={24} height={24} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <Image src="/icons/facebook.png" alt="Facebook" width={24} height={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <Image src="/icons/twitter.png" alt="Twitter" width={24} height={24} />
            </a>
          </div>
        </div>
      </div>

      <div 
        className="rightSection"
        style={{ backgroundImage: "url('/images/login.jpg')" }}
      />
    </div>
  );
}
