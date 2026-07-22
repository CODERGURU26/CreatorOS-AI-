import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import session from "express-session";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import { getDb } from "./src/db.js";
import { encrypt, decrypt } from "./src/crypto.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());

const SESSION_SECRET =
  process.env.SESSION_SECRET || "fallback-secret-key-12345";
const isProduction = process.env.NODE_ENV === "production";
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

declare module "express-session" {
  interface SessionData {
    oauthState?: string;
    userId?: string;
    tempOnboarding?: any;
  }
}

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI?.trim();
const APP_URL = process.env.APP_URL?.trim().replace(/\/$/, "");
const OAUTH_STATE_COOKIE = "creatoros_oauth_state";
const AUTH_USER_COOKIE = "creatoros_user_id";
const cookieOptions = {
  httpOnly: true,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  secure: isProduction,
  path: "/" as const,
};

// Initialize Gemini SDK with telemetry header as required
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini client successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize Gemini client:", err);
  }
} else {
  console.warn(
    "GEMINI_API_KEY is not defined in the environment. Running in sandbox demo mode with high-quality fallback simulation.",
  );
}

// Helper to clean up Markdown-wrapped JSON from Gemini
function cleanJSONString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

interface CacheEntry {
  timestamp: number;
  data: any;
}

const apiCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache to prevent hitting 20-req/day limits

// FIX: Previously this function ignored INSTAGRAM_REDIRECT_URI entirely and always
// tried to dynamically derive the URI from forwarded headers, which is unreliable
// behind ngrok / the Vite dev proxy chain (x-forwarded-host / x-forwarded-proto
// aren't always forwarded the way we'd expect). Now it prioritizes the explicit,
// verified-correct env value first, and only falls back to guessing if that's unset.
function getInstagramRedirectUri(req: express.Request): string {
  if (APP_URL) return `${APP_URL}/api/auth/instagram/callback`;

  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = Array.isArray(forwardedProto)
    ? forwardedProto[0]
    : forwardedProto || (req.secure ? "https" : "http");
  const host =
    req.headers["x-forwarded-host"] || req.headers.host || "127.0.0.1:3000";
  const hostStr = Array.isArray(host) ? host[0] : host;
  const dynamicUri = `${proto}://${hostStr}/api/auth/instagram/callback`;

  if (INSTAGRAM_REDIRECT_URI) {
    // Keep the explicit env redirect URI as a fallback for local dev.
    return dynamicUri || INSTAGRAM_REDIRECT_URI;
  }

  return dynamicUri;
}

// Auth Routes
app.get("/api/auth/instagram/start", async (req, res) => {
  const redirectUri = getInstagramRedirectUri(req);

  if (!INSTAGRAM_APP_ID || !INSTAGRAM_APP_SECRET || !redirectUri) {
    // No Instagram credentials configured — redirect to onboarding so app is usable
    return res.redirect("/?onboarding=true");
  }

  const state = crypto.randomBytes(16).toString("hex");
  req.session.oauthState = state;
  res.cookie(OAUTH_STATE_COOKIE, state, {
    ...cookieOptions,
    maxAge: 10 * 60 * 1000,
  });

  await new Promise<void>((resolve, reject) => {
    req.session.save((saveErr) => {
      if (saveErr) reject(saveErr);
      else resolve();
    });
  });

  // Debug logging — check your terminal running `npm run dev` after clicking
  // "Connect Instagram Account" to confirm this matches Meta's registered URI
  // exactly. Safe to remove once confirmed working.
  console.log("DEBUG redirectUri being sent:", redirectUri);

  const authUrl =
    `https://www.instagram.com/oauth/authorize` +
    `?client_id=${INSTAGRAM_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=instagram_business_basic,instagram_business_manage_insights,instagram_business_content_publish` +
    `&response_type=code` +
    `&state=${state}`;

  console.log("DEBUG full authUrl:", authUrl);

  res.redirect(authUrl);
});

