# OAuth and GitHub repository setup

MaruCheck supports email/password, GitHub, and Google authentication through Better Auth. A linked
GitHub account also powers the repository picker at `/projects/connect`; provider access tokens are
used only on the server and are encrypted before Better Auth stores them in Postgres.

## 1. Prepare the local environment

Create `.env.local` from `.env.example` and set the required database and authentication values:

```dotenv
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...
BETTER_AUTH_SECRET=replace-with-a-generated-secret
BETTER_AUTH_URL=http://localhost:3000
```

Generate `BETTER_AUTH_SECRET` with `npx auth secret`. Keep `.env.local` out of Git and use different
OAuth credentials and secrets for local, preview, and production environments.

No new database table is required for OAuth. The existing Better Auth `account` table contains the
provider account and token fields; MaruCheck enables Better Auth's token encryption before new or
refreshed provider tokens are written.

## 2. Create the GitHub OAuth application

1. Open GitHub **Settings → Developer settings → OAuth Apps** and choose **New OAuth App**.
2. Use a clear environment-specific name such as `MaruCheck Local`.
3. Set the homepage URL to `http://localhost:3000`.
4. Set the authorization callback URL exactly to
   `http://localhost:3000/api/auth/callback/github`.
5. Copy the client ID, generate a client secret, and add both to `.env.local`:

```dotenv
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

For production, create a separate OAuth app and use the exact callback
`https://your-domain.example/api/auth/callback/github`. Set `BETTER_AUTH_URL` to that same HTTPS
origin without a trailing slash. Avoid wildcard callback matching.

Better Auth requests `read:user` and `user:email` for sign-in. Those scopes let MaruCheck discover
public repositories associated with the user. The **Include private repositories** control asks for
GitHub's `repo` scope only when the user chooses it. GitHub OAuth does not offer read-only private
repository scope: `repo` is broad, so the consent is deliberately separate from sign-in.

## 3. Create the Google OAuth client

1. Open the Google Cloud Console and create or select a project.
2. In **Google Auth Platform**, configure Branding and Audience. Use **Testing** while developing and
   add the accounts that should test the flow.
3. Open **Clients**, create an OAuth client, and choose **Web application**.
4. Add these authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.example/api/auth/callback/google`
5. Copy the client ID and secret into `.env.local`:

```dotenv
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

MaruCheck requests only Google's basic identity scopes. Before a public production launch, publish
the consent configuration and complete any branding verification Google requires.

## 4. Start and verify locally

Restart Next.js after changing environment variables:

```bash
npm run db:migrate
npm run dev
```

Then verify each path:

1. Open `http://localhost:3000/sign-in`.
2. Sign up with GitHub and confirm the first login continues to `/onboarding` so a workspace can be
   created.
3. Sign out, sign up or sign in with Google, and confirm the same onboarding/dashboard behavior.
4. Open `/projects/connect`. A GitHub-authenticated user should see public repositories immediately.
5. From an email/password or Google session, choose **Connect GitHub**. Better Auth links the GitHub
   identity only when the provider's verified email matches the existing MaruCheck account email.
6. Select a repository and connect it. MaruCheck must use GitHub's repository name and default
   branch and then show the one-time project ingestion token.
7. If needed, choose **Include private repositories**, approve the `repo` scope, and confirm the
   private repositories appear after returning to MaruCheck.

The production signup policy also applies to first-time social users. Set
`MARUCHECK_OPEN_SIGNUPS=true` for open registration or put approved addresses in
`MARUCHECK_ALLOWED_SIGNUP_EMAILS`. Returning users can still sign in while new registration is
locked.

## 5. Configure Vercel

Add the production values to the Vercel project, including the production `BETTER_AUTH_URL`, both
provider credential pairs, and the existing database/auth values. Redeploy after changing them.
Run `npm run deploy:env:check` before promotion; it rejects a half-configured GitHub or Google
credential pair.

Preview deployments need their own stable OAuth callback origin if they are expected to exercise
OAuth. Random per-commit preview URLs do not fit exact provider callback allowlists well; use a
stable preview domain and separate credentials.

## Troubleshooting

- **`redirect_uri_mismatch`**: `BETTER_AUTH_URL` and the provider callback entry do not produce the
  exact same origin and path. Check protocol, host, port, trailing slash, and provider name.
- **GitHub `email_not_found`**: the GitHub app/user token needs `user:email`; Better Auth requests it
  by default. A GitHub App, rather than an OAuth App, also needs read-only Email Addresses account
  permission.
- **GitHub linking rejected**: the verified GitHub email differs from the current MaruCheck email,
  or that GitHub identity is already linked to another MaruCheck user. MaruCheck intentionally does
  not enable different-email linking because it weakens account-takeover protection.
- **Private repository missing**: approve **Include private repositories**, then check the OAuth app
  under GitHub's authorized applications and any organization third-party access policy.
- **Google app unavailable to a tester**: add the account under the Google OAuth Audience test users
  or publish the app as appropriate for the intended audience.

Provider references: [Better Auth GitHub](https://better-auth.com/docs/authentication/github),
[Better Auth Google](https://better-auth.com/docs/authentication/google),
[Better Auth OAuth and account linking](https://better-auth.com/docs/concepts/oauth),
[GitHub OAuth authorization](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps),
and [Google OAuth production readiness](https://developers.google.com/identity/protocols/oauth2/production-readiness/overview).
