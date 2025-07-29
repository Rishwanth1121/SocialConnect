'use client';
import './globals.css';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '@/base/navbar';
import AuthGuard from "@/base/AuthGuard";

function HomePageContent({ posts = [] }) {
  return (
    <>
  <Head>
    <title>Connect, Share, and Grow Together</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
    />
  </Head>

  {/* HERO */}
  <section className="hero">
    <div className="heroContent">
      <h1>Connect, Share, and Grow Together</h1>
      <p>
        Join a vibrant community where ideas flourish and connections matter.
        Engage in meaningful discussions, create inspiring content, and build relationships that last.
      </p>
      <div className="heroButtons">
        <Link href="/communities/create_community" className="btn">Get Started</Link>
        <Link href="#features" className="btn btnOutline">Learn More</Link>
      </div>
    </div>
  </section>

  {/* FEATURES */}
  <section className="features" id="features">
    <div className="sectionTitle">
      <h2>Why Our Community Stands Out</h2>
      <p>Discover features designed to enhance your social experience and foster genuine connections</p>
    </div>
    <div className="featuresGrid">
      <div className="featureCard">
        <div className="featureIcon"><i className="fas fa-edit"></i></div>
        <h3>Create Posts</h3>
        <p>Share your thoughts and updates with rich formatting and media support.</p>
      </div>
      <div className="featureCard">
        <div className="featureIcon"><i className="fas fa-comments"></i></div>
        <h3>Live Group Chat</h3>
        <p>Engage in real-time discussions with your community members.</p>
      </div>
      <div className="featureCard">
        <div className="featureIcon"><i className="fas fa-users"></i></div>
        <h3>Member Directory</h3>
        <p>Find like-minded individuals by interests, skills, and location.</p>
      </div>
      <div className="featureCard">
        <div className="featureIcon"><i className="fas fa-images"></i></div>
        <h3>Multimedia Support</h3>
        <p>Upload images, videos, and documents to express yourself fully.</p>
      </div>
    </div>
  </section>

<section className="dashboard">
  <div className="dashboardContainer">
    <div className="sidebar">
      {/* Discover More */}
      <div className="card">
        <h3>Discover More</h3>
        <form method="get" action="/search" className="searchBox">
          <input type="text" name="q" placeholder="Search users, posts, groups..." />
        </form>
      </div>

      {/* Trending Topics */}
      <div className="card">
        <h3>Trending Topics</h3>
        <ul className="trendingList">
          <li><Link href="#">TechTalk</Link></li>
          <li><Link href="#">CreatorsHub</Link></li>
          <li><Link href="#">RemoteLife</Link></li>
          <li><Link href="#">BuildTogether</Link></li>
          <li><Link href="#">MindfulGrowth</Link></li>
        </ul>
      </div>

      {/* Community Image Banner */}
      <div className="card adCard">
  <div style={{ textAlign: 'center' }}>
    <img src="/images/comm.png" alt="Join the community" style={{ maxWidth: '100%', borderRadius: '8px' }} />
    <h4 style={{ marginTop: '1rem', fontSize: '1.1rem' }}>Grow Together</h4>
    <p style={{ fontSize: '0.95rem', color: '#555' }}>
      Discover inspiring groups, join vibrant discussions, and grow your network.
    </p>
    <Link href="/communities" className="btn" style={{ marginTop: '0.5rem' }}>
      Join Now
    </Link>
  </div>
</div>


    </div>
  </div>
</section>


  {/* NEW SECTIONS */}
  <section className="vision">
    <div className="container">
      <h2>Empowering Meaningful Connections</h2>
      <p>
        Our platform is more than just a space, it is a movement to connect people with purpose.
        We believe in nurturing knowledge, sharing, collaboration, and social growth in a unified digital environment.
      </p>
    </div>
  </section>

  <section className="useCases">
    <div className="container">
      <h2>Who Is This For?</h2>
      <div className="useCasesGrid">
        <div className="useCase">
          <h3>Creators & Influencers</h3>
          <p>Build a thriving community around your personal brand.</p>
        </div>
        <div className="useCase">
          <h3>Startups & SaaS</h3>
          <p>Engage your users, gather feedback, and offer support.</p>
        </div>
        <div className="useCase">
          <h3>Educators & Coaches</h3>
          <p>Run cohorts, mentorship, and online classrooms with group discussions.</p>
        </div>
        <div className="useCase">
          <h3>Internal Teams</h3>
          <p>Foster better internal communication and team engagement.</p>
        </div>
      </div>
    </div>
  </section>

  <section className="highlightFeatures">
  <div className="container">
    <h2>Platform Highlights</h2>
    <ul>
      <li>🧠 Group-based spaces with role-based access and community visibility</li>
      <li>💬 Real-time group and private messaging </li>
      <li>👥 Friend system with requests, acceptance, and friend list management</li>
      <li>📸 Multimedia posts with images, likes, and comments</li>
      <li>🔒 Privacy controls: profile/post visibility, block users, private mode</li>
      <li>🔔 Real-time notifications for requests, posts, and community updates</li>
    </ul>
  </div>
</section>


  <section className="testimonials">
    <div className="container">
      <h2>What Our Community Users Say</h2>
      <div className="testimonialCard">
        <p>“This platform has transformed how I interact with my audience. It’s clean, powerful, and truly community-focused.”</p>
        <span>- Rishwanth, Creator</span>
      </div>
      <div className="testimonialCard">
        <p>“Our startup grew engagement by 3x since moving our community here. Highly recommend!”</p>
        <span>- Gowtham, SaaS Founder</span>
      </div>
    </div>
  </section>

  <section className="integrations">
    <div className="container">
      <h2>Integrates With Your Workflow</h2>
      <p>Connect with tools you already enjoy using.</p>
      <img src="/images/integrations.png" alt="Integrations" style={{ maxWidth: '30%', marginTop: '1rem' }} />
    </div>
  </section>

  <section className="ctaFinal">
    <div className="container">
      <h2>Ready to Build Your Community?</h2>
      <p>Start for free, no credit card required.</p>
      <Link href="/communities/create_community" className="btn">Get Started Now</Link>
    </div>
  </section>

  <footer className="footer">
  <div className="container">
    <p>© 2025 SocialConnect. Built with ❤️</p>
    <div className="footerLinks">
      <Link href="/settings/about">About</Link>
      <Link href="/settings/help-support">Help & Support</Link>
      <Link href="/settings">Settings</Link>
    </div>
  </div>
</footer>
</>

  );
}

// ✅ Only this is exported
export default function HomePageWrapper(props) {
  return (
    <AuthGuard>
      <HomePageContent {...props} />
    </AuthGuard>
  );
}
