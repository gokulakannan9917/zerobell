# Wishful programming

Wishful programming is a goal-seeking method. Start with the desired outcome and work backwards through the conditions required to reach it.

Use it before asking Claude to write code. It prevents a broad idea from turning into an unbounded feature list.

## The four questions

Answer one question at a time:

1. **Goal:** What result do you want to achieve?
2. **Evidence:** What observable result will prove you reached it?
3. **Conditions:** What must already be true immediately before that?
4. **First step:** Repeat question 3 until you reach something the team can build or test now.

The chain between the **first step** and the **evidence** forms the happy path for the first version.

## F&B example

**Goal**

> Customers can place orders without staff missing them.

**Work backwards**

- Evidence: the browser shows a confirmed order and kitchen progress.
- Immediately before that, the customer confirms the order.
- Immediately before that, the customer selects an item.

**Smallest journey**

> Select an item, confirm the order, see kitchen progress.

## Prompt template

The usual next step after `/wish` is `/one-shot`. If your team prefers a guided build instead, copy this into Claude:

```text
Build a responsive Next.js web experience for [primary user].

The goal is: [desired outcome].

The smallest complete journey is:
1. [first user action]
2. [next action or system response]
3. [visible proof of success]

Use local sample data for the first version. Keep the existing project structure and visual language. Do not add a backend or new dependency unless it is required for this journey.

Done when a tester can complete the journey in a browser and observe this evidence: [evidence].
```

## Scope check

Keep an item only if it helps produce the evidence for the goal. Put every other idea under **Later** in `PROJECT-GOAL.md`.