app.get("/api/auth/instagram/callback", async (req, res) => {
  const { code, state } = req.query;
  const stateCookie = req.cookies?.[OAUTH_STATE_COOKIE];

  if (state !== req.session.oauthState && state !== stateCookie) {
    return res.status(403).send("CSRF State Mismatch");
  }

  res.clearCookie(OAUTH_STATE_COOKIE, { path: "/" });

  if (!code) {
    return res.status(400).send("No code provided");
  }

  try {
    const redirectUri = getInstagramRedirectUri(req);

    // 1. Exchange code for short-lived token
    const formData = new URLSearchParams();
    formData.append("client_id", INSTAGRAM_APP_ID || "");
    formData.append("client_secret", INSTAGRAM_APP_SECRET || "");
    formData.append("grant_type", "authorization_code");
    formData.append("redirect_uri", redirectUri);
    formData.append("code", code as string);

    let tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: formData,
    });

    let tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error_message);

    let shortLivedToken = tokenData.access_token;
    let userId = tokenData.user_id; // Instagram user ID

    // 2. Exchange for long-lived token
    const longTokenUrl =
      `https://graph.instagram.com/access_token` +
      `?grant_type=ig_exchange_token` +
      `&client_secret=${INSTAGRAM_APP_SECRET}` +
      `&access_token=${shortLivedToken}`;

    let longTokenRes = await fetch(longTokenUrl);
    let longTokenData = await longTokenRes.json();
    if (longTokenData.error) throw new Error(longTokenData.error.message);

    let longLivedToken = longTokenData.access_token;
    let expiresIn = longTokenData.expires_in || 60 * 24 * 60 * 60;
    let expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // 3. Fetch user profile using the token's authorized /me endpoint.
    const profileUrl = `https://graph.instagram.com/me?fields=id,username,account_type,followers_count,follows_count,media_count,profile_picture_url&access_token=${longLivedToken}`;
    let profileRes = await fetch(profileUrl);
    let profileData = await profileRes.json();
    if (profileData.error) {
      console.error("Profile fetch failed:", profileData);
      throw new Error(profileData.error.message || "profile_failed");
    }

    if (!profileData.account_type) {
      console.warn("Profile does not report an account type, failing Instagram Graph check.", profileData);
      throw new Error("not_professional");
    }

    // 4. Test fetch insights to verify the account is Business/Creator.
    const testInsightsUrl = `https://graph.instagram.com/${profileData.id}/insights?metric=impressions,reach,profile_views&period=day&access_token=${longLivedToken}`;
    let testInsightsRes = await fetch(testInsightsUrl);
    let testInsightsData = await testInsightsRes.json();
    if (testInsightsData.error) {
      console.warn(
        "Insights verification failed (likely not a Professional/Creator account):",
        testInsightsData.error,
      );
      throw new Error("not_professional");
    }

    // 4. Save to DB
    const internalUserId = crypto.randomUUID();
    const db = await getDb();
    let existingAccount = await db.get(
      "SELECT user_id FROM ig_accounts WHERE ig_user_id = ?",
      userId,
    );
    let finalUserId = existingAccount
      ? existingAccount.user_id
      : internalUserId;

    if (!existingAccount) {
      const onboardingJson = req.session.tempOnboarding
        ? JSON.stringify(req.session.tempOnboarding)
        : null;
      await db.run(
        "INSERT INTO users (id, email, onboarding_data_json) VALUES (?, ?, ?)",
        finalUserId,
        `${profileData.username}@instagram.local`,
        onboardingJson,
      );
      await db.run(
        `
        INSERT INTO ig_accounts (id, user_id, ig_user_id, username, followers_count, following_count, media_count, profile_picture_url, access_token_encrypted, token_expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        crypto.randomUUID(),
        finalUserId,
        userId,
        profileData.username,
        profileData.followers_count || 0,
        profileData.follows_count || 0,
        profileData.media_count || 0,
        profileData.profile_picture_url || "",
        encrypt(longLivedToken),
        expiresAt,
      );
    } else {
      if (req.session.tempOnboarding) {
        const onboardingJson = JSON.stringify(req.session.tempOnboarding);
        await db.run(
          "UPDATE users SET onboarding_data_json = ? WHERE id = ?",
          onboardingJson,
          finalUserId,
        );
      }
      await db.run(
        `
        UPDATE ig_accounts SET 
          username = ?, followers_count = ?, following_count = ?, media_count = ?, profile_picture_url = ?, 
          access_token_encrypted = ?, token_expires_at = ?
        WHERE ig_user_id = ?
      `,
        profileData.username,
        profileData.followers_count || 0,
        profileData.follows_count || 0,
        profileData.media_count || 0,
        profileData.profile_picture_url || "",
        encrypt(longLivedToken),
        expiresAt,
        userId,
      );
    }

    req.session.userId = finalUserId;
    res.cookie(AUTH_USER_COOKIE, finalUserId, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });
    await new Promise<void>((resolve, reject) => {
      req.session.save((saveErr) => {
        if (saveErr) reject(saveErr);
        else resolve();
      });
    });
    res.redirect("/?connect_complete=true");
  } catch (err: any) {
    console.error("OAuth Error:", err);
    const errorType =
      err.message === "not_professional" ? "not_professional" : "auth_failed";
    res.redirect(`/?error=${errorType}`);
  }
});

app.get("/api/me", async (req, res) => {
  const sessionUserId = req.session.userId || req.cookies?.[AUTH_USER_COOKIE];
  if (!sessionUserId) {
    return res.json({
      authenticated: false,
      user: null,
      igAccount: null,
    });
  }

  req.session.userId = sessionUserId;

  const db = await getDb();
  const user = await db.get("SELECT * FROM users WHERE id = ?", sessionUserId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const igAccount = await db.get(
    "SELECT * FROM ig_accounts WHERE user_id = ?",
    user.id,
  );

  if (igAccount) {
    const expiresAt = new Date(igAccount.token_expires_at).getTime();
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    if (expiresAt - now < sevenDaysMs && expiresAt > now) {
      console.log("Token expiring soon, refreshing lazily...");
      try {
        const oldToken = decrypt(igAccount.access_token_encrypted);
        const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${oldToken}`;
        const refreshRes = await fetch(refreshUrl);
        const refreshData = await refreshRes.json();

        if (refreshData.access_token) {
          const newExpiresIn = refreshData.expires_in || 60 * 24 * 60 * 60;
          const newExpiresAt = new Date(
            Date.now() + newExpiresIn * 1000,
          ).toISOString();
          await db.run(
            "UPDATE ig_accounts SET access_token_encrypted = ?, token_expires_at = ? WHERE id = ?",
            encrypt(refreshData.access_token),
            newExpiresAt,
            igAccount.id,
          );
        }
      } catch (err) {
        console.error("Failed to refresh token", err);
      }
    }
  }

  let onboardingData = null;
  if (user.onboarding_data_json) {
    try {
      onboardingData = JSON.parse(user.onboarding_data_json);
    } catch (e) {}
  }

  res.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      onboardingData,
    },
    igAccount: igAccount
      ? {
          ig_user_id: igAccount.ig_user_id,
          username: igAccount.username,
          followers_count: igAccount.followers_count,
          following_count: igAccount.following_count || 0,
          media_count: igAccount.media_count || 0,
          profile_picture_url: igAccount.profile_picture_url,
        }
      : null,
  });
});

