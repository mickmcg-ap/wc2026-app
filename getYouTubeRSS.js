#!/usr/bin/env node

// Usage: node yt-rss.js <channel-url-or-handle-or-id> [api-key]
// API key optional if you pass a raw channel ID (UCxxx...)

const input = process.argv[2];
const apiKey = process.argv[3];

if (!input) {
  console.error('Usage: node yt-rss.js <channel-url|@handle|UCxxx> [api-key]');
  process.exit(1);
}

function parseInput(raw) {
  raw = raw.trim();
  if (/^UC[\w-]{22}$/.test(raw)) return { type: 'id', value: raw };
  const patterns = [
    [/youtube\.com\/channel\/(UC[\w-]{22})/, 'id'],
    [/youtube\.com\/@([\w.-]+)/, 'handle'],
    [/youtube\.com\/c\/([\w.-]+)/, 'handle'],
    [/youtube\.com\/user\/([\w.-]+)/, 'user'],
    [/^@([\w.-]+)$/, 'handle'],
  ];
  for (const [re, type] of patterns) {
    const m = raw.match(re);
    if (m) return { type, value: m[1] };
  }
  return { type: 'handle', value: raw };
}

async function resolveChannelId(parsed) {
  if (parsed.type === 'id') return { id: parsed.value, title: parsed.value };

  if (!apiKey) {
    console.error('API key required to resolve handles/usernames. Pass it as the second argument.');
    process.exit(1);
  }

  let url;
  if (parsed.type === 'handle') {
    url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${encodeURIComponent(parsed.value)}&key=${apiKey}`;
  } else {
    url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=${encodeURIComponent(parsed.value)}&key=${apiKey}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    console.error('API error:', data.error.message);
    process.exit(1);
  }

  if (!data.items || data.items.length === 0) {
    console.error('Channel not found for:', parsed.value);
    process.exit(1);
  }

  const ch = data.items[0];
  return { id: ch.id, title: ch.snippet.title };
}

async function main() {
  const parsed = parseInput(input);
  const { id, title } = await resolveChannelId(parsed);
  const rss = `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`;
  console.log(`Channel : ${title}`);
  console.log(`ID      : ${id}`);
  console.log(`RSS     : ${rss}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });