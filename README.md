# MockForge
 
A developer tool that generates live, AI-powered API mock endpoints. Describe your endpoint in plain English or paste a TypeScript interface — get a real URL returning realistic JSON that you can call from any frontend app.
 
**Live Demo:** [mock-api-project-liart.vercel.app](https://mock-api-project-liart.vercel.app)
 
---
 
## Tech Stack
 
- **Next.js 15** (App Router + Route Handlers)
- **Google Gemini API** — AI data generation
- **Upstash Redis** — serverless storage with 24h TTL
- **React Hook Form + Zod** — form validation
- **Tailwind CSS + shadcn/ui** — UI components
---
 
## Running Locally
 
**1. Clone and install**
```bash
git clone https://github.com/yourusername/mockforge.git
cd mockforge
npm install
```
 
**2. Add environment variables**
 
Create a `.env.local` file in the root:
```env
GEMINI_API_KEY=your-gemini-key
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
 
- Gemini API key → [aistudio.google.com](https://aistudio.google.com) (free, no credit card)
- Upstash credentials → [console.upstash.com](https://console.upstash.com) (free, no credit card)
**3. Start the dev server**
```bash
npm run dev
