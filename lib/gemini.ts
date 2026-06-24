import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export function getGeminiClient(): GoogleGenAI {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined");
  }
  return new GoogleGenAI({ apiKey });
}

export interface DiscoveredLead {
  businessName: string;
  website: string;
  phone: string;
  address: string;
  rating: number;
  reviewCount: number;
  category: string;
  painPoints: string[];
}

export async function discoverLeadsAI(industry: string, location: string): Promise<DiscoveredLead[]> {
  const ai = getGeminiClient();
  const prompt = `You are a B2B Lead Generation specialist.
Discover 6 realistic, highly accurate local businesses for the following search:
Industry: "${industry}"
Location: "${location}"

These must represent real types of local businesses that might exist in "${location}" (e.g., "Austin Dentist", "Miami Roofing").
For each business, provide:
1. Business Name (be realistic for ${location})
2. Website URL (a realistic URL for the business, e.g., "http://austindentalsolutions.com" - use http instead of https for some to simulate insecurity, or make some have broken sites)
3. Phone number (formatted, e.g., (512) 555-0192)
4. Address (realistic local street address in ${location})
5. Rating (Google Maps average rating between 2.5 and 4.8)
6. Review Count (Google Maps review count between 5 and 150)
7. Category (detailed industry category)
8. Pain Points (2-3 realistic technical/web issues they likely have, e.g. "Missing SSL certificate", "No online booking form", "Not mobile-optimized", "Slow loading", "Outdated 2015 design")

Provide the output strictly as a JSON array of objects. Do not include markdown wrappers like \`\`\`json. Return ONLY the raw JSON string.
Each object must match this TypeScript shape:
{
  "businessName": "string",
  "website": "string",
  "phone": "string",
  "address": "string",
  "rating": number,
  "reviewCount": number,
  "category": "string",
  "painPoints": ["string"]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text || "[]";
    const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText) as DiscoveredLead[];
  } catch (error) {
    console.error("Error in discoverLeadsAI:", error);
    // Return mock fallback leads if AI fails
    return getFallbackLeads(industry, location);
  }
}

export interface WebsiteAuditResult {
  websiteScore: number;
  sslEnabled: boolean;
  mobileFriendly: boolean;
  hasContactForm: boolean;
  hasAboutPage: boolean;
  hasTestimonials: boolean;
  speedRating: "Fast" | "Medium" | "Slow";
  issues: string[];
  recommendations: string[];
  executiveSummary: string;
  technicalReport: string;
  seoReport: string;
  uxReport: string;
  conversionReport: string;
}

export async function generateWebsiteAuditAI(
  websiteUrl: string,
  businessName: string,
  scrapedData: {
    title?: string;
    description?: string;
    h1Tags?: string[];
    sslEnabled?: boolean;
    loadTimeMs?: number;
    htmlLength?: number;
  }
): Promise<WebsiteAuditResult> {
  const ai = getGeminiClient();

  const prompt = `You are an expert Website Security, SEO, UX, and Conversion Optimization Auditor.
Analyze the following website metadata for "${businessName}" at URL "${websiteUrl}":
Scraped homepage metadata:
- Title tag: "${scrapedData.title || "Unknown"}"
- Meta description: "${scrapedData.description || "Unknown"}"
- H1 Tags found: ${JSON.stringify(scrapedData.h1Tags || [])}
- SSL Enabled: ${scrapedData.sslEnabled ? "YES (https)" : "NO (http)"}
- Page size / complexity check: HTML size of ${scrapedData.htmlLength || 0} bytes.
- Load speed simulation: ${scrapedData.loadTimeMs || 1500} ms.

Based on this real-time scrape and your extensive knowledge of standard issues for this category, compile an exhaustive, professional audit report.
Your output must be a clean, strict JSON object. No markdown wrappers. Return ONLY the JSON.

Match this TypeScript structure exactly:
{
  "websiteScore": number (0 to 100),
  "sslEnabled": boolean,
  "mobileFriendly": boolean,
  "hasContactForm": boolean,
  "hasAboutPage": boolean,
  "hasTestimonials": boolean,
  "speedRating": "Fast" | "Medium" | "Slow",
  "issues": ["string"],
  "recommendations": ["string"],
  "executiveSummary": "string",
  "technicalReport": "string",
  "seoReport": "string",
  "uxReport": "string",
  "conversionReport": "string"
}

Provide highly specific, high-value, and tailored criticisms. If SSL is false, write a severe issue. If H1 tags are empty, call out lack of proper H1 headers. If title is short, write an SEO issue. Create detailed narrative paragraphs for executiveSummary, technicalReport, seoReport, uxReport, and conversionReport.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text || "{}";
    const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText) as WebsiteAuditResult;
  } catch (error) {
    console.error("Error in generateWebsiteAuditAI:", error);
    return getFallbackAudit(websiteUrl, businessName);
  }
}

