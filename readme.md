# Secure Authentication System

A production-grade, full-stack client-server authentication ecosystem engineered with robust cryptographic security, asynchronous background email transport, and automated self-cleaning database states.

---

##   Core System Architecture & Workflows

### 1. Sign-Up Workflow (Registration & Verification)

#### 🔹 Frontend Validation
* The user inputs their `fullName`, `userName`, `password`, and `email`.
* The frontend JavaScript evaluates inputs locally. If any field is empty, form submission is halted, and the empty elements are visually flagged with a red border (`border-red-600`) to prevent unnecessary network overhead.

#### 🔹 Backend Validation & Pre-Processing
* **Email Formatting:** The server evaluates raw string inputs against an explicit Regular Expression (Regex) pattern to validate the structural integrity of the email address. Invalid formats trigger an immediate error response.
* **Collision Check:** The server queries MongoDB to verify if the requested `userName` already exists. If a match is discovered, it intercepts the workflow and returns a `409 Conflict` status code.

#### 🔹 Account Creation & Temporary Storage (TTL)
* **Password Hashing:** Once validations clear, plain-text passwords are encrypted via `bcrypt` using a secure, one-way cryptographic hashing algorithm before touching the database.
* **Ephemeral Database Record:** A new document is written to MongoDB using the Account Schema with the default flags initialized to `isVerified: false`.
* **Self-Cleaning Mechanism:** To optimize database storage and preserve username availability, a MongoDB Time-To-Live (TTL) index automatically monitors the record. If the account remains unverified after 15 minutes (900 seconds), MongoDB drops the document, automatically liberating the reserved username.

#### 🔹 Email Dispatch & Account Activation
* **Token Generation:** The server generates a short-lived `tempToken` signed via JSON Web Tokens (JWT).
* **Nodemailer Transmission:** A verification URL embedding the token as a query parameter (e.g., `/verify?token=...`) is dynamically compiled and dispatched to the user's inbox using `nodemailer`.
* **Activation Endpoint:** Clicking the email link issues a secure `GET` request to the server's `/verify` route. 
  * If the token is missing or malformed, the server rejects the request.
  * If valid, the token is verified using `jwt.verify()`. Upon successful extraction of the account's unique MongoDB `_id`, the server updates the document state to `isVerified: true`. The account is now permanent, and the user is prompted to sign in.

---

### 2. Sign-In & Session Management Workflow

#### 🔹 Frontend Transmission
* The user inputs their `userName` and `password`. Any missing fields are caught and stopped early by frontend verification logic.
* Validated payloads are securely delivered via a `POST` request to the `/signIn` endpoint.

#### 🔹 Backend Credential Verification
* **Identity Check:** The server fetches the account by its `userName`. If the profile does not exist, an error response is promptly returned.
* **Gatekeeping Unverified Users:** The server checks the `isVerified` boolean flag. If `false`, the login sequence is aborted, returning a `403 Forbidden` error to block unverified entry.
* **Cryptographic Comparison:** Because passwords are securely hashed, the server utilizes `bcrypt.compare()` to pass the plain-text input along with the salted database hash through the verification algorithm. If the calculation matches, authentication succeeds.

#### 🔹 Token Issuance & Session Persistence
* **JWT Delivery:** Upon authentication success, the server constructs a permanent session JWT containing the user's secure database identifier and delivers it to the client.
* **Client Storage:** The frontend extracts this token and stores it securely within the browser's `localStorage` context. The application then triggers a client-side redirection to the `/dashboard` route.

#### 🔹 Dashboard Resource Protection (Middleware)
* **The Route Guard:** When navigating to the dashboard, the server serves the static, unprotected `signed-in.html` layout shell. Once loaded in the browser, the dashboard's frontend JavaScript reads the token from `localStorage` and appends it to the `Authorization` header of an asynchronous `GET` request to the data API endpoint (e.g., `/api/user-data`).
* **The `verifyToken` Middleware:** This custom middleware acts as an active bouncer, intercepting all inbound requests directed to secure data endpoints:
  * **Missing Token:** If the header is missing, malformed, or empty, the middleware stops the lifecycle pipeline and forces an immediate client-side redirection back to the login screen.
  * **Token Verification:** The token is analyzed using `jwt.verify()`. If it is expired or structurally invalid, access is revoked. If valid, the user's MongoDB ID is unpacked, attached directly to the request object (`req.user`), and passed down the line to the final route handler to dynamically load personalized account metrics.

> **Key Benefit:** This tokenized system ensures a seamless user experience. Once signed in, users can navigate directly back to the dashboard without typing their credentials repeatedly, as long as their JSON Web Token remains active and valid.

# authentication_project
