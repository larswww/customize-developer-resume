# AI Resume Generator
*Customize your main resume to a particular role automatically.*

It's difficult to minimize your entire work history onto just one page. Doing it over and over again for each role is time consuming. This app helps you write a main resume. You then provide a job description and it will run an AI workflow to produce a customization - whilst staying true to your original content.

#### Why
In April 2025 I started looking for a new freelance assignment. Sending applications is not fun. Building apps is. So I will keep using this and building with it until I have my next gig. 

## How To Use
- You can select multiple workflows or templates, tailored for different purposes, such as  personal letters, technical resumes, or traditional ones.
- It is trivial to add a new AI workflow or template. 
- I would really appreciate a PR with a better workflow or new template!

## Features

- Step-by-step visualization of the resume generation process
- Support for various AI providers (Anthropic, OpenAI, Gemini)
- Mock API integration for development and testing without API costs
- End-to-end testing with Playwright

## Getting Started

### Prerequisites

- Node.js (v16+)
- pnpm (v7+)

### Getting Started
- You will need node 20.17.0 and pnpm 10.6.3. 
- Rename .env.example to .env and add your provider api keys

```bash
pnpm install
pnpm dev
```

## Testing

### Vitest unit tests
[vitest](https://vitest.dev/guide/)
```bash
# Run unit tests
pnpm test
pnpm test:watch
# vitest ui mode
pnpm test:ui
pnpm test:coverage
```

### Playwright End-to-End Tests
These tests use [MSW](https://mswjs.io/docs/getting-started) to mock API responses to avoid real provider api costs/latency.

```bash
# Run end-to-end tests
pnpm test:e2e
pnpm test:e2e:ui
```

## License

MIT
