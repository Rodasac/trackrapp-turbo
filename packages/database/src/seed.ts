import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");

  const client = postgres(url, { prepare: false });
  const db = drizzle(client, { schema });

  console.log("Seeding database...");

  // ── System-default categories (userId = null = visible to all users) ──────────
  await db
    .insert(schema.categories)
    .values([
      { name: "Entertainment", color: "#ef4444", icon: "tv" },
      { name: "Music", color: "#8b5cf6", icon: "music" },
      { name: "Productivity", color: "#3b82f6", icon: "briefcase" },
      { name: "Gaming", color: "#10b981", icon: "gamepad-2" },
      { name: "Cloud Storage", color: "#f59e0b", icon: "cloud" },
      { name: "Health & Fitness", color: "#ec4899", icon: "heart-pulse" },
      { name: "News & Reading", color: "#6366f1", icon: "newspaper" },
      { name: "Education", color: "#14b8a6", icon: "graduation-cap" },
      { name: "Finance", color: "#84cc16", icon: "landmark" },
      { name: "Other", color: "#6b7280", icon: "package" },
    ])
    .onConflictDoNothing();

  // ── Service catalog (logoUrl omitted — frontend falls back to logo.dev) ────────
  await db
    .insert(schema.serviceCatalog)
    .values([
      // Entertainment
      {
        name: "Netflix",
        websiteUrl: "https://netflix.com",
        defaultCategory: "Entertainment",
        typicalMonthlyPrice: "15.49",
      },
      {
        name: "Disney+",
        websiteUrl: "https://disneyplus.com",
        defaultCategory: "Entertainment",
        typicalMonthlyPrice: "7.99",
      },
      {
        name: "Hulu",
        websiteUrl: "https://hulu.com",
        defaultCategory: "Entertainment",
        typicalMonthlyPrice: "7.99",
      },
      {
        name: "HBO Max",
        websiteUrl: "https://max.com",
        defaultCategory: "Entertainment",
        typicalMonthlyPrice: "9.99",
      },
      {
        name: "Amazon Prime Video",
        websiteUrl: "https://primevideo.com",
        defaultCategory: "Entertainment",
        typicalMonthlyPrice: "8.99",
      },
      {
        name: "Apple TV+",
        websiteUrl: "https://tv.apple.com",
        defaultCategory: "Entertainment",
        typicalMonthlyPrice: "9.99",
      },
      {
        name: "Peacock",
        websiteUrl: "https://peacocktv.com",
        defaultCategory: "Entertainment",
        typicalMonthlyPrice: "5.99",
      },
      // Music
      {
        name: "Spotify",
        websiteUrl: "https://spotify.com",
        defaultCategory: "Music",
        typicalMonthlyPrice: "11.99",
        typicalYearlyPrice: "99.99",
      },
      {
        name: "Apple Music",
        websiteUrl: "https://music.apple.com",
        defaultCategory: "Music",
        typicalMonthlyPrice: "10.99",
      },
      {
        name: "YouTube Music",
        websiteUrl: "https://music.youtube.com",
        defaultCategory: "Music",
        typicalMonthlyPrice: "10.99",
      },
      {
        name: "Tidal",
        websiteUrl: "https://tidal.com",
        defaultCategory: "Music",
        typicalMonthlyPrice: "10.99",
      },
      // Productivity
      {
        name: "Notion",
        websiteUrl: "https://notion.so",
        defaultCategory: "Productivity",
        typicalMonthlyPrice: "16.00",
        typicalYearlyPrice: "192.00",
      },
      {
        name: "Figma",
        websiteUrl: "https://figma.com",
        defaultCategory: "Productivity",
        typicalMonthlyPrice: "15.00",
      },
      {
        name: "GitHub",
        websiteUrl: "https://github.com",
        defaultCategory: "Productivity",
        typicalMonthlyPrice: "4.00",
        typicalYearlyPrice: "48.00",
      },
      {
        name: "Linear",
        websiteUrl: "https://linear.app",
        defaultCategory: "Productivity",
        typicalMonthlyPrice: "8.00",
      },
      {
        name: "Slack",
        websiteUrl: "https://slack.com",
        defaultCategory: "Productivity",
        typicalMonthlyPrice: "7.25",
      },
      // Gaming
      {
        name: "Xbox Game Pass",
        websiteUrl: "https://xbox.com/game-pass",
        defaultCategory: "Gaming",
        typicalMonthlyPrice: "14.99",
      },
      {
        name: "PlayStation Plus",
        websiteUrl: "https://playstation.com",
        defaultCategory: "Gaming",
        typicalMonthlyPrice: "17.99",
      },
      {
        name: "Nintendo Switch Online",
        websiteUrl: "https://nintendo.com",
        defaultCategory: "Gaming",
        typicalMonthlyPrice: "3.99",
        typicalYearlyPrice: "19.99",
      },
      // Cloud Storage
      {
        name: "iCloud+",
        websiteUrl: "https://icloud.com",
        defaultCategory: "Cloud Storage",
        typicalMonthlyPrice: "2.99",
      },
      {
        name: "Google One",
        websiteUrl: "https://one.google.com",
        defaultCategory: "Cloud Storage",
        typicalMonthlyPrice: "2.99",
      },
      {
        name: "Dropbox",
        websiteUrl: "https://dropbox.com",
        defaultCategory: "Cloud Storage",
        typicalMonthlyPrice: "11.99",
        typicalYearlyPrice: "119.99",
      },
      // Health & Fitness
      {
        name: "Calm",
        websiteUrl: "https://calm.com",
        defaultCategory: "Health & Fitness",
        typicalMonthlyPrice: "14.99",
        typicalYearlyPrice: "69.99",
      },
      {
        name: "Headspace",
        websiteUrl: "https://headspace.com",
        defaultCategory: "Health & Fitness",
        typicalMonthlyPrice: "12.99",
        typicalYearlyPrice: "69.99",
      },
      {
        name: "Peloton",
        websiteUrl: "https://onepeloton.com",
        defaultCategory: "Health & Fitness",
        typicalMonthlyPrice: "12.99",
      },
      // News & Reading
      {
        name: "The New York Times",
        websiteUrl: "https://nytimes.com",
        defaultCategory: "News & Reading",
        typicalMonthlyPrice: "17.00",
      },
      {
        name: "Medium",
        websiteUrl: "https://medium.com",
        defaultCategory: "News & Reading",
        typicalMonthlyPrice: "5.00",
        typicalYearlyPrice: "50.00",
      },
      // Finance
      {
        name: "QuickBooks",
        websiteUrl: "https://quickbooks.intuit.com",
        defaultCategory: "Finance",
        typicalMonthlyPrice: "30.00",
      },
      // Education
      {
        name: "Duolingo Plus",
        websiteUrl: "https://duolingo.com",
        defaultCategory: "Education",
        typicalMonthlyPrice: "14.99",
        typicalYearlyPrice: "83.99",
      },
      {
        name: "Coursera Plus",
        websiteUrl: "https://coursera.org",
        defaultCategory: "Education",
        typicalMonthlyPrice: "59.00",
        typicalYearlyPrice: "399.00",
      },
    ])
    .onConflictDoNothing();

  await client.end();
  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
