import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Standard initialization with User-Agent set for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const { name, website, industry } = await req.json();

    if (!name || !website) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    const systemPrompt = `You are an expert web development agency strategist auditing a prospective client's website.
Analyze the business and website and return:
1. Simulated but realistic metrics: Site Speed (0-100), Mobile Friendly (true/false), SEO Score (0-100), SSL Enabled (true/false).
2. A comprehensive, highly professional website audit report in Markdown format.
3. A personalized, high-converting outreach email body that the agency can use to contact the client.

Important formatting instructions:
Ensure that the metrics are highly realistic for the given business and website name. For example, if the website is a local local restaurant website, it might have slower speed, poor mobile responsiveness, or missing SSL.
The Opportunity Score should be calculated as follows: (100 - (Site Speed * 0.3 + SEO Score * 0.4 + (Mobile Friendly ? 15 : 0) + (SSL Enabled ? 15 : 0))). A higher Opportunity Score means the website needs more help, making it a better target for agency outreach.`;

    const userPrompt = `Audit the following business website:
Business Name: ${name}
Website: ${website}
Industry/Niche: ${industry || "General / Local Business"}

Please generate:
1. The metrics as a JSON structure.
2. The complete Markdown Audit report containing clear headings, specific local business insights, actionable design recommendations, and a ready-to-use email pitch.`;

    // We can do structured output using JSON response mode
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            siteSpeed: { type: Type.INTEGER, description: "Realistic speed score (15-95) for the audited site" },
            mobileFriendly: { type: Type.BOOLEAN, description: "Whether the site is mobile responsive" },
            seoScore: { type: Type.INTEGER, description: "Realistic SEO score (20-95)" },
            sslEnabled: { type: Type.BOOLEAN, description: "Whether SSL/HTTPS is configured correctly" },
            opportunityScore: { type: Type.INTEGER, description: "Agency opportunity score from 10 to 100 based on the need for improvements" },
            aiAudit: { type: Type.STRING, description: "Complete website audit report and pitch in elegant Markdown" }
          },
          required: ["siteSpeed", "mobileFriendly", "seoScore", "sslEnabled", "opportunityScore", "aiAudit"]
        }
      }
    });

    const textResult = response.text || "{}";
    const data = JSON.parse(textResult.trim());
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Return graceful mock fallback if Gemini API is not configured or fails
    const mockSpeed = Math.floor(Math.random() * 40) + 30;
    const mockSeo = Math.floor(Math.random() * 40) + 40;
    const mockMobile = Math.random() > 0.4;
    const mockSsl = Math.random() > 0.3;
    const mockOppScore = Math.floor(
      100 - (mockSpeed * 0.3 + mockSeo * 0.4 + (mockMobile ? 15 : 0) + (mockSsl ? 15 : 0))
    );

    return NextResponse.json({
      siteSpeed: mockSpeed,
      mobileFriendly: mockMobile,
      seoScore: mockSeo,
      sslEnabled: mockSsl,
      opportunityScore: mockOppScore,
      aiAudit: `### ⚠️ Web Audit Report for ${req.headers.get("referer") || "Prospective Client"} (Fall-back Analysis)

*We generated this fallback report because the live AI analysis server returned a temporary error, or GEMINI_API_KEY is not configured yet. Set your API Key in the **Settings > Secrets** panel to enable deep live audits.*

#### 🚀 Performance & Technical Findings
- **Loading Speed**: **Slower than 3 seconds**. Heavy unoptimized images and bloated script libraries are blocking the main thread.
- **Mobile Responsive**: **Partial/Responsive Gaps**. The navigation menu overlap elements on screens under 375px.
- **SEO Optimization**: **Missing core elements**. OpenGraph meta tags are missing, and image alt descriptions are not set.
- **Security (SSL/HTTPS)**: Standard configuration but TLS version is outdated.

#### 💡 Actionable Recommendations
1. **Migrate to Next.js / Tailwind CSS**: Boost core web vitals and achieve a 95+ speed score.
2. **Re-design navigation menu**: Fully fluid layout ensuring seamless mobile-first booking/contact conversions.
3. **Structured Schema Markup**: Inject Local Business schemas to improve rank on Google Maps.

---

#### ✉️ Suggested Outreach Pitch
**Subject**: Helping your business attract more clients online

Hi team,

I was looking at your website and noticed a few optimization opportunities that could help increase your conversions, especially on mobile devices. 

We ran a quick technical audit and found:
- Mobile responsiveness could be improved (currently seeing layout breaks on newer iPhones)
- Page load times could be halved by optimizing image assets

Would you be open to a quick 5-minute call this week to look at how we can help upgrade your site to a modern, blazing-fast layout?

Best regards,
*Your Agency Name*`
    });
  }
}
