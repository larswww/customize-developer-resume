# AI Resume Generator

A React application that generates targeted resumes using AI services. The application leverages React Router and Tailwind CSS for a smooth user experience.

## Features

- Step-by-step visualization of the resume generation process
- Support for various AI providers (Anthropic, OpenAI, Gemini)
- Mock API integration for development and testing without API costs
- End-to-end testing with Playwright

## Getting Started

### Prerequisites

- Node.js (v16+)
- pnpm (v7+)

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start the development server
pnpm dev
```

The application will be available at http://localhost:3000.

## API Configuration

By default, the application uses Mock Service Worker (MSW) in development mode to intercept API calls and return mock responses. This means you can develop and test without real API keys.

If you want to use the real AI providers, you need to set the following environment variables:

```
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

You can use a `.env` file in the project root to set these variables.

## Testing

### Unit Tests

The project includes unit tests using Vitest. These tests focus on testing individual components and services in isolation.

```bash
# Run unit tests
pnpm test

# Run unit tests in watch mode (for development)
pnpm test:watch

# Run unit tests with UI
pnpm test:ui

# Run unit tests with coverage report
pnpm test:coverage
```

### End-to-End Tests

The project includes end-to-end tests using Playwright. These tests use MSW to mock API responses, so you don't need real API keys to run them.

```bash
# Run end-to-end tests
pnpm test:e2e

# Run end-to-end tests with UI
pnpm test:e2e:ui
```

## License

MIT