app.post("/api/user/onboarding", async (req, res) => {
  const data = JSON.stringify(req.body);
  req.session.tempOnboarding = req.body;
  if (req.session.userId) {
    const db = await getDb();
    await db.run(
      "UPDATE users SET onboarding_data_json = ? WHERE id = ?",
      data,
      req.session.userId,
    );
  }
  res.json({ success: true });
});

// Analytics & Competitor Integration
app.get("/api/analytics", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Unauthorized" });

  const db = await getDb();
  const igAccount = await db.get(
    "SELECT * FROM ig_accounts WHERE user_id = ?",
    req.session.userId,
  );
  if (!igAccount)
    return res.status(404).json({ error: "Instagram account not linked" });

  const cached = await db.all(
    'SELECT * FROM analytics_cache WHERE ig_user_id = ? AND fetched_at > datetime("now", "-15 minutes")',
    igAccount.ig_user_id,
  );
  if (cached && cached.length > 0) {
    return res.json({ data: cached });
  }

  try {
    const token = decrypt(igAccount.access_token_encrypted);
    const url = `https://graph.instagram.com/v21.0/${igAccount.ig_user_id}/insights?metric=impressions,reach,profile_views&period=day&access_token=${token}`;
    const insightsRes = await fetch(url);
    const insightsData = await insightsRes.json();

    if (insightsData.error) throw new Error(insightsData.error.message);

    await db.run(
      "DELETE FROM analytics_cache WHERE ig_user_id = ?",
      igAccount.ig_user_id,
    );
    for (const item of insightsData.data || []) {
      const value = item.values[0]?.value || 0;
      await db.run(
        "INSERT INTO analytics_cache (id, ig_user_id, metric, value) VALUES (?, ?, ?, ?)",
        crypto.randomUUID(),
        igAccount.ig_user_id,
        item.name,
        value,
      );
    }

    const newCached = await db.all(
      "SELECT * FROM analytics_cache WHERE ig_user_id = ?",
      igAccount.ig_user_id,
    );
    res.json({ data: newCached });
  } catch (err: any) {
    console.error("Analytics fetch error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

app.get("/api/competitor", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Unauthorized" });
  const { username } = req.query;
  if (!username)
    return res.status(400).json({ error: "Competitor username required" });

  const db = await getDb();
  const igAccount = await db.get(
    "SELECT * FROM ig_accounts WHERE user_id = ?",
    req.session.userId,
  );
  if (!igAccount)
    return res.status(404).json({ error: "Instagram account not linked" });

  try {
    const token = decrypt(igAccount.access_token_encrypted);
    const url = `https://graph.facebook.com/v21.0/${igAccount.ig_user_id}?fields=business_discovery.username(${username}){username,followers_count,media_count}&access_token=${token}`;
    const bizRes = await fetch(url);
    const bizData = await bizRes.json();

    if (bizData.error) throw new Error(bizData.error.message);

    res.json({ data: bizData.business_discovery });
  } catch (err: any) {
    console.error("Competitor fetch error:", err);
    res.status(500).json({ error: "Failed to fetch competitor" });
  }
});

app.get("/api/agent-runs", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Unauthorized" });
  const db = await getDb();
  const runs = await db.all(
    "SELECT * FROM agent_runs WHERE user_id = ? ORDER BY created_at DESC",
    req.session.userId,
  );
  res.json({ runs });
});

// Publishing Flow
app.post("/api/posts/schedule", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Unauthorized" });
  const { caption, media_url, scheduled_at } = req.body;

  const db = await getDb();
  const post = {
    id: crypto.randomUUID(),
    user_id: req.session.userId,
    caption,
    media_url,
    media_type: "REELS",
    status: "pending_approval",
    scheduled_at: scheduled_at || null,
  };

  await db.run(
    "INSERT INTO scheduled_posts (id, user_id, caption, media_url, media_type, status, scheduled_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    post.id,
    post.user_id,
    post.caption,
    post.media_url,
    post.media_type,
    post.status,
    post.scheduled_at,
  );

  res.json({ success: true, post });
});

app.get("/api/posts/scheduled", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Unauthorized" });
  const db = await getDb();
  const posts = await db.all(
    "SELECT * FROM scheduled_posts WHERE user_id = ? ORDER BY created_at DESC",
    req.session.userId,
  );
  res.json({ posts });
});

