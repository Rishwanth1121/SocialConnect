export default function HelpSupport() {
  return (
    <div style={{ maxWidth: "750px", margin: "3rem auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
        Help & Support
      </h1>

      <p style={{ fontSize: "1.2rem", lineHeight: "1.9", marginBottom: "2rem" }}>
        We are here to help you make the most out of SocialConnect. Whether you need assistance with your account, reporting a bug, or understanding how a feature works, this page provides the help you need.
      </p>

      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginTop: "1.5rem" }}>
        📌 Common Questions
      </h2>
      <ul style={{ fontSize: "1.1rem", lineHeight: "1.8", paddingLeft: "1.5rem" }}>
        <li><strong>How do I reset my password?</strong><br />Go to Settings → Change Password and follow the instructions.</li>
        <li><strong>How can I delete my account?</strong><br />Navigate to Settings → Delete Account. Warning: This action is permanent.</li>
        <li><strong>How do I block someone?</strong><br />Use Settings → Block Users to prevent someone from interacting with you.</li>
        <li><strong>Can I edit a community I created?</strong><br />Yes! Go to the Communities page, click the three dots, and select Edit.</li>
        <li><strong>Where are voice messages available?</strong><br />In both group and private chat conversations.</li>
      </ul>

      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginTop: "2rem" }}>
        📬 Contact Support
      </h2>
      <p style={{ fontSize: "1.15rem", lineHeight: "1.8" }}>
        Need more help? Reach out to our team at <strong>support@socialconnect.com</strong> and we’ll get back to you within 24 hours.
      </p>

      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginTop: "2rem" }}>
        📚 Help Center
      </h2>
      <p style={{ fontSize: "1.15rem", lineHeight: "1.8" }}>
        For detailed guides and feature walkthroughs, visit our <a href="/help-center" style={{ color: "#6c63ff" }}>Help Center</a> (coming soon).
      </p>
    </div>
  );
}