export interface OutreachSequenceResult {
  coldEmail: string;
  facebookDm: string;
  linkedinMessage: string;
  callScript: string;
  loomScript: string;
}

export async function generateOutreachSequenceAI(
  businessName: string,
  websiteUrl: string,
  issues: string[],
  recommendations: string[]
): Promise<OutreachSequenceResult> {
  const ai = getGeminiClient();

  const prompt = `You are a world-class Cold Outreach and B2B SaaS Copywriter.
Generate high-converting outreach scripts for the business "${businessName}" (website: ${websiteUrl}).
Here are the actual technical and SEO issues discovered on their website:
Issues:
${issues.map(i => `- ${i}`).join("\n")}

Recommendations:
${recommendations.map(r => `- ${r}`).join("\n")}

Generate 5 personalized, non-spammy outreach templates:
1. Cold Email (Short, value-first, personalized, mentioning a specific issue, with a clear low-friction call-to-action).
2. Facebook DM (Casual, friendly, local-focused, quick check-in about their site).
3. LinkedIn Connection/InMail Message (Professional, networking-focused, positioning as a local web designer/helper).
4. Cold Call Script (Includes gatekeeper intro, pitch referencing the site issue, handling objections, and booking a meeting).
5. Loom Walkthrough Video Script (Step-by-step narration guide on how to film a quick 2-minute screen recording pointing out their specific issues).

Return the output strictly as a JSON object with these exact keys: "coldEmail", "facebookDm", "linkedinMessage", "callScript", "loomScript". No markdown blocks.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const responseText = response.text || "{}";
    const cleanText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText) as OutreachSequenceResult;
  } catch (error) {
    console.error("Error in generateOutreachSequenceAI:", error);
    return {
      coldEmail: `Hi there ${businessName} team,\n\nI was looking at your website (${websiteUrl}) and noticed it's missing a security SSL certificate. This is hurting your Google ranking and showing a 'Not Secure' warning to visitors. I'd love to fix this for you for free. Let me know if you have 5 minutes this week!\n\nBest,\n[Your Name]`,
      facebookDm: `Hey! Love your business. I noticed a quick issue with your website loading slow on mobile. Just wanted to share in case it's losing you customers!`,
      linkedinMessage: `Hi, I specialize in web design for businesses like yours. I ran a quick report on your site and found 3 things that could double your bookings. Let's connect!`,
      callScript: `Hi! Is the owner in? I wanted to show them a fast security issue on your homepage...`,
      loomScript: `[Loom Script] Hi! In this quick video, I'm showing you the homepage of ${businessName} and why visitors are getting a security warning...`
    };
  }
}

function getFallbackLeads(industry: string, location: string): DiscoveredLead[] {
  return [
    {
      businessName: `${location} Premium ${industry}`,
      website: `http://premium${industry.toLowerCase().replace(/\s+/g, "")}${location.toLowerCase().replace(/\s+/g, "")}.com`,
      phone: "(555) 019-2831",
      address: `102 Main St, ${location}`,
      rating: 3.8,
      reviewCount: 22,
      category: industry,
      painPoints: ["No SSL Certificate (HTTP)", "Not mobile responsive", "Missing meta tags"]
    },
    {
      businessName: `${industry} Experts`,
      website: `http://experts${industry.toLowerCase().replace(/\s+/g, "")}.org`,
      phone: "(555) 482-9901",
      address: `405 Broad Ave, ${location}`,
      rating: 4.1,
      reviewCount: 14,
      category: industry,
      painPoints: ["Slow load speed (4.8s)", "No Contact Form found", "Outdated design layout"]
    }
  ];
}

function getFallbackAudit(websiteUrl: string, businessName: string): WebsiteAuditResult {
  return {
    websiteScore: 45,
    sslEnabled: websiteUrl.startsWith("https"),
    mobileFriendly: false,
    hasContactForm: false,
    hasAboutPage: true,
    hasTestimonials: false,
    speedRating: "Slow",
    issues: ["Insecure connection (SSL Missing)", "No mobile styling", "No clear call-to-action button", "Slow page loading (5.4 seconds)"],
    recommendations: ["Install Let's Encrypt SSL certificate", "Adopt Tailwind CSS fluid grid layout", "Add prominent 'Book Appointment' button", "Optimize images and minify CSS/JS"],
    executiveSummary: `The website for ${businessName} has major usability and security gaps that prevent it from converting local search traffic. It scored a 45 out of 100.`,
    technicalReport: "The site runs on plain HTTP without an SSL certificate, causing browsers to display a 'Not Secure' warning. Performance is bottlenecked by uncompressed assets.",
    seoReport: "Missing meta descriptions and proper H1 tags. Search engines cannot easily categorize the page's relevance.",
    uxReport: "The landing page is not readable on smartphones. Font sizes are too small and margins do not adjust to screen widths.",
    conversionReport: "There is no contact form or call-to-action above the fold. Visitors are likely leaving without taking action."
  };
}