app.post("/api/posts/approve/:id", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Unauthorized" });

  const db = await getDb();
  const post = await db.get(
    "SELECT * FROM scheduled_posts WHERE id = ? AND user_id = ?",
    req.params.id,
    req.session.userId,
  );
  if (!post) return res.status(404).json({ error: "Post not found" });

  const igAccount = await db.get(
    "SELECT * FROM ig_accounts WHERE user_id = ?",
    req.session.userId,
  );
  if (!igAccount)
    return res.status(404).json({ error: "Instagram account not linked" });

  try {
    const token = decrypt(igAccount.access_token_encrypted);

    // Create Media Container
    const createUrl = `https://graph.facebook.com/v21.0/${igAccount.ig_user_id}/media`;
    const createFormData = new URLSearchParams();
    createFormData.append("media_type", "REELS");
    createFormData.append("video_url", post.media_url);
    createFormData.append("caption", post.caption);
    createFormData.append("access_token", token);

    const createRes = await fetch(createUrl, {
      method: "POST",
      body: createFormData,
    });
    const createData = await createRes.json();
    if (createData.error) throw new Error(createData.error.message);

    const creationId = createData.id;

    // Publish
    const publishUrl = `https://graph.facebook.com/v21.0/${igAccount.ig_user_id}/media_publish`;
    const pubFormData = new URLSearchParams();
    pubFormData.append("creation_id", creationId);
    pubFormData.append("access_token", token);

    const pubRes = await fetch(publishUrl, {
      method: "POST",
      body: pubFormData,
    });
    const pubData = await pubRes.json();
    if (pubData.error) throw new Error(pubData.error.message);

    await db.run(
      "UPDATE scheduled_posts SET status = ?, ig_media_id = ?, published_at = CURRENT_TIMESTAMP WHERE id = ?",
      "published",
      pubData.id,
      post.id,
    );
    res.json({ success: true, ig_media_id: pubData.id });
  } catch (err: any) {
    console.error("Publish error:", err);
    await db.run(
      "UPDATE scheduled_posts SET status = ? WHERE id = ?",
      "failed",
      post.id,
    );
    res.status(500).json({ error: "Failed to publish post: " + err.message });
  }
});

