---
title: "Getting Started with Next.js 14 App Router"
date: "2024-06-10"
excerpt: "Next.js 14 ships a stable App Router with React Server Components, Server Actions, and a new layouts system. Here's how to get started and what makes it different from the Pages Router."
tags: ["nextjs", "react", "tutorial"]
---

# Getting Started with Next.js 14 App Router

Next.js 14 is a significant release — it stabilizes the App Router, introduces Server Actions, and delivers meaningful performance improvements. If you've been using the Pages Router, this guide will help you make the mental switch.

## What Changed in the App Router?

The App Router introduces a few fundamental shifts:

- **React Server Components (RSC)** — Components run on the server by default
- **Nested layouts** — Share UI across routes without re-rendering
- **Server Actions** — Call server-side functions directly from client forms
- **Streaming** — Progressive rendering with `Suspense`

## Setting Up

```bash
npx create-next-app@latest my-app --app
cd my-app
npm run dev
```

## Directory Structure

```
app/
├── layout.js      ← root layout (wraps every page)
├── page.js        ← route: /
├── about/
│   └── page.js    ← route: /about
└── blog/
    ├── page.js    ← route: /blog
    └── [slug]/
        └── page.js  ← route: /blog/:slug
```

## Server vs Client Components

By default, every component in the App Router is a **Server Component**. They run only on the server and can directly access databases, read files, or call APIs.

To use state, effects, or browser APIs, mark the file with `"use client"`:

```jsx
"use client";
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## Fetching Data

In a Server Component, you can fetch data directly — no `useEffect`, no `getServerSideProps`:

```jsx
// app/posts/page.js (Server Component)
async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: { revalidate: 60 }, // ISR: revalidate every 60s
  });
  return res.json();
}

export default async function Posts() {
  const posts = await getPosts();
  return (
    <ul>
      {posts.map(p => <li key={p.id}>{p.title}</li>)}
    </ul>
  );
}
```

## Layouts

Layouts wrap multiple routes and persist across navigation — great for shared navbars and sidebars:

```jsx
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>My Nav</nav>
        {children}
      </body>
    </html>
  );
}
```

## Server Actions

Server Actions let you write form handlers that run on the server — no separate API route needed:

```jsx
// app/contact/page.js
async function handleSubmit(formData) {
  "use server";
  const email = formData.get("email");
  await sendEmail(email); // runs on server
}

export default function Contact() {
  return (
    <form action={handleSubmit}>
      <input name="email" type="email" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Key Takeaways

- Default to Server Components — only add `"use client"` when you need interactivity
- Layouts replace `_app.js` and `_document.js`
- Server Actions replace API routes for most form handling
- Data fetching is just `async/await` in a component

The App Router has a learning curve, but it's worth it. The server-first model unlocks better performance and a cleaner data flow.

Happy coding! 🚀
