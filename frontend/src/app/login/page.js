'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import './page.css';
import { login, getUser, getCsrfToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    try {
      await getCsrfToken();
      const res = await login(username, password);

      if (res.message === 'Logged in') {
        await getUser(); // fetch user if needed
        router.push('/'); // go to home after login
      } else {
        setMessage(res.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Login error');
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Login | Get2gether</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="leftSection">
        <div className="formWrapper">
          <div className="logo">GET 2 GETHER</div>
          <h2>Welcome</h2>
          <p>Please enter your details:</p>

          {message && (
            <div className="errorMessage">
              {message}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <div className="formActions">
              <label><input type="checkbox" /> Remember for 30 days</label>
              <Link href="#">Forgot password?</Link>
            </div>

            <button type="submit">Sign in</button>

            <button className="googleBtn" type="button">
              <Image 
                src="/icons/google.png" 
                alt="Google Icon" 
                width={18} 
                height={18} 
              /> 
              Sign in with Google
            </button>
          </form>

          <div className="footerLink">
            Don't have an account?
            <button onClick={() => router.push('/register')}>Sign up</button>
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
        style={{ backgroundImage: "url('/images/login_illustration.png')" }}
      />
    </div>
  );
}