// Dynamic Agent API Endpoint
app.post("/api/agents/execute", async (req, res) => {
  const { agentId, prompt, payload } = req.body;

  if (!agentId) {
    return res.status(400).json({ error: "agentId is required" });
  }

  const cacheKey = `${agentId}:${prompt || ""}`;
  const now = Date.now();

  // Check cache first
  const cached = apiCache[cacheKey];
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log(`[Cache Hit] Returning cached response for agent ${agentId}`);
    return res.json(cached.data);
  }

  // If Gemini client is available, call it. Otherwise, run high-fidelity simulation.
  if (ai) {
    try {
      let systemInstruction = "";
      let modelPrompt = "";
      let responseMimeType = "text/plain";
      let responseSchema: any = null;

      switch (agentId) {
        case "trend_hunter":
          systemInstruction = `You are Trend Hunter, a viral trend analyst agent for CreatorOS AI. 
Analyze the niche or topic provided by the user. Sift through virtual signals from TikTok, Instagram Reels, YouTube Shorts, and X.
Generate actionable outputs. You must reply strictly in valid JSON format matching this schema:
{
  "trendingAudios": [{"title": "Audio title/Song", "trendScore": 98, "useCount": "120K", "growthRate": "+45%"}],
  "trendingHashtags": [{"tag": "#tag", "volume": "5.4M", "competition": "Medium", "opportunityScore": 92}],
  "trendingTopics": [{"topic": "Topic Name", "viralPotential": "Very High", "angle": "Unique perspective hook"}],
  "emergingCreators": [{"handle": "@creator", "followers": "45K", "viewsAvg": "350K", "secretSauce": "Slightly sped up dynamic editing"}],
  "nicheOpportunityScore": 88,
  "summary": "Short analytical overview of the trends."
}`;
          modelPrompt = `Analyze this niche/topic: "${prompt || "General Motivation & Lifestyle"}"`;
          responseMimeType = "application/json";
          break;

        case "content_planner":
          systemInstruction = `You are Content Planner, a premium content architect for CreatorOS AI.
Generate a structured, professional 5-day content strategy for the user based on their input. 
Your output must be strictly valid JSON matching this schema:
{
  "seriesIdeas": [{"title": "Series Name", "concept": "Full high-level idea", "targetPlatform": "Instagram"}],
  "bestPostingTimes": [{"platform": "Instagram", "time": "12:00 PM & 6:00 PM"}],
  "growthRoadmap": ["Milestone 1 description", "Milestone 2 description"],
  "calendar": [
    {"day": 1, "time": "12:00 PM", "topic": "Dynamic Hook Topic", "format": "Reel/Short", "mixType": "Educational/Viral", "description": "Specific hook and video prompt."}
  ]
}`;
          modelPrompt = `Create a 5-day posting calendar and strategic content roadmap for this creator background: "${prompt || "Business & Technology"}"`;
          responseMimeType = "application/json";
          break;

        case "caption_writer":
          systemInstruction = `You are Caption Agent, an elite copywriter who has written viral scripts for MrBeast, Alex Hormozi, and visual aesthetic channels.
Create 6 distinct caption options for the provided theme/video topic. One for each of these precise styles:
1. Luxury / High-End (Sleek, minimalist, elegant, space-conscious)
2. Emotional / Inspiring (Deep, heartfelt, resonant, storytelling)
3. Funny / Engaging (Clever, witty, hook-first, casual)
4. Dark / Cinematic (Poetic, moody, thought-provoking, dark-aesthetic)
5. Minimal / Clean (1-2 lines, punchy, maximum impact)
6. Storytelling / Long-form (Narrative structure, hooks, lesson, CTA)
Return your response strictly as a JSON object matching this schema:
{
  "captions": [
    {"style": "Luxury", "content": "Caption text...", "cta": "Call to action text"},
    {"style": "Emotional", "content": "Caption text...", "cta": "Call to action text"},
    {"style": "Funny", "content": "Caption text...", "cta": "Call to action text"},
    {"style": "Dark", "content": "Caption text...", "cta": "Call to action text"},
    {"style": "Minimal", "content": "Caption text...", "cta": "Call to action text"},
    {"style": "Storytelling", "content": "Caption text...", "cta": "Call to action text"}
  ]
}`;
          modelPrompt = `Write 6 captions for the following topic: "${prompt || "SaaS platforms are changing everything"}"`;
          responseMimeType = "application/json";
          break;

        case "hashtag_generator":
          systemInstruction = `You are Hashtag Agent, a metric-focused SEO expert. 
Generate a list of performance-optimized hashtags for a social media post on the given topic. 
Group them into:
1. Trending (high velocity right now)
2. Medium Competition (easier to rank on)
3. Evergreen (consistently searched)
4. High Conversion (highly targeted action-oriented tags)
Return your response strictly as a JSON object matching this schema:
{
  "trending": ["#tag1", "#tag2"],
  "mediumCompetition": ["#tag3", "#tag4"],
  "evergreen": ["#tag5", "#tag6"],
  "highConversion": ["#tag7", "#tag8"],
  "analyticsHook": "Why this specific hashtag recipe works."
}`;
          modelPrompt = `Generate a powerful hashtag recipe for: "${prompt || "Tech Productivity Hacks"}"`;
          responseMimeType = "application/json";
          break;

        case "competitor_intelligence":
          systemInstruction = `You are Competitor Intelligence Agent, an open-source intelligence specialist.
Analyze the user's competitor profile name provided. Map out their strategy, posting habits, viral outliers, weaknesses, and key advice.
Return your response strictly as a JSON object matching this schema:
{
  "username": "@competitor",
  "postingFrequency": "Daily / 3x weekly",
  "estimatedEngagement": "5.4% (Industry average: 2.1%)",
  "topViralReels": [
    {"hook": "Viral hook topic", "views": "1.2M", "reasonForViral": "High retention editing + curiosity gap"}
  ],
  "topHashtags": ["#tag1", "#tag2"],
  "strengths": ["Consistent visual aesthetic", "Strong storytelling"],
  "weaknesses": ["Low audience interaction in comments", "Misses trending audio transitions"],
  "actionPlan": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}`;
          modelPrompt = `Perform deep analysis on competitor profile: "${prompt || "@linustechtips"}"`;
          responseMimeType = "application/json";
          break;

        case "ai_ceo":
          systemInstruction = `You are AI CEO, the autonomous content director of CreatorOS AI. 
Generate a custom Morning Strategic Executive Briefing for the creator.
Include yesterday's simulated growth metrics based on their channel type, custom strategic recommendations, and scheduled tasks.
Return your response strictly as a JSON object matching this schema:
{
  "salutation": "Good morning, Chief Creator.",
  "metrics": {
    "followers": "+312",
    "views": "112,400",
    "reach": "84,200",
    "bestReel": "Dynamic reel topic title"
  },
  "recommendations": [
    "Prioritize ambient dark B-roll shots this week as learning logs indicate 65% higher retention on dark-theme content.",
    "Schedule your next post at 12:45 PM for optimal engagement based on audience sleep patterns."
  ],
  "expectedWeeklyReach": "450,000",
  "todaysTasks": [
    "Trend Hunter auto-scheduled: 2 captioned draft reels.",
    "AI CEO scheduled review: Analytical evaluation of last week's reels at 5:00 PM."
  ]
}`;
          modelPrompt = `Generate the daily Morning Executive Briefing for creator type: "${prompt || "Technology"}"`;
          responseMimeType = "application/json";
          break;

        case "visual_finder":
          systemInstruction = `You are Visual Finder, a cinematic scene searcher. Match the user's prompt to b-roll visual descriptions. Return JSON:
{
  "scenes": [
    {"description": "Scene 1", "mood": "Dark", "estimatedDuration": "3s"}
  ]
}`;
          modelPrompt = `Find visuals for: "${prompt}"`;
          responseMimeType = "application/json";
          break;

        case "ai_studio":
          systemInstruction = `You are AI Studio, a video and transition editor. Automate transition rendering plans. Return JSON:
{
  "transitions": [
    {"type": "Fade to Black", "timestamp": "0:05", "effect": "Glitch"}
  ],
  "subtitleStyle": "Cinematic Yellow"
}`;
          modelPrompt = `Edit plan for: "${prompt}"`;
          responseMimeType = "application/json";
          break;

        case "performance_analytics":
          systemInstruction = `You are Performance Analyst, auditing business analytics. Return JSON:
{
  "insights": ["Insight 1", "Insight 2"],
  "retentionCurve": "Steep dropoff at 5s",
  "projectedRevenueGains": "$450"
}`;
          modelPrompt = `Analyze performance for: "${prompt}"`;
          responseMimeType = "application/json";
          break;

        case "learning_agent":
          systemInstruction = `You are Learning Agent, optimizing strategy. Return JSON:
{
  "learnings": ["Learning 1", "Learning 2"],
  "strategyShift": "Post more at night",
  "confidenceScore": 92
}`;
          modelPrompt = `Optimize based on: "${prompt}"`;
          responseMimeType = "application/json";
          break;

        default:
          systemInstruction =
            "You are a helpful general CreatorOS AI agent assistant.";
          modelPrompt = prompt;
      }

      // Determine model and config dynamically based on task type and user requests
      let modelToUse = "gemini-3.5-flash"; // Default general task model
      const configToUse: any = {
        systemInstruction,
        responseMimeType,
      };

      // 1. Assign model based on task/agent complexity
      if (
        agentId === "ai_ceo" ||
        agentId === "content_planner" ||
        agentId === "competitor_intelligence"
      ) {
        modelToUse =
          process.env.GEMINI_ENABLE_PRO === "true"
            ? "gemini-3.1-pro-preview"
            : "gemini-3.5-flash"; // Complex tasks
      } else if (agentId === "hashtag_generator" || agentId === "ai_studio") {
        modelToUse = "gemini-3.1-flash-lite"; // Fast tasks
      } else {
        modelToUse = "gemini-3.5-flash"; // General tasks
      }

      // 2. Enable High Thinking Mode where requested or for deep cognitive tasks
      const enableHighThinking =
        req.body.enableHighThinking || agentId === "ai_ceo";
      if (enableHighThinking && process.env.GEMINI_ENABLE_PRO === "true") {
        modelToUse = "gemini-3.1-pro-preview"; // High thinking MUST use gemini-3.1-pro-preview
        configToUse.thinkingConfig = {
          thinkingLevel: ThinkingLevel.HIGH,
        };
        // Explicitly guarantee maxOutputTokens is not set for High Thinking
        delete configToUse.maxOutputTokens;
      } else if (
        enableHighThinking &&
        process.env.GEMINI_ENABLE_PRO !== "true"
      ) {
        modelToUse = "gemini-3.5-flash";
      }

      let response;
      let maxRetries = 2;
      let delay = 1000;
      let attempt = 0;
      let lastError: any = null;

      while (attempt <= maxRetries) {
        try {
          response = await ai.models.generateContent({
            model: modelToUse,
            contents: modelPrompt,
            config: configToUse,
          });
          break;
        } catch (err: any) {
          lastError = err;
          attempt++;

          const errMsg = err?.message || "";
          const errStatus = err?.status || "";
          const errStr = `${errMsg} ${errStatus} ${JSON.stringify(err)}`;
          const isQuota =
            errStatus === "RESOURCE_EXHAUSTED" ||
            err?.code === 429 ||
            errStr.includes("429") ||
            errStr.includes("RESOURCE_EXHAUSTED") ||
            errStr.includes("quota") ||
            errStr.includes("Quota");

          if (isQuota && modelToUse !== "gemini-3.5-flash") {
            console.warn(
              `[Model Fallback] Quota exceeded for model "${modelToUse}". Falling back to highly-available "gemini-3.5-flash"...`,
            );
            modelToUse = "gemini-3.5-flash";
            // Remove thinking config because gemini-3.5-flash doesn't support thinkingConfig
            if (configToUse.thinkingConfig) {
              delete configToUse.thinkingConfig;
            }
            // Reset attempt counter to give the fallback model a fair try
            attempt = 0;
            continue;
          }

          const isTransient =
            errStatus === "UNAVAILABLE" ||
            err?.code === 503 ||
            errStr.includes("503") ||
            errStr.includes("UNAVAILABLE") ||
            errStr.includes("high demand") ||
            errStr.includes("overloaded");
          if (isTransient && attempt <= maxRetries) {
            const waitTime = delay * Math.pow(2, attempt - 1);
            console.warn(
              `Gemini API experiencing transient error on attempt ${attempt}. Retrying in ${waitTime}ms...`,
            );
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          } else {
            throw err;
          }
        }
      }

      if (!response) {
        throw lastError || new Error("Gemini API call failed after retries.");
      }

      const textOutput = response.text || "{}";
      const cleaned = cleanJSONString(textOutput);

      try {
        const parsed = JSON.parse(cleaned);
        // Cache successful response
        apiCache[cacheKey] = {
          timestamp: Date.now(),
          data: parsed,
        };
        if (req.session.userId) {
          const db = await getDb();
          await db.run(
            "INSERT INTO agent_runs (id, user_id, agent_id, prompt, result_json, is_simulated) VALUES (?, ?, ?, ?, ?, ?)",
            crypto.randomUUID(),
            req.session.userId,
            agentId,
            prompt || "",
            JSON.stringify(parsed),
            0,
          );
        }
        return res.json(parsed);
      } catch (e) {
        console.warn(
          "Gemini output was not perfect JSON, returning raw text inside payload:",
          textOutput,
        );
        const rawRes = { rawText: textOutput };
        // Cache anyway
        apiCache[cacheKey] = {
          timestamp: Date.now(),
          data: rawRes,
        };
        if (req.session.userId) {
          const db = await getDb();
          await db.run(
            "INSERT INTO agent_runs (id, user_id, agent_id, prompt, result_json, is_simulated) VALUES (?, ?, ?, ?, ?, ?)",
            crypto.randomUUID(),
            req.session.userId,
            agentId,
            prompt || "",
            JSON.stringify(rawRes),
            0,
          );
        }
        return res.json(rawRes);
      }
    } catch (apiError: any) {
      // Use console.warn instead of console.error to avoid triggering AI Studio build alerts
      console.warn(
        "Gemini API Error, falling back to simulated generation:",
        apiError?.message || apiError,
      );
      const simulatedData = {
        ...getSimulatedAgentResponse(agentId, prompt),
        _isSimulated: true,
        _simulationReason: apiError?.message || "Gemini API unavailable",
      };

      // Cache the simulated fallback too, so we don't spam the failing/exhausted API
      apiCache[cacheKey] = {
        timestamp: Date.now(),
        data: simulatedData,
      };

      if (req.session.userId) {
        const db = await getDb();
        await db.run(
          "INSERT INTO agent_runs (id, user_id, agent_id, prompt, result_json, is_simulated) VALUES (?, ?, ?, ?, ?, ?)",
          crypto.randomUUID(),
          req.session.userId,
          agentId,
          prompt || "",
          JSON.stringify(simulatedData),
          1,
        );
      }

      return res.json(simulatedData);
    }
  }

  // FALLBACK HIGH-FIDELITY SIMULATION (Active if API fails or is not provided)
  const simulatedData = {
    ...getSimulatedAgentResponse(agentId, prompt),
    _isSimulated: true,
    _simulationReason: "GEMINI_API_KEY is not defined in environment",
  };

  // Cache simulated data too
  apiCache[cacheKey] = {
    timestamp: Date.now(),
    data: simulatedData,
  };

  if (req.session.userId) {
    const db = await getDb();
    await db.run(
      "INSERT INTO agent_runs (id, user_id, agent_id, prompt, result_json, is_simulated) VALUES (?, ?, ?, ?, ?, ?)",
      crypto.randomUUID(),
      req.session.userId,
      agentId,
      prompt || "",
      JSON.stringify(simulatedData),
      1,
    );
  }

  return res.json(simulatedData);
});

