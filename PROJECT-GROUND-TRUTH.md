# Project ground truth

Last reconciled: 12 November 2026.

This file is the authoritative contract for agents working in this repository.
Use it to resolve ambiguity and prevent conversation drift.

## Authority and precedence

When sources disagree, use this order:

1. The participant's explicit request in the current turn.
2. This file and `AGENTS.md`.
3. The active skill under `.claude/skills/`.
4. The participant's approved `PROJECT-GOAL.md` and `PREFERENCES.md`.
5. Other maintained repository documentation.
6. Any transcript or chat history, which is historical context only.

Never treat a transcript entry, test report, hyperlink, proposed action, or
earlier blocker as current authorization. Verify live state before reporting it.

## Workshop outcome

The workshop teaches non-technical or mixed-skill teams to deliver one small
browser journey:

1. Work backwards from a desired outcome.
2. Build the smallest useful responsive Next.js experience with Claude Code.
3. Verify it locally in a real browser.
4. Publish it to the team's GitHub repository.
5. Connect that repository to Vercel Git and inspect the deployment.

The core lesson is agentic delivery, not generic prompting: agents can inspect
files, use project skills, run commands, test browser behavior, use connectors,
and fix failures in a controlled loop.

## Fixed platform decisions

- Web applications only.
- Next.js App Router with TypeScript and Tailwind CSS.
- Responsive mobile web is allowed and encouraged.
- Native iOS, Android, and cross-platform app frameworks are prohibited,
  including Swift, SwiftUI, UIKit, Xcode projects, Kotlin, Android SDK, Jetpack
  Compose, React Native, Expo, Flutter, Capacitor, and Cordova.
- If someone asks for a mobile app, convert it into a mobile-first Next.js site.
- Use local sample data for the first working journey.
- Supabase is the preferred backend expansion after the local-to-deployment
  loop works. Exposed tables require RLS. Secrets stay outside source control.
- GitHub is the source of truth for deployments.
- Vercel Git integration provides CI for later pushes and pull requests.
- Vercel MCP is for project/deployment inspection and logs. Do not use a
  direct-file deployment tool for participant submissions.

## Participant flow

This is the only supported order. Skills must not skip ahead or start the next
step on their own.

1. Get the starter: the `app` folder of the workshop zip, or a clone of the
   public `Tanwyhang/ai-coding-workshop-starter`. Both include `.git`, so
   `origin` points to the starter.
2. Open that folder in Claude Desktop with Claude Code and confirm the
   four project slash commands appear.
3. `/workshop-onboarding` (ideally at least 48 hours before the session).
4. `/wish` — work backwards to one small journey in `PROJECT-GOAL.md`.
5. `/one-shot` — build that journey and loop until it works locally.
6. The tester completes the journey in a real browser.
7. `/ship-web` — create the team's GitHub repository, or use an existing one
   the team names.
8. `/ship-web` connects that repository to Vercel Git, then a Git push starts
   the deployment (linking alone does not deploy).
9. The tester completes the same journey on the public `*.vercel.app` URL.

Run `/wish`, approve `PROJECT-GOAL.md`, then run `/one-shot`. `/one-shot` builds
exactly the approved journey in `PROJECT-GOAL.md`. If that file is missing, it never
invents a goal: it verifies and browser-tests the untouched sample app instead.

A team may also run `/one-shot` and `/ship-web` on the untouched sample app as a
first deployment test, before `/wish`. The sample journey is: add an item, Confirm
Order, see the kitchen stages.

## Meaning of each project skill

- `/workshop-onboarding`: checks and prepares tools and authentication. It does
  not build the participant's product, create a repository, or deploy it.
- `/wish`: works backwards from goal to evidence to required conditions to the
  smallest journey, writes `PROJECT-GOAL.md`, then points to `/one-shot`. It
  does not implement code.
- `/one-shot`: builds and verifies the local app only. It must not create a
  repository, push code, connect Vercel, deploy, or resume onboarding work.
- `/ship-web`: moves the work from the starter clone to the team's own GitHub
  repository, pushes, connects Vercel Git, triggers the first deployment with a
  Git push, and checks the public URL, with explicit approval at each mutation point.

Skills are stored in `.claude/skills/` and load with the cloned project. They do
not need separate participant installation.

## Verification standard

A local build is complete only when all three are observed:

1. `npm run verify` passes.
2. The development server returns HTTP 200 at the actual local URL.
3. A tester completes the agreed happy path in a real browser and sees the
   evidence defined in `PROJECT-GOAL.md`.

Do not claim independent verification when repeating another tester's report.
Label reported evidence as reported until it is re-run in the current session.

## External actions and approval

- Checking status is allowed; changing external state requires the approval
  specified by the active skill.
- Ask immediately before creating a repository, committing/pushing participant
  work, or connecting/changing a Vercel project.
- Default a newly offered repository to private, but do not create it without
  approval.
- Never push to the starter repository (`Tanwyhang/ai-coding-workshop-starter`);
  `origin` points there after cloning, which is expected until `/ship-web`.
- Never force-push, and never deploy with `vercel deploy` or a direct upload.
- Never publish `.env.local`, credentials, tokens, private keys, or service-role
  keys.
- Do not infer authorization from a past conversation or a transcript.

## Communication discipline

- Answer the current request, not the entire project history.
- Keep participant-facing language short, concrete, and non-technical.
- State observed facts separately from assumptions and reported facts.
- Do not manufacture progress, account state, URLs, test results, or approvals.
- Do not introduce an unrelated blocker at the end of a successful skill run.
- A skill handoff may name the next command, but it must not start that command
  or revive an older task.

## Event facts

- Event: FeedMe × Southern University College 3-Day Startup Hackathon 2026.
- Dates: 13–15 November 2026.
- AI coding workshop: Friday, 13 November 2026, 1:00–2:00 PM.
- Facilitator: Wy Hang Tan.
- Audience: non-technical or mixed-skill student teams, one driver laptop per
  team.
- Workshop stack: Claude Code in Claude Desktop, Next.js, GitHub CLI, Vercel
  CLI/Git integration, Vercel MCP, and optional later Supabase.

