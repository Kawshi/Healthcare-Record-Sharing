# Healthcare Record Sharing Web

A React + TypeScript + Tailwind frontend for the Healthcare Record Sharing HotPocket smart contract. It implements role-based flows (patient, doctor, laboratory, pharmacy, insurer, admin), encrypted document uploads, AI assistants, and real-time updates.

Quick start:
- cp .env.example .env and set VITE_MOCK_MODE=true for local UI dev
- npm i && npm run dev

Security notes:
- Keys never leave the browser. Document encryption is client-side (AES-256-GCM) and only ciphertext is uploaded.
- Do not log PHI or secrets. This project avoids logging sensitive payloads by design.

Authentication overview:
- Wallet-based sign-in via XRPL account with challenge/response.
- Supported wallets: GemWallet (injected) and Xaman (XUMM) via deep link/QR (backend-assisted).
- Backend endpoints:
  - POST /auth/challenge { account } -> { message, expiresAt }
  - POST /auth/verify { account, message, signature, wallet } -> { user, expiresAt } and sets httpOnly cookie if enabled
  - POST /auth/refresh -> 200 to extend cookie/session
  - POST /auth/logout -> invalidate session
  - Xaman helpers (if enabled on backend):
    - POST /auth/xumm/create-sign { account, message } -> { qrUrl, deepLinkUrl, payloadId, expiresAt }
    - POST /auth/xumm/status { payloadId } -> { status: 'pending'|'signed'|'rejected'|'expired', signature? }

Sign-in workflow:
1) User selects a wallet and XRPL account.
2) App calls /auth/challenge to get a one-time message.
3) Wallet signs the message:
   - GemWallet: window.gemWallet.signMessage(message).
   - Xaman: deep link/QR created by backend; app polls status until signed.
   - (Dev-only) Manual: paste signature.
4) App submits { account, message, signature } to /auth/verify.
5) On success: in-memory auth state updated; httpOnly cookie maintained by the backend; silent refresh runs 60s before expiry.
6) Sign out calls /auth/logout and clears client state.

Environment variables:
- VITE_BACKEND_BASE_URL=https://your-backend.example.com
- VITE_WALLET_ALLOW_MANUAL=true  # enable developer-only manual signing in non-prod modes
- VITE_MOCK_MODE=true
- VITE_CONTRACT_URLS=wss://127.0.0.1:8081
- VITE_AI_PROVIDER_URL=
- VITE_AI_PROVIDER_KEY=

Route protection:
- A top-level auth gate redirects unauthenticated users to /signin (MemoryRouter-compatible for iframe/sandbox usage).
- Header shows current user and role with a Sign out button when authenticated.

API client:
- Centralized fetch wrapper includes credentials, retries once on 401/419 after calling /auth/refresh, and clears auth on failure for a clean redirect to sign-in.
- Error messages are human-readable for common cases (expired tokens, signature failures).

Testing:
- Unit tests use Node's built-in test runner (node --test). See tests under src/tests/.
- Coverage includes auth reducer and HTTP client refresh behavior.

Notes:
- HotPocket client continues to load from CDN and communicates with the contract via BSON. Auth is orthogonal and managed with backend endpoints.
