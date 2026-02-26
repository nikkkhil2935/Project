import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "API_KEY_NOT_FOUND");

// Helper to scrape a single URL
async function scrapeUrl(url: string): Promise<{ text: string; url: string; scrapedAt: string; contentLength: number }> {
    const scrapedAt = new Date().toISOString();
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
            signal: AbortSignal.timeout(8000),
            redirect: 'follow'
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        $('script, style, nav, footer, header, iframe, noscript, svg').remove();
        const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);
        return { text, url, scrapedAt, contentLength: text.length };
    } catch (e) {
        return { text: '', url, scrapedAt, contentLength: 0 };
    }
}

// Attempt to discover subpages from the base URL
function deriveSubpages(baseUrl: string): string[] {
    try {
        const u = new URL(baseUrl);
        const origin = u.origin;
        return [
            baseUrl,
            `${origin}/about`,
            `${origin}/careers`,
            `${origin}/blog`,
        ];
    } catch {
        return [baseUrl];
    }
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Scrape multiple pages in parallel
        const targets = deriveSubpages(url);
        const results = await Promise.allSettled(targets.map(t => scrapeUrl(t)));

        const sources: { url: string; scrapedAt: string; contentLength: number }[] = [];
        let combinedText = '';

        results.forEach((r) => {
            if (r.status === 'fulfilled' && r.value.contentLength > 50) {
                sources.push({
                    url: r.value.url,
                    scrapedAt: r.value.scrapedAt,
                    contentLength: r.value.contentLength,
                });
                combinedText += `\n\n--- PAGE: ${r.value.url} ---\n${r.value.text}`;
            }
        });

        if (!combinedText.trim()) {
            combinedText = "Website content could not be retrieved.";
        }

        // Trim combined text to fit within model context
        const pageText = combinedText.slice(0, 12000);

        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

        if (apiKey && apiKey !== "YOUR_GEMINI_API_KEY_HERE") {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const prompt = `You are a venture capital analyst. Analyze the following scraped company website content and provide an investment-grade analysis.

Website content:
"""
${pageText}
"""

Return ONLY valid JSON with this exact structure (no markdown, no code fences):
{
  "summary": "A concise 1-2 sentence VC-style summary of the company and its value proposition",
  "whatTheyDo": [
    "First key capability or product feature",
    "Second key capability",
    "Third key capability",
    "Fourth key capability (if applicable)",
    "Fifth key capability (if applicable)"
  ],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7"],
  "derivedSignals": [
    {"type": "careers", "label": "Careers page signal", "description": "Description of hiring activity detected", "date": "${new Date().toISOString()}"},
    {"type": "product", "label": "Product signal", "description": "Description of product momentum signal", "date": "${new Date().toISOString()}"},
    {"type": "content", "label": "Content signal", "description": "Description of content/blog activity", "date": "${new Date().toISOString()}"}
  ],
  "sector": "Primary sector classification (e.g., Developer Tools, AI/ML, Enterprise SaaS, Healthcare, Fintech)",
  "targetCustomer": "B2B or B2C or B2B2C"
}

Requirements:
- whatTheyDo must be an array of 3-6 concise bullet strings
- keywords must be 5-10 relevant tags
- derivedSignals must be 2-4 signals actually inferred from the content (careers page exists, recent blog posts, changelog present, documentation site, etc.)
- Be specific and factual based on the content provided`;

                const result = await model.generateContent(prompt);
                const aiResponse = await result.response;
                const text = aiResponse.text();

                const jsonMatch = text.match(/\{[\s\S]*\}/);
                const aiData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

                if (aiData) {
                    // Ensure whatTheyDo is an array
                    if (typeof aiData.whatTheyDo === 'string') {
                        aiData.whatTheyDo = [aiData.whatTheyDo];
                    }

                    return NextResponse.json({
                        ...aiData,
                        enrichedAt: new Date().toISOString(),
                        enrichmentModel: 'Gemini 1.5 Flash',
                        sources,
                    });
                }
            } catch (aiError) {
                console.error('Gemini error:', aiError);
            }
        }

        // Fallback: demo mode response
        return NextResponse.json({
            summary: "Innovative tech firm optimizing digital transformation workflows.",
            whatTheyDo: [
                "Provides scalable cloud infrastructure for modern applications",
                "Offers developer-friendly APIs and SDKs",
                "Delivers enterprise-grade security and compliance tooling",
                "Enables real-time data processing and analytics pipelines"
            ],
            keywords: ["SaaS", "Enterprise", "Infrastructure", "Cloud", "APIs", "DevTools"],
            derivedSignals: [
                { type: "careers", label: "Active hiring", description: "Career page detected with open engineering roles.", date: new Date().toISOString() },
                { type: "product", label: "Product momentum", description: "Recent product updates or changelog entries detected.", date: new Date().toISOString() }
            ],
            enrichedAt: new Date().toISOString(),
            enrichmentModel: 'Internal Engine (Demo Mode)',
            sources,
            isMock: true
        });

    } catch (error: any) {
        console.error('API Route Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
