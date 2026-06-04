---
title: "Practical Guide to Building with AI APIs in 2024"
date: "2024-07-02"
excerpt: "LLMs are powerful but tricky to use well in production. Here's what I've learned building AI-powered features into real apps — from prompt engineering to streaming responses."
tags: ["ai", "api", "python", "tutorial"]
---

# Practical Guide to Building with AI APIs in 2024

I've been building with AI APIs — mainly the OpenAI and Anthropic APIs — across several projects now. Here's what I wish I'd known when I started.

## Choosing an API

There are three major options right now:

| Provider | Model | Best For |
|----------|-------|---------|
| OpenAI | GPT-4o | General use, function calling |
| Anthropic | Claude 3.5 | Long context, reasoning, coding |
| Google | Gemini 1.5 | Multimodal, long docs |

For most projects, start with whichever you have API access to. The patterns are largely the same.

## The Basic Pattern

All LLM APIs follow the same structure — you send a list of messages, get a response:

```python
from anthropic import Anthropic

client = Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Explain React hooks in one paragraph."}
    ]
)

print(response.content[0].text)
```

## Streaming Responses

For user-facing apps, streaming is essential. Nobody wants to stare at a spinner for 10 seconds waiting for a full response.

```python
with client.messages.stream(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": prompt}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

In a web app, use Server-Sent Events (SSE) to push tokens to the client as they arrive.

## Prompt Engineering Tips

After building several AI features, here's what actually works:

**Be specific about format.** Instead of "Summarize this", write "Summarize this in 3 bullet points, each under 20 words."

**Give examples.** Few-shot prompting (showing the model 2-3 examples of what you want) dramatically improves output quality.

**Set the role.** Starting with "You are a senior software engineer reviewing code..." gets better results than no context.

**Use system prompts.** Put stable instructions in the system prompt. Put variable input in the user message.

```python
response = client.messages.create(
    model="claude-sonnet-4-5",
    system="You are a code reviewer. Give concise, actionable feedback. Focus on bugs and security issues.",
    messages=[
        {"role": "user", "content": f"Review this code:\n\n{code}"}
    ],
    max_tokens=800,
)
```

## Handling Errors & Rate Limits

Production AI apps need solid error handling:

```python
import anthropic
import time

def call_with_retry(client, **kwargs, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.messages.create(**kwargs)
        except anthropic.RateLimitError:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # exponential backoff
            else:
                raise
        except anthropic.APIError as e:
            raise
```

## Cost Management

LLM APIs can get expensive fast. Strategies I use:

- **Cache responses** for identical inputs
- **Set max_tokens** appropriately — don't over-allocate
- **Use smaller models** for simpler tasks (haiku vs. sonnet)
- **Batch requests** where possible
- **Log token usage** so you can audit costs

## What I've Learned

Building with AI APIs is genuinely exciting. But treat the LLM as a smart collaborator, not a magic box. Give it clear instructions, validate its outputs, and always have a fallback for when it gets things wrong.

The best AI features I've built are the ones where the AI handles the fuzzy, language-heavy work — and deterministic code handles everything else.

What are you building with AI? Let me know.
