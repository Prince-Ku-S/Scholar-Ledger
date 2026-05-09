# 🎓 Scholar Ledger

> **Tamper-proof academic credentials on the blockchain.**
> Universities issue certificates. Students share them instantly. Employers verify them in seconds — no phone calls, no paperwork, no fraud.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Data Flow Diagrams](#data-flow-diagrams)
  - [Issuing a Credential](#1-issuing-a-credential)
  - [Verifying a Credential](#2-verifying-a-credential-public)
  - [Student Profile & QR Share](#3-student-profile--qr-share)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Smart Contract](#smart-contract)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Key User Flows](#key-user-flows)
- [Security Model](#security-model)

---

## Overview

Scholar Ledger is a **decentralized credential management system** with three core actors:

| Actor | Role |
|-------|------|
| **University Admin** | Deploys contract, issues & revokes credentials |
| **Student** | Connects wallet, views credentials, shares public profile |
| **Verifier** | Anyone (employer, institution) — verifies credentials with zero login |

The system combines three technologies to achieve tamper-proof credentials:
- **Ethereum Smart Contract** — the single source of truth for credential existence & revocation status
- **IPFS via Pinata** — decentralized storage for the actual credential documents (PDFs)
- **MongoDB** — fast lookup registry mapping human-readable Student IDs ↔ wallet addresses

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         SCHOLAR LEDGER SYSTEM                            │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │                     React Frontend (port 3000)                   │     │
│  │                                                                  │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │     │
│  │  │  Home /       │  │  /verify     │  │  /profile/:id        │   │     │
│  │  │  Dashboard    │  │  Manual      │  │  Public Profile      │   │     │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────────────┘   │     │
│  │         │                 │                                       │     │
│  │  ┌──────▼───────────────────────────────────────────────────┐   │     │
│  │  │               WalletContext (MetaMask / ethers.js)        │   │     │
│  │  └──────┬──────────────────────────────────────────────────-┘   │     │
│  └─────────┼────────────────────────────────────────────────────────┘     │
│            │                                                               │
│    ┌───────▼──────────────────────────────────────────────┐               │
│    │                   Three Data Layers                   │               │
│    │                                                       │               │
│    │  ┌─────────────────┐  ┌────────────┐  ┌──────────┐  │               │
│    │  │  Ethereum Node   │  │  Express   │  │  Pinata  │  │               │
│    │  │  (Ganache/RPC)   │  │  API :4000 │  │  (IPFS)  │  │               │
│    │  │                  │  │            │  │          │  │               │
│    │  │  ScholarLedger   │  │  MongoDB   │  │  Files   │  │               │
│    │  │  .sol contract   │  │  Students  │  │  stored  │  │               │
│    │  │                  │  │  registry  │  │  as CIDs │  │               │
│    │  └─────────────────┘  └────────────┘  └──────────┘  │               │
│    └──────────────────────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Issuing a Credential

_Admin uploads a document and issues it permanently to a student._

```
Admin (Browser)                 Frontend              Pinata IPFS        Express API         Blockchain
      │                            │                      │                   │                  │
      │  Fill form:                │                      │                   │                  │
      │  • Student ID              │                      │                   │                  │
      │  • Title                   │                      │                   │                  │
      │  • PDF file                │                      │                   │                  │
      │──── Click "Issue" ────────►│                      │                   │                  │
      │                            │                      │                   │                  │
      │                            │── POST /api/students ─────────────────►│                  │
      │                            │   {studentId, walletAddress}            │                  │
      │                            │◄── walletAddress ──────────────────────│                  │
      │                            │                      │                  │                  │
      │                            │── Upload file ──────►│                  │                  │
      │                            │◄── IPFS CID ─────────│                  │                  │
      │                            │   (e.g. Qm...)        │                  │                  │
      │                            │                      │                  │                  │
      │                            │  keccak256(CID) = cidHash               │                  │
      │                            │                      │                  │                  │
      │                            │── MetaMask popup ────────────────────────────────────────►│
      │◄── Approve tx ─────────────│  issueCredential(    │                  │                  │
      │                            │    walletAddress,    │                  │                  │
      │                            │    cidHash,          │                  │                  │
      │                            │    cid,              │                  │                  │
      │                            │    title             │                  │                  │
      │                            │  )                   │                  │                  │
      │                            │◄── tx confirmed ────────────────────────────────────────-│
      │◄── "✅ Credential issued!" │                      │                  │                  │
```

---

### 2. Verifying a Credential (Public)

_Anyone — no login needed — verifies a credential by scanning a QR or opening a link._

**Path A: QR Code / Direct Link** (`/verify/:address/:index`)

```
Verifier (Browser)              Frontend              Blockchain (read-only RPC)
      │                            │                          │
      │  Opens link or scans QR    │                          │
      │──── GET /verify/0x.../2 ──►│                          │
      │                            │── getCredential(         │
      │                            │     address, index)  ───►│
      │                            │◄── {title, issuedOn,     │
      │                            │     revoked, cid, ...}   │
      │                            │                          │
      │                            │  ┌──────────────────┐    │
      │                            │  │ revoked == false? │    │
      │                            │  └──────┬───────────┘    │
      │                            │      YES│       NO        │
      │                            │   ✅ VALID    ❌ REVOKED  │
      │◄── Result shown ───────────│                          │
```

**Path B: Manual Verification** (`/verify`)

```
Verifier (Browser)              Frontend            Express API         Blockchain (read-only)
      │                            │                    │                      │
      │  Enter:                    │                    │                      │
      │  • Student ID              │                    │                      │
      │  • Document ID (CID)       │                    │                      │
      │──── Click "Verify" ───────►│                    │                      │
      │                            │── GET /api/students/by-student-id/:id ──►│
      │                            │◄── {walletAddress}─│                      │
      │                            │                    │                      │
      │                            │  keccak256(CID) = cidHash                │
      │                            │                                           │
      │                            │── verifyCredential(walletAddress, cidHash)►│
      │                            │◄── true / false ──────────────────────────│
      │◄── ✅ Valid / ❌ Invalid ──│                    │                      │
```

---

### 3. Student Profile & QR Share

_Student shares a public profile link; anyone can view all credentials._

```
Student (Browser)               Frontend            Express API         Blockchain (read-only)
      │                            │                    │                      │
      │  Connect MetaMask wallet   │                    │                      │
      │──────────────────────────►│                    │                      │
      │                            │── GET /api/students/by-wallet/:addr ─────►│
      │                            │◄── {studentId}─────│                      │
      │                            │                    │                      │
      │  "View my public profile"  │                    │                      │
      │──────────────────────────►│                    │                      │
      │      Redirected to         │                    │                      │
      │  /profile/student/:id  ───►│                    │                      │
      │                            │── getCredentialCount(walletAddr) ────────►│
      │                            │── getCredential(walletAddr, i) [×N] ─────►│
      │                            │◄── credentials list ──────────────────────│
      │◄── Profile page ───────────│                    │                      │
      │    with QR code            │                    │                      │
      │    + copy link button      │                    │                      │
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | SPA with routing, wallet integration |
| **Styling** | Vanilla CSS + CSS Variables | Red/orange/white design system, Inter font |
| **Wallet** | MetaMask + ethers.js v6 | Transaction signing, account management |
| **Smart Contract** | Solidity 0.8.20 | Credential issuance, revocation, verification |
| **Contract Deployment** | Truffle + Ganache | Local development blockchain (port 7545) |
| **Decentralized Storage** | IPFS via Pinata | PDF storage, returns content-addressable CID |
| **Backend API** | Express.js (Node) | Student ID ↔ wallet address registry |
| **Database** | MongoDB + Mongoose | Persistent student registry |
| **QR Codes** | qrcode.react | Per-credential QR codes for sharing |
| **PDF Generation** | (pdfGenerator util) | Downloadable credential certificates |

---

## Project Structure

```
scholar-ledger/
│
├── 📁 blockchain/                  # Smart contract layer
│   ├── contracts/
│   │   └── ScholarLedger.sol       # Main Solidity contract
│   ├── migrations/                 # Truffle deployment scripts
│   ├── test/                       # Contract unit tests
│   └── truffle-config.js           # Network config (Ganache: 7545)
│
├── 📁 server/                      # Node.js REST API
│   ├── index.js                    # Express app, MongoDB connection (port 4000)
│   ├── models/
│   │   └── Student.js              # Mongoose schema: studentId ↔ walletAddress
│   └── routes/
│       └── students.js             # GET/POST /api/students/*
│
├── 📁 ipfs/
│   └── uploadToIPFS.js             # Standalone Pinata upload script
│
├── 📁 client/                      # React frontend
│   └── src/
│       ├── App.js                  # Router, WalletProvider shell
│       ├── App.css                 # Full design system (tokens, components)
│       ├── index.css               # CSS variables, Inter font, base resets
│       │
│       ├── context/
│       │   └── WalletContext.jsx   # MetaMask state, admin detection
│       │
│       ├── components/
│       │   ├── Navbar.jsx          # Top navigation bar
│       │   ├── ConnectWallet.jsx   # Wallet connection card + error handling
│       │   ├── AddressPill.jsx     # Reusable truncated address + copy button
│       │   ├── StudentDashboard.jsx# Credential list for connected wallet
│       │   ├── CredentialCard.jsx  # Single credential with QR + PDF + revoke
│       │   ├── UploadCredential.jsx# Admin-only credential issuance form
│       │   └── VerifyCredential.jsx# Manual verify form component
│       │
│       ├── pages/
│       │   ├── Home.jsx            # Landing hero + dashboard
│       │   ├── PublicProfile.jsx   # /profile/:address or /profile/student/:id
│       │   ├── PublicVerify.jsx    # /verify/:address/:index (QR landing)
│       │   ├── VerifyManual.jsx    # /verify (manual form)
│       │   └── QrScanner.jsx       # /scan (camera QR scanner)
│       │
│       └── utils/
│           ├── contract.js         # ethers.js contract instance (MetaMask signer)
│           ├── readOnlyContract.js # ethers.js contract (JsonRpcProvider, no wallet)
│           ├── ipfs.js             # Pinata upload from browser
│           ├── studentRegistryApi.js# Axios calls to Express API
│           └── pdfGenerator.js     # PDF certificate generation
│
├── .env.example                    # Server env template
├── package.json                    # Root package (workspaces / scripts)
└── README.md                       # This file
```

---

## Smart Contract

**`ScholarLedger.sol`** — deployed on Ethereum (or local Ganache)

### Data Structures

```solidity
struct Credential {
    bytes32 cidHash;   // keccak256(IPFS CID) — cryptographic fingerprint
    string  cid;       // Raw IPFS CID — for document retrieval
    string  title;     // e.g. "BTech Semester 6 Transcript"
    uint256 issuedOn;  // block.timestamp at issuance
    bool    revoked;   // true = revoked by admin
    address issuer;    // admin wallet that issued this
}

mapping(address => Credential[]) private studentCredentials;
mapping(address => mapping(bytes32 => bool)) private cidHashIssued; // prevents duplicates
```

### Functions

| Function | Access | Description |
|----------|--------|-------------|
| `issueCredential(student, cidHash, cid, title)` | Admin only | Issues a new credential to a student |
| `revokeCredential(student, index)` | Admin only | Marks credential as revoked (irreversible) |
| `getCredential(student, index)` | Public | Returns full credential data |
| `getCredentialCount(student)` | Public | Number of credentials for a student |
| `verifyCredential(student, cidHash)` | Public | Returns `true` if credential is valid & not revoked |
| `transferAdmin(newAdmin)` | Admin only | Transfers admin role to new address |

### Events

```solidity
event CredentialIssued(address indexed student, uint256 indexed index, bytes32 cidHash, string title);
event CredentialRevoked(address indexed student, uint256 indexed index);
event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);
```

---

## API Reference

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/students` | List all active students |
| `POST` | `/students` | Register or update a student (upsert) |
| `GET` | `/students/by-student-id/:studentId` | Look up student by ID (e.g. `CSE2026-001`) |
| `GET` | `/students/by-wallet/:walletAddress` | Look up student by wallet address |

### POST `/students` — Request Body

```json
{
  "studentId":      "CSE2026-001",
  "walletAddress":  "0xAbCd...1234",
  "fullName":       "Priyanshu Kumar",
  "department":     "Computer Science",
  "graduationYear": 2026
}
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local or Atlas)
- [Ganache](https://trufflesuite.com/ganache/) for local blockchain
- [MetaMask](https://metamask.io/) browser extension
- Truffle CLI: `npm install -g truffle`

---

### 1. Clone & Install

```bash
git clone https://github.com/Priyanshukumaranand/Scholar-Ledger.git
cd Scholar-Ledger

# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

---

### 2. Deploy the Smart Contract

```bash
# Start Ganache on port 7545 (network ID 5777)
# Then:

cd blockchain
truffle migrate --network ganache
```

Copy the deployed contract address from the migration output.

---

### 3. Configure Environment

**Root `.env`** (server):
```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/scholar_ledger
```

**`client/.env`**:
```env
REACT_APP_CONTRACT_ADDRESS=<paste contract address here>
REACT_APP_RPC_URL=http://127.0.0.1:7545
REACT_APP_PINATA_API_KEY=<your pinata key>
REACT_APP_PINATA_SECRET_KEY=<your pinata secret>
REACT_APP_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
REACT_APP_API_BASE_URL=http://localhost:4000/api
```

---

### 4. Run All Services

Open **three terminals**:

```bash
# Terminal 1 — Backend API
node server/index.js

# Terminal 2 — React Frontend
cd client
npm start

# Terminal 3 — (Ganache should already be running)
```

Open `http://localhost:3000` in your browser.

---

### 5. Configure MetaMask

1. Add a custom network in MetaMask:
   - **Network Name:** Ganache Local
   - **RPC URL:** `http://127.0.0.1:7545`
   - **Chain ID:** `5777`
2. Import the first Ganache account (this becomes the **Admin**)
3. Import a second account to act as a **Student**

---

## Environment Variables

### Server (`/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Express server port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/scholar_ledger` | MongoDB connection string |

### Client (`/client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_CONTRACT_ADDRESS` | ✅ | Deployed ScholarLedger contract address |
| `REACT_APP_RPC_URL` | ✅ | Ethereum RPC (Ganache or Infura) |
| `REACT_APP_PINATA_API_KEY` | ✅ | Pinata API key for IPFS uploads |
| `REACT_APP_PINATA_SECRET_KEY` | ✅ | Pinata secret key |
| `REACT_APP_IPFS_GATEWAY` | ✅ | IPFS gateway URL for document retrieval |
| `REACT_APP_API_BASE_URL` | ✅ | Express API base URL |

---

## Key User Flows

### 🔴 Admin: Issue a Credential
1. Connect MetaMask (wallet auto-detected as admin)
2. Navigate to **Home** → scroll to **Issue a New Credential**
3. Enter Student ID, optional wallet address (first time only), title, and upload PDF
4. Click **Issue Credential** → approve MetaMask transaction
5. Credential is stored on IPFS + recorded on-chain

### 🟠 Student: View & Share Credentials
1. Connect MetaMask (student wallet)
2. View all issued credentials in **My Credentials**
3. Each credential shows: title, date, issuer, status, QR code
4. Click **Download PDF** to get the verifiable certificate
5. Click **View your public profile →** to get a shareable link

### ⚪ Verifier: Verify a Credential (No Login)
**Option A — QR Code or link:** Scan the QR on the PDF or open the link
- Lands on `/verify/:address/:index`
- Blockchain is queried directly — shows ✅ VALID or ❌ REVOKED

**Option B — Manual:** Go to `/verify`
- Enter Student ID and Document ID from the certificate
- Result shown instantly

---

## Security Model

| Concern | How Scholar Ledger handles it |
|---------|-------------------------------|
| **Fake credentials** | Impossible — issuance requires the admin private key to sign the blockchain transaction |
| **Tampered documents** | Document is hashed with `keccak256(CID)` on-chain; any modification changes the hash |
| **Duplicate issuance** | Contract tracks `cidHashIssued[student][cidHash]` — reverts on duplicate |
| **Revocation** | Admin can revoke any credential; `revoked=true` is permanent on-chain |
| **Public verification** | Uses read-only `JsonRpcProvider` — verifiers never need a wallet |
| **Student ID spoofing** | MongoDB registry is write-protected; only admin can map new IDs |

---

## Branch

Active development branch: **`priyanshu`**

```bash
git checkout priyanshu
git pull origin priyanshu
```

---

<p align="center">Built with ❤️ by <a href="https://github.com/Priyanshukumaranand">Priyanshukumaranand</a></p>
