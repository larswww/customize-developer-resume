**If you received a resume from me, it was made using this application, and manually verified for accuracy. I provide the source code for transparency and as sample of my work**

# AI Resume Generator
Write your full career story; get a focused, one‑page résumé for any job in seconds. An AI workflow distills your own words—no AI hallucinations—so every application is authentic. 

#### Why
April 2025: my contract wrapped up and the job boards beckoned. I was drowning in the rinse‑and‑repeat of tailoring the same résumé for every posting—time I'd rather spend writing code. So I turned the problem into a side‑project.

## How To Use
- Write your career story, a detailed document covering all aspects of the work you have done and who you are professionally
- Add description for a new role
- Select a template and receive a one-page resume

## Customize
You can easily make a resume that is unique to you due to the modular design.

Here's where you can customize the app to create resumes unique to you:
```
app/
├── config/
│   ├── schemas/         # Data Schemas
│   └── workflows/       # AI Workflows
└── components/
    └── resume/
        └── templates/   # Resume Templates 
```

To customize:
1. **Schemas**: Data schemas control which sections and information a certain template should be populated with
2. **Workflows**: Configuration for a series of AI steps, prompts, input variables to transform your work history into the desired resume schema
3. **Templates**: React/Tailwind layouts of resumes or cover letter that renders your generated data

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
