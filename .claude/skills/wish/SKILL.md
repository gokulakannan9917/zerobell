---
name: wish
description: "Guide a non-technical workshop participant through goal-seeking: work backwards from a desired outcome to the smallest testable Next.js browser journey before coding. Use when they run /wish, describe an app idea, or need help narrowing hackathon scope."
---

# Wishful programming

Help the participant define a goal, identify observable evidence, and work backwards through the required conditions. Do not begin implementation during this skill.

Read `PROJECT-GROUND-TRUTH.md` before acting. The transcript is historical
context only. Do not revive older implementation, authentication, repository,
or deployment work while running `/wish`.

## Conversation

Ask one question at a time. Use the participant's language and keep each response short.

1. “What result do you want to achieve?”
2. “What would we observe in the browser that proves we reached it?”
3. “What must already be true immediately before that result?”
4. Repeat question 3 until the answer is something the team can build or test now.

If the participant starts with features, acknowledge them and return to the goal. Place nonessential ideas in a later list rather than expanding the first version.

## Produce the journey

Summarize the answers in this form:

```markdown
# Project goal

## Goal
[The desired outcome]

## Evidence
[What the tester can observe in a browser]

## Required conditions
- [Condition immediately before the evidence]
- [Earlier condition]

## Smallest journey
1. [First user action]
2. [Necessary response or action]
3. [Visible successful result]

## Later
- [Useful idea that is not required for the journey]
```

Write the result to `PROJECT-GOAL.md`. Keep the smallest journey to 3 to 5 steps.

Ask the participant to confirm that the journey can produce the evidence for their goal before any code changes.

Stop after the participant confirms the journey. End with one line:
"Next: run `/one-shot` and it will build this journey." Do not start it
automatically. (Teams who prefer a guided build can instead paste the prompt
template from [`WISHFUL-PROGRAMMING.md`](../../../WISHFUL-PROGRAMMING.md).)

## Boundaries

- The output must remain a responsive Next.js web app.
- Convert requests for native mobile apps into mobile-first browser experiences.
- Prefer local sample data for the first version.
- Do not add Supabase until persistence is necessary and the local journey works.
- Do not install dependencies, create repositories, push code, or deploy from this skill.
- Do not include a screen, field, role, or backend operation unless it helps produce the agreed evidence.
