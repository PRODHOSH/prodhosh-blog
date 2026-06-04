---
title: "Why React is Still My Go-To Frontend Choice"
date: "2024-06-18"
excerpt: "Svelte is elegant. Solid is fast. Vue is approachable. Yet React continues to be my first choice for frontend projects. Here's why — and the honest tradeoffs."
tags: ["react", "frontend", "opinion"]
---

# Why React is Still My Go-To Frontend Choice

Every few months, someone writes a post declaring that React is dead. Svelte is faster. Solid is more reactive. Qwik has resumability. And yet — when I start a new project, I still reach for React. Here's my honest take on why.

## The Ecosystem Is Unmatched

React's true power isn't the library itself — it's the ecosystem around it.

- **Next.js** for full-stack apps
- **React Native** for mobile (same mental model!)
- **Remix** for data-focused apps
- Thousands of battle-tested libraries

When you're building for production, this matters. Need auth? There's a library. Need forms? Multiple great options. Need a date picker? You've got choices.

## The Mental Model Scales

React's component model is simple to learn but scales to complex UIs without breaking down. When I look at a React component, I know exactly what it does:

- Props come in, UI comes out
- State lives inside, or in a store
- Effects happen at the boundary

This predictability is worth a lot on a team.

## The Job Market Reality

I'll be honest about this one: React is *everywhere* in the job market. Whether you're freelancing, interviewing, or joining an existing codebase — knowing React deeply is one of the best investments you can make as a frontend developer.

That's not an argument for stagnation. It's a pragmatic one.

## The Honest Tradeoffs

React isn't perfect:

**Bundle size** — Even with server components, React adds weight that Svelte or Solid doesn't.

**The hooks learning curve** — `useEffect` is genuinely confusing at first. The rules of hooks trip everyone up initially.

**Verbose compared to Vue/Svelte** — Writing JSX and managing state in React requires more boilerplate than `<script setup>` in Vue.

**Not the fastest** — Solid.js benchmarks faster for raw rendering performance.

## When I'd Choose Something Else

- **A marketing site with minimal JS?** Astro all the way.
- **A small interactive widget?** Svelte.
- **Maximum runtime performance?** Solid.js.
- **Full-stack with minimal config?** Still Next.js/React, honestly.

## Final Thoughts

React isn't perfect, but it's deeply mature, well-documented, and backed by one of the largest developer communities in the world. For most projects I work on — SaaS products, dashboards, AI-powered tools — React (via Next.js) remains the most productive and future-proof choice.

Don't switch frameworks because of hype. Switch when the tradeoffs justify it for your specific use case.

What's your current go-to stack? I'd love to hear.
