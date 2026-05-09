import { useState } from "react";

/**
 * AddressPill — shows a truncated 0x address with:
 *  - hover tooltip showing the full address
 *  - one-click copy button
 *
 * Props:
 *   address  (string) — the full 0x hex address
 *   label    (string) — optional label shown before the address (e.g. "Wallet:")
 *   short    (bool)   — if true shows 6+4 chars (default), else 10+6
 */
function AddressPill({ address = "", label = "", short = true }) {
  const [copied, setCopied] = useState(false);

  if (!address) return null;

  const displayAddr = short
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : `${address.slice(0, 10)}…${address.slice(-6)}`;

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {label && (
        <span style={{ fontSize: 13, color: "var(--clr-text-muted)", fontWeight: 500 }}>
          {label}
        </span>
      )}
      <span className="address-pill" data-full={address} title={address}>
        {displayAddr}
        <button
          className="copy-btn"
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy full address"}
          aria-label="Copy address"
        >
          {copied ? "✓" : "⎘"}
        </button>
      </span>
    </span>
  );
}

export default AddressPill;
