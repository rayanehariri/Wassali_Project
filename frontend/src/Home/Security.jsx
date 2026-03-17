export default function Sct(){
    return(
        <section className="security-new">
  <div style={{textAlign:"center",marginBottom:"50px"}}>
    <div className="security-shield-icon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    </div>
    <h2 style={{fontSize:"36px", marginBottom:"10px",color:"var(--text-primary)"}}>Trust, Security & Transparency</h2>
  </div>
  
  <div className="security-cards-grid">
    <div className="security-feature-card">
      <div className="feature-icon green-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <h3>ID Verification</h3>
      <p>All deliverers must submit and verify their ID cards before accepting orders.</p>
    </div>

    <div className="security-feature-card">
      <div className="feature-icon blue-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
      <h3>GPS Tracking</h3>
      <p>Real-time location tracking during active deliveries for complete transparency.</p>
    </div>

    <div className="security-feature-card">
      <div className="feature-icon purple-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      </div>
      <h3>Admin Supervision</h3>
      <p>Platform administrators monitor all activities to prevent fraud and ensure quality.</p>
    </div>

    <div className="security-feature-card">
      <div className="feature-icon green-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h3>Verified Badges</h3>
      <p>See at a glance which deliverers are verified and approved by Wassali.</p>
    </div>
  </div>
</section>
    )
}