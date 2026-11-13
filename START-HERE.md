# Participant starter pack

This page is the front door for the workshop. Complete the setup section before the event, then return here when the workshop begins.

## What comes with the repository

- A working Next.js web starter
- The `/workshop-onboarding`, `/wish`, `/one-shot`, and `/ship-web` skills
- A complete F&B prompt example
- Local verification with `npm run verify`

The skills are stored in `.claude/skills/`. Claude loads them when you open the cloned project folder. Do not install them separately.

## Before you begin

Install these first:

- [Claude Desktop](https://claude.com/download) with Claude Code available
- [Node.js LTS](https://nodejs.org)
- [Git](https://git-scm.com/downloads)
- [GitHub CLI](https://cli.github.com)

Create or confirm your GitHub and Vercel accounts. The onboarding skill will check versions, finish authentication, install Vercel CLI if needed, and connect Vercel MCP.

## Before the workshop

### 1. Get the starter

If you received the workshop zip, unzip it. The starter is its `app` folder.

Otherwise, clone it:

```bash
git clone https://github.com/Tanwyhang/ai-coding-workshop-starter.git
```

You do not need your own team repository yet. `/ship-web` creates it (or uses
one your team already has) at the end.

### 2. Open the starter folder

Open the `app` folder (or `ai-coding-workshop-starter` if you cloned) in Claude Desktop. Type `/` and
confirm these project skills appear:

```text
/workshop-onboarding
/wish
/one-shot
/ship-web
```

If they do not appear, confirm that Claude opened the starter folder itself (`app`), not the folder above it.

### 3. Run onboarding

```text
/workshop-onboarding
```

Follow the prompts for GitHub and Vercel sign-in. Onboarding also connects Vercel MCP, installs project packages, and runs the local verification.

You are ready when Claude confirms:

- GitHub CLI is authenticated
- Vercel CLI is authenticated
- Vercel MCP is connected
- `npm run verify` passes
- The local app opens in a browser

Finish installation and onboarding at least 48 hours before the workshop.

## During the workshop

Optional warm-up: before `/wish`, run `/one-shot` then `/ship-web` on the
untouched sample app to get your first public link, then continue below.

### 1. Work backwards from the goal

```text
/wish
```

Answer one question at a time. Check `PROJECT-GOAL.md` and approve the smallest browser journey.

### 2. Build it

```text
/one-shot
```

Add preferences if you like, for example `/one-shot playful dark theme, Bahasa Malaysia`.
Claude builds the journey in `PROJECT-GOAL.md`, verifies it, browser-tests it,
and leaves the local app running. It does not publish or deploy.

### 3. Test it yourself

Open the local link Claude gives you and click through the journey. Ask Claude
for fixes in plain English until it works.

### 4. Publish through GitHub and Vercel

```text
/ship-web
```

Paste your team's GitHub repo link, or say "new" to create a private one.
Approve each step. The skill pushes your code there, connects Vercel to that
repo, and gives you the public link.

### 5. Test the public link

Open the `https://<project>.vercel.app` link on a phone and complete the same
journey.

## Completion checklist

- The agreed journey works locally
- `npm run verify` passes
- The code is in the team's own GitHub repository (not the starter)
- Vercel is connected to that repository
- The public URL works in a browser
- A later GitHub push creates another Vercel deployment

## Workshop rules

- Build a responsive Next.js website only
- Do not use native iOS, Android, React Native, Expo, Flutter, or app-store tooling
- Keep secrets in `.env.local`, never in Git
- Use Supabase only after the first local-to-deployment journey works
- GitHub remains the deployment source; do not use direct file deployment for the submission

## Reference links

- [GitHub CLI quickstart](https://docs.github.com/en/github-cli/github-cli/quickstart)
- [Vercel MCP setup](https://vercel.com/docs/agent-resources/vercel-mcp)
- [Vercel Git connection](https://vercel.com/docs/cli/git)
- [Wishful Programming worksheet](WISHFUL-PROGRAMMING.md)
- [Complete prompt example](ONE-SHOT-PROMPT.md)
