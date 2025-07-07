'use client';
import Head from 'next/head';
import Link from 'next/link';
import './globals.css';
import Navbar from '@/base/navbar';
import AuthGuard from "@/base/AuthGuard";

// ⛔ Don't export this directly
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

      <section className="hero">
        <div className="heroContent">
          <h1>Connect, Share, and Grow Together</h1>
          <p>
            Join a vibrant community where ideas flourish and connections matter. Engage in meaningful
            discussions, create inspiring content, and build relationships that last.
          </p>
          <div className="heroButtons">
            <Link href="/communities/create_community" className="btn">Get Started</Link>
            <Link href="#features" className="btn btnOutline">Learn More</Link>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="sectionTitle">
          <h2>Why Our Community Stands Out</h2>
          <p>Discover features designed to enhance your social experience and foster genuine connections</p>
        </div>
        <div className="featuresGrid">
          <div className="featureCard">
            <div className="featureIcon">
              <i className="fas fa-edit"></i>
            </div>
            <h3>Create Posts</h3>
            <p>
              Share your thoughts, ideas, and updates with a community that cares. Rich formatting and media
              support included.
            </p>
          </div>
          <div className="featureCard">
            <div className="featureIcon">
              <i className="fas fa-comments"></i>
            </div>
            <h3>Live Group Chat</h3>
            <p>
              Real-time conversations with multiple users. Perfect for discussions, events, and spontaneous
              chats.
            </p>
          </div>
          <div className="featureCard">
            <div className="featureIcon">
              <i className="fas fa-users"></i>
            </div>
            <h3>Member Directory</h3>
            <p>
              Discover and connect with like-minded individuals. Filter by interests, skills, and location.
            </p>
          </div>
          <div className="featureCard">
            <div className="featureIcon">
              <i className="fas fa-images"></i>
            </div>
            <h3>Multimedia Support</h3>
            <p>Share images, videos, and documents. Visual storytelling made simple and beautiful.</p>
          </div>
        </div>
      </section>

      <section className="dashboard">
        <div className="dashboardContainer">
          <div className="feed">
            <h2>Community Activity</h2>
            {posts.length > 0 ? (
              posts.map((post) => (
                <div className="post" key={post.id}>
                  <div className="postHeader">
                    <div className="postUser">
                      {post.user.username.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h4>@{post.user.username}</h4>
                      <div className="postTime">{post.created_at} ago</div>
                    </div>
                  </div>
                  <div className="postContent">
                    <p>{post.content}</p>
                  </div>
                  {post.image && (
                    <img src={post.image.url} alt="Post image" className="postImage" />
                  )}
                </div>
              ))
            ) : (
              <div className="emptyFeed">
                <p>No posts yet. Be the first to share something!</p>
                <Link href="/posts" className="btn">Create Post</Link>
              </div>
            )}
          </div>

          <div className="sidebar">
            <div className="card">
              <h3>Discover More</h3>
              <form method="get" action="/search" className="searchBox">
                <input type="text" name="q" placeholder="Search users, posts, groups..." />
              </form>
            </div>

            <div className="card">
              <h3>Trending Topics</h3>
              <ul className="trendingList">
                <li><Link href="#">Technology</Link></li>
                <li><Link href="#">StartupLife</Link></li>
                <li><Link href="#">Photography</Link></li>
                <li><Link href="#">RemoteWork</Link></li>
                <li><Link href="#">Sustainability</Link></li>
              </ul>
            </div>

            <div className="card">
              <h3>Community Stats</h3>
              <div className="statsGrid">
                <div className="statItem">
                  <div className="statNumber">1.2K</div>
                  <div className="statLabel">Members</div>
                </div>
                <div className="statItem">
                  <div className="statNumber">543</div>
                  <div className="statLabel">Posts</div>
                </div>
                <div className="statItem">
                  <div className="statNumber">87</div>
                  <div className="statLabel">Groups</div>
                </div>
                <div className="statItem">
                  <div className="statNumber">24</div>
                  <div className="statLabel">Events</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
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