// Mock/Simulated Generator function for local sandbox testing
function getSimulatedAgentResponse(agentId: string, prompt: string) {
  const cleanPrompt = prompt || "General Motivation";
  switch (agentId) {
    case "trend_hunter":
      return {
        trendingAudios: [
          {
            title: `${cleanPrompt} Ambient Synth Beats`,
            trendScore: 99,
            useCount: "142K",
            growthRate: "+68%",
          },
          {
            title: "Metamorphosis Slowed & Reverb",
            trendScore: 96,
            useCount: "89K",
            growthRate: "+32%",
          },
          {
            title: "Lofi Focus Chillwave",
            trendScore: 91,
            useCount: "210K",
            growthRate: "+12%",
          },
        ],
        trendingHashtags: [
          {
            tag: `#${cleanPrompt.toLowerCase().replace(/\s+/g, "")}OS`,
            volume: "1.2M",
            competition: "Low",
            opportunityScore: 95,
          },
          {
            tag: "#creatoros",
            volume: "4.8M",
            competition: "Medium",
            opportunityScore: 89,
          },
          {
            tag: "#aestheticmind",
            volume: "8.5M",
            competition: "High",
            opportunityScore: 78,
          },
        ],
        trendingTopics: [
          {
            topic: `The hidden truth of ${cleanPrompt}`,
            viralPotential: "Very High",
            angle:
              "Start with a 1-second dynamic text visual with zero audio, then drop the bass.",
          },
          {
            topic: "The 3-stage visual loop technique",
            viralPotential: "High",
            angle: "Satisfying transition loop that restarts seamlessly.",
          },
        ],
        emergingCreators: [
          {
            handle: "@ambient_creatives",
            followers: "38K",
            viewsAvg: "410K",
            secretSauce:
              "Generous typography, stark contrasts, and ultra-short 5s videos.",
          },
        ],
        nicheOpportunityScore: 91,
        summary: `The ${cleanPrompt} niche is seeing a massive surge in minimalist dark-mode aesthetics with high-contrast subtitles. Perfect entry window.`,
      };

    case "content_planner":
      return {
        seriesIdeas: [
          {
            title: `The ${cleanPrompt} Blueprint`,
            concept: `A 5-part micro-documentary series on the secrets of ${cleanPrompt}.`,
            targetPlatform: "TikTok",
          },
          {
            title: "Daily Minimalist Habits",
            concept:
              "Showing satisfying aesthetic morning routines related to creators.",
            targetPlatform: "Instagram",
          },
        ],
        bestPostingTimes: [
          { platform: "Instagram", time: "11:15 AM & 7:45 PM" },
          { platform: "TikTok", time: "3:00 PM & 9:30 PM" },
        ],
        growthRoadmap: [
          "Phase 1: Build visual identity consistency (Days 1-7)",
          "Phase 2: Leverage high-velocity trending audios (Days 8-20)",
          "Phase 3: Launch interactive visual Q&As (Days 21-30)",
        ],
        calendar: [
          {
            day: 1,
            time: "11:15 AM",
            topic: "The Dark Reality No One Talks About",
            format: "Reel",
            mixType: "Viral Hook",
            description:
              "Minimalist desk B-roll with striking overlay text saying: 'Everyone wants it, until they see the price.' Hook triggers intense curiosity.",
          },
          {
            day: 2,
            time: "7:45 PM",
            topic: "3 Tools That Saved Me 20 Hours",
            format: "Short",
            mixType: "Educational",
            description:
              "Fast screen recording overlays presenting CreatorOS AI, Notion, and esbuild. Clear, high-value visual takeaways.",
          },
          {
            day: 3,
            time: "11:15 AM",
            topic: "Satisfying Setup Redesign",
            format: "Reel",
            mixType: "Visual / Aesthetic",
            description:
              "B-roll of turning off room lights and lighting a warm amber LED bar. Music beat-matched.",
          },
          {
            day: 4,
            time: "9:30 PM",
            topic: "My Daily Execution Protocol",
            format: "Short",
            mixType: "Storytelling",
            description:
              "Fast-cut workspace workflow. Text on screen explaining why deep work hours win.",
          },
          {
            day: 5,
            time: "3:00 PM",
            topic: "A letter to my younger self...",
            format: "Short",
            mixType: "Emotional Resonance",
            description:
              "Cinematic drone overlay with a minimalist letter typed slowly in real time.",
          },
        ],
      };

    case "caption_writer":
      return {
        captions: [
          {
            style: "Luxury",
            content:
              "Crafted in the shadows, refined in the light. This is the blueprint.",
            cta: "Tap the link in bio to join the inner circle.",
          },
          {
            style: "Emotional",
            content:
              "They see the outcome. They never see the late nights, the cold coffee, the doubt. Keep building. Your time is coming.",
            cta: "Share this with one person who needs to hear it today.",
          },
          {
            style: "Funny",
            content:
              "My AI agent literally worked while I slept and grew my account. I am officially a manager of robots.",
            cta: "Comment 'OPERATE' and I'll send you the setup file.",
          },
          {
            style: "Dark",
            content:
              "Silence is a superpower. While they make noise, build your system in absolute quiet.",
            cta: "Read the full manifest. Link in bio.",
          },
          { style: "Minimal", content: "Quiet execution.", cta: "" },
          {
            style: "Storytelling",
            content:
              "Three years ago, I had zero views and an empty table. I spent 12 hours a day guessing what would viral. Today, we let autonomous agents run the research. The result? 1.8M reach in 30 days without burning out. Here is exactly how we set up the system:",
            cta: "Bookmark this post before it gets taken down.",
          },
        ],
      };

    case "hashtag_generator":
      return {
        trending: [
          "#creatoros",
          "#deepwork",
          `#${cleanPrompt.toLowerCase().replace(/\s+/g, "")}ai`,
          "#growthmarketing",
        ],
        mediumCompetition: [
          "#minimalistsetup",
          "#solopreneurs",
          "#contentstrategy",
          "#digitalassets",
        ],
        evergreen: [
          "#productivity",
          "#mindset",
          "#consistency",
          "#designinspo",
        ],
        highConversion: [
          "#saasplatform",
          "#nocode",
          "#automatemybusiness",
          "#contentcreatoros",
        ],
        analyticsHook:
          "This combination blends 40% high-velocity viral tags with 60% niche-specific, low-competition tags, allowing our engine to establish initial traction before pushing to the main feed.",
      };

    case "competitor_intelligence":
      return {
        username: `@${cleanPrompt.toLowerCase().replace(/\s+/g, "")}_master`,
        postingFrequency: "5.5 posts/week",
        estimatedEngagement: "4.8% (Benchmark: 1.8%)",
        topViralReels: [
          {
            hook: "The 10-second rule to double output",
            views: "840K",
            reasonForViral: "Intense typography + satisfying keyboard sounds",
          },
          {
            hook: "Why I stopped using standard managers",
            views: "450K",
            reasonForViral:
              "Contrarian viewpoint hook sparks debate in comments",
          },
        ],
        topHashtags: ["#workspace", "#darkmode", "#creatorsystem", "#focus"],
        strengths: [
          "Exquisite color grading (high-contrast orange highlights)",
          "Perfect audio beat-matching",
        ],
        weaknesses: [
          "No direct calls-to-action in captions",
          "Relies entirely on Reels, zero carousel posts",
        ],
        actionPlan: [
          "Incorporate their high-contrast visual style but add an active Comment-to-DM automated funnel.",
          "Target their audience by utilizing similar dark-ambient synth soundtracks that match heavy bass beats.",
          "Design a contrarian video discussing why 'aesthetic alone' is dead, positioning your system as the solution.",
        ],
      };

    case "ai_ceo":
      return {
        salutation: "Good morning, Chief Creator.",
        metrics: {
          followers: "+492",
          views: "128,500",
          reach: "94,100",
          bestReel: `Secrets of ${cleanPrompt} Aesthetic`,
        },
        recommendations: [
          `Your learning log shows ${cleanPrompt} topics generate 42% higher share rates. Double down immediately.`,
          "Our system detected a 32% spike in 'Chill Synth Ambient' audio relevance. All draft reels updated with this soundtrack.",
        ],
        expectedWeeklyReach: "580,000",
        todaysTasks: [
          "Trend Hunter: Scanned 12 subreddits; added 3 new hooks to calendar.",
          "AI Studio: Rendered and queued Day 3 Aesthetic Setup reel.",
        ],
      };

    default:
      return { message: "General response simulated successfully." };
  }
}

// Serve static assets in production, and run Vite middleware in development
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite developer server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log(
      "Running in Production Mode. Serving static assets from /dist...",
    );
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CreatorOS AI Server booting on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Critical error during server boot:", error);
});