import VerifyCredential from "../components/VerifyCredential";

function VerifyManual() {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div className="app-card">
        <h1 style={{ fontSize: "1.6rem", marginBottom: 6 }}>Verify a Credential</h1>
        <p style={{ color: "var(--clr-text-muted)", marginBottom: 24 }}>
          Have a student ID and a credential document? Paste the details below to instantly
          confirm whether the credential is genuine — no account or login needed.
        </p>
        <VerifyCredential />
      </div>

      <div className="banner banner-info" style={{ marginTop: 16 }}>
        <span>💡</span>
        <span>
          You can also verify credentials by scanning the QR code on the student's certificate
          or by opening the shareable link they provided.
        </span>
      </div>
    </div>
  );
}

export default VerifyManual;
