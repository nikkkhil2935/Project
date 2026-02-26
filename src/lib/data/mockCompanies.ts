import { Company } from '../types';

export const mockCompanies: Company[] = [
    {
        id: "1",
        name: "Linear",
        website: "https://linear.app",
        description: "Issue tracking built for high-performance teams. Linear streamlines software projects, sprints, tasks, and bug tracking with a beautiful, fast, and keyboard-first interface.",
        stage: "Series B",
        sector: "Enterprise SaaS",
        geography: "San Francisco",
        tags: ["Productivity", "DevTools", "Design-led", "Project Management"],
        derivedSignals: [
            { type: "hiring", label: "Hiring 12 open roles", description: "Active careers page with 12 open engineering and design positions.", detectedAt: new Date(Date.now() - 86400000).toISOString() },
            { type: "changelog", label: "Active product velocity", description: "Updated changelog 2 days ago with new Triage features.", detectedAt: new Date(Date.now() - 172800000).toISOString() }
        ],
        notes: [{ id: "n1", text: "Strong founder team from Coinbase. Design-led approach is a major differentiator.", createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), author: "Analyst" }],
        pipelineStage: 'reviewing',
        watched: true
    },
    {
        id: "2",
        name: "Vercel",
        website: "https://vercel.com",
        description: "Vercel is the frontend cloud. Build, scale, and secure a faster, personalized web with Next.js and the Vercel platform.",
        stage: "Series C+",
        sector: "Developer Tools",
        geography: "Remote",
        tags: ["React", "Hosting", "Infrastructure", "Edge", "Next.js"],
        derivedSignals: [
            { type: "blog", label: "Content momentum", description: "Published latest Next.js conference recap blog post.", detectedAt: new Date(Date.now() - 43200000).toISOString() },
            { type: "hiring", label: "Scaling team", description: "Hiring across engineering, sales, and marketing functions.", detectedAt: new Date(Date.now() - 7200000).toISOString() },
            { type: "product", label: "v0 launch", description: "Launched v0 generative UI tool, strong developer viral buzz.", detectedAt: new Date(Date.now() - 86400000 * 3).toISOString() }
        ],
        pipelineStage: 'diligence',
        watched: true
    },
    {
        id: "3",
        name: "Anthropic",
        website: "https://anthropic.com",
        description: "An AI safety and research company that builds reliable, interpretable, and steerable AI systems. Creators of Claude, a helpful, harmless, and honest AI assistant.",
        stage: "Series C+",
        sector: "AI/ML",
        geography: "San Francisco",
        tags: ["LLM", "AI Safety", "Foundation Models", "GenAI", "Enterprise AI"],
        derivedSignals: [
            { type: "press", label: "Major product launch", description: "Announced Claude 3.5 Sonnet with improved reasoning.", detectedAt: new Date(Date.now() - 259200000).toISOString() },
            { type: "docs", label: "Developer ecosystem", description: "Expanded documentation portal and API reference.", detectedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
            { type: "funding", label: "Mega-round closed", description: "$2B Series D at $15B valuation reported.", detectedAt: new Date(Date.now() - 86400000 * 14).toISOString() }
        ],
        pipelineStage: 'invested'
    },
    {
        id: "4",
        name: "Supabase",
        website: "https://supabase.com",
        description: "The open source Firebase alternative. Supabase provides a Postgres database, authentication, instant APIs, edge functions, realtime subscriptions, storage, and vector embeddings.",
        stage: "Series B",
        sector: "Developer Tools",
        geography: "Remote",
        tags: ["Database", "Postgres", "Open Source", "Authentication", "BaaS"],
        derivedSignals: [
            { type: "hiring", label: "Engineering expansion", description: "Hiring Database Engineers and Developer Advocates.", detectedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
            { type: "changelog", label: "Launch Week momentum", description: "Launch Week 12 featured 7 major announcements in 5 days.", detectedAt: new Date(Date.now() - 86400000 * 7).toISOString() }
        ],
        pipelineStage: 'reviewing'
    },
    {
        id: "5",
        name: "Harmonic",
        website: "https://harmonic.ai",
        description: "Data platform for startup discovery and intelligence. Harmonic helps venture firms discover breakout companies before they become obvious, with deep data on founders, teams, and signals.",
        stage: "Series A",
        sector: "Enterprise SaaS",
        geography: "New York",
        tags: ["Data", "Venture Capital", "Scouting", "AI", "Intelligence"],
        derivedSignals: [
            { type: "website_update", label: "Platform redesign", description: "Redesigned landing page with new workflow demos.", detectedAt: new Date(Date.now() - 86400000 * 10).toISOString() }
        ],
        pipelineStage: 'passed'
    },
    {
        id: "6",
        name: "LangChain",
        website: "https://langchain.com",
        description: "Building applications with LLMs through composability. LangChain provides the framework and tooling to build production-grade LLM-powered applications with chains, agents, and retrieval.",
        stage: "Series A",
        sector: "AI/ML",
        geography: "San Francisco",
        tags: ["LLM", "Agent", "Orchestration", "Open Source", "RAG"],
        derivedSignals: [
            { type: "docs", label: "Documentation expansion", description: "New agent tutorials and LangGraph documentation added.", detectedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
            { type: "hiring", label: "Team growth", description: "Hiring DevRel and full-stack engineers.", detectedAt: new Date(Date.now() - 86400000 * 12).toISOString() }
        ]
    },
    {
        id: "7",
        name: "Retool",
        website: "https://retool.com",
        description: "Build internal tools fast. Retool provides a drag-and-drop platform to build custom business software on top of your data, used by thousands of companies from startups to Fortune 500.",
        stage: "Series C+",
        sector: "Enterprise SaaS",
        geography: "San Francisco",
        tags: ["Internal Tools", "Low-Code", "Enterprise", "Developer Platform"],
        derivedSignals: [
            { type: "product", label: "AI features launched", description: "Retool AI and Vectors launched for building AI-powered internal apps.", detectedAt: new Date(Date.now() - 86400000 * 4).toISOString() },
            { type: "hiring", label: "GTM scaling", description: "Multiple open roles in sales engineering and enterprise accounts.", detectedAt: new Date(Date.now() - 86400000 * 6).toISOString() }
        ]
    },
    {
        id: "8",
        name: "Resend",
        website: "https://resend.com",
        description: "Email for developers. Resend is the best way to send transactional and marketing emails at scale with a modern, developer-friendly API and React Email components.",
        stage: "Seed",
        sector: "Developer Tools",
        geography: "San Francisco",
        tags: ["Email", "API", "Infrastructure", "Developer-first", "React"],
        derivedSignals: [
            { type: "product", label: "Rapid iteration", description: "Shipping weekly updates and new integrations.", detectedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
            { type: "blog", label: "Content strategy", description: "Active blog with engineering-focused content.", detectedAt: new Date(Date.now() - 86400000 * 5).toISOString() }
        ]
    },
    {
        id: "9",
        name: "Mistral AI",
        website: "https://mistral.ai",
        description: "European AI lab building frontier open-weight models. Mistral develops efficient, high-performance language models competing with GPT-4 class systems.",
        stage: "Series A",
        sector: "AI/ML",
        geography: "London",
        tags: ["LLM", "Open Source", "Foundation Models", "European AI", "GenAI"],
        derivedSignals: [
            { type: "press", label: "Model launch", description: "Released Mixtral 8x22B, top open-weight model.", detectedAt: new Date(Date.now() - 86400000 * 8).toISOString() },
            { type: "funding", label: "Capital raise", description: "Series A at €2B valuation from a]16z and Lightspeed.", detectedAt: new Date(Date.now() - 86400000 * 20).toISOString() }
        ]
    },
    {
        id: "10",
        name: "Neon",
        website: "https://neon.tech",
        description: "Serverless Postgres. Neon separates storage and compute to offer auto-scaling, branching, and bottomless storage for modern cloud-native Postgres databases.",
        stage: "Series B",
        sector: "Infrastructure",
        geography: "San Francisco",
        tags: ["Database", "Postgres", "Serverless", "Cloud", "Infrastructure"],
        derivedSignals: [
            { type: "product", label: "Branching feature", description: "Database branching for instant dev/staging environments.", detectedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
            { type: "hiring", label: "Engineering growth", description: "Hiring distributed systems engineers.", detectedAt: new Date(Date.now() - 86400000 * 9).toISOString() }
        ]
    },
    {
        id: "11",
        name: "Cursor",
        website: "https://cursor.com",
        description: "The AI-first code editor. Cursor is a fork of VS Code built to make you extraordinarily productive with AI-powered code editing, chat, and codebase understanding.",
        stage: "Series A",
        sector: "Developer Tools",
        geography: "San Francisco",
        tags: ["AI", "Code Editor", "Developer Tools", "Productivity", "GenAI"],
        derivedSignals: [
            { type: "product", label: "Viral growth", description: "Rapidly growing user base among professional developers.", detectedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
            { type: "press", label: "Industry coverage", description: "Featured in major tech publications as the AI coding breakthrough.", detectedAt: new Date(Date.now() - 86400000 * 7).toISOString() }
        ]
    },
    {
        id: "12",
        name: "Perplexity",
        website: "https://perplexity.ai",
        description: "An AI-powered answer engine that provides accurate, trusted, and real-time answers to any question, with citations from across the web.",
        stage: "Series B",
        sector: "AI/ML",
        geography: "San Francisco",
        tags: ["Search", "AI", "Knowledge", "Consumer AI", "LLM"],
        derivedSignals: [
            { type: "funding", label: "Rapid fundraising", description: "Back-to-back funding rounds signaling strong investor conviction.", detectedAt: new Date(Date.now() - 86400000 * 11).toISOString() },
            { type: "product", label: "Enterprise launch", description: "Launched Perplexity Enterprise Pro for business teams.", detectedAt: new Date(Date.now() - 86400000 * 4).toISOString() }
        ]
    },
    {
        id: "13",
        name: "Acme Corp",
        website: "https://acme.com",
        description: "Innovative technology solutions for everything.",
        stage: "Seed",
        sector: "Fintech",
        geography: "United States",
        tags: ["Payments", "Infrastructure"],
        derivedSignals: []
    },
    {
        id: "14",
        name: "Alpha Systems",
        website: "https://alpha.io",
        description: "Cloud infrastructure for modern AI workloads.",
        stage: "Series A",
        sector: "Infrastructure",
        geography: "United States",
        tags: ["Cloud", "AI"],
        derivedSignals: []
    },
    {
        id: "15",
        name: "Beta Flow",
        website: "https://betaflow.com",
        description: "Workflow automation and low-code specialized tools.",
        stage: "Series B",
        sector: "Enterprise SaaS",
        geography: "London",
        tags: ["No-Code", "Automation"],
        derivedSignals: []
    }
];
