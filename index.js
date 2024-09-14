
    
import fetch from 'node-fetch';

// URL of the JSON file hosted in your GitHub repository's raw content
const API_KEYS_URL = 'https://raw.githubusercontent.com/3800380/3800380TDB/main/apis.json'; 

// GitHub repository details
const GITHUB_REPO = '3800380/X-BYTE';  // GitHub repo in format 'username/repo'

// Random app name generator (you can modify this for more creative names)
function generateRandomAppName() {
  const adjectives = ["fast", "bright", "clever", "cool", "sharp"];
  const nouns = ["unicorn", "falcon", "wizard", "dragon", "phoenix"];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomSuffix = Math.floor(Math.random() * 10000); // Adding numbers to avoid duplicates
  return `${randomAdjective}-${randomNoun}-${randomSuffix}`;
}

// Function to fetch the API keys from the JSON file
async function fetchApiKeys() {
  try {
    const response = await fetch(API_KEYS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch API keys: ${response.statusText}`);
    }
    const data = await response.json();
    return data.apiKeys;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Function to set custom config variables like HEROKU_APP_NAME and HEROKU_API_KEY
async function setConfigVars(appId, appName, apiKey) {
  const configVars = {
    HEROKU_APP_NAME: appName,
    HEROKU_API_KEY: apiKey,
    SESSION_ID: "Byte;;;eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoidUVEZCs5aEFSbUpsNldsc1pSREFlZk1OUFhLaUw5U0MvcGtJT0FlZDhGaz0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiUUZGMDRzd1F0ZG03MStWZGZHTWQ0WmhMdGc4TFNnZmt6UGo0MDc4MFdIcz0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJVTW5rc3ZVeWhDSUp6cTQzcWMvVXNGbVltUHh3YmNiV2JBV3pmU3I2UFZzPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJHVmF6N3ducW01dG5odzZHSkVsZWttWUdobDBZelRlYk0yZFBDdDhlVVVnPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6ImNOeWV4YlBnc25xS2Y0aHlOczR2N1JDU0lUQk8zbGE5YmF4Mk52RVhBbkU9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6Im9OZzRlQ21QczNIQmNsUWI3aXpkb1FxNU1tK3FnSzdMUUxNYUNCb1R4VGM9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiRUdLQ1pLeGZhYmFycWZ6UjZaNW5KdEIzcE1jUnZPNjdPN2dNTitYS1Nsbz0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoicmZDUDRKRzdUNUplYzZKUEFUNUIzcXFDR0l0LytwTUdHVENpdFRiczFsTT0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6InQrcjNZaHpkb0x3MkFRaENhUktIRldLNWpLMkROOGlKRDVGWFVnaUtUeHpFTDlMaUUrZElTRkgxMFJkQnZzclgxaGFuaDZ3Qk5sM0NmcWIyWnd2OGhBPT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6ODAsImFkdlNlY3JldEtleSI6IjB3K1F6UDNaMWNKUUlPakU4MndCaHR3QU55Rm1Lbi9idHcxVHhqdEsrZmc9IiwicHJvY2Vzc2VkSGlzdG9yeU1lc3NhZ2VzIjpbXSwibmV4dFByZUtleUlkIjozMSwiZmlyc3RVbnVwbG9hZGVkUHJlS2V5SWQiOjMxLCJhY2NvdW50U3luY0NvdW50ZXIiOjAsImFjY291bnRTZXR0aW5ncyI6eyJ1bmFyY2hpdmVDaGF0cyI6ZmFsc2V9LCJkZXZpY2VJZCI6IjZMMkptVjU3UTdLQjd4cE5FVmN3aXciLCJwaG9uZUlkIjoiNTkxMTE4OWYtOGM2Ny00YmE2LThjM2UtNzc5ZTk1MmQwZDA0IiwiaWRlbnRpdHlJZCI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IldQR2FEZ2lRazFjNU5Ma2RJb3oyQkdMekNUMD0ifSwicmVnaXN0ZXJlZCI6dHJ1ZSwiYmFja3VwVG9rZW4iOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJ6NlhZS0tXd3h0dFJaNmx3eWkrUGk4QjZkUVE9In0sInJlZ2lzdHJhdGlvbiI6e30sInBhaXJpbmdDb2RlIjoiN0c5WlBMV1oiLCJtZSI6eyJpZCI6IjkyMzI5Nzg1OTkyNDoyM0BzLndoYXRzYXBwLm5ldCJ9LCJhY2NvdW50Ijp7ImRldGFpbHMiOiJDSlhjakhzUTNMbU10d1lZQ2lBQUtBQT0iLCJhY2NvdW50U2lnbmF0dXJlS2V5IjoicXpzOGlxazFQYjFmQ3FWcEhqWG9ncS92V2lWdWlkazBOcDd0ckFpRXdBND0iLCJhY2NvdW50U2lnbmF0dXJlIjoiUWFTVjRRdFVuRW85WmwzS0FISFBTZm55TG9IRjV4ZDN2eitEY3BUUHJLa3ZYVzczWEU5aCtpSjNrTHl3bExFWExEU0R3S3NhZC9USmRlbWMraGwvQ1E9PSIsImRldmljZVNpZ25hdHVyZSI6IkowTEhVTWpYcVQwQ2tabjUwZ294TGRjVW1aQUlOL3ZpL1VGRHBJc2FuNFBMRU5FU0xqeExPeVVFMkJwNVF1VFZJQ1ZQczdBZWh2eEx5K0pTeXF6SmlnPT0ifSwic2lnbmFsSWRlbnRpdGllcyI6W3siaWRlbnRpZmllciI6eyJuYW1lIjoiOTIzMjk3ODU5OTI0OjIzQHMud2hhdHNhcHAubmV0IiwiZGV2aWNlSWQiOjB9LCJpZGVudGlmaWVyS2V5Ijp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQmFzN1BJcXBOVDI5WHdxbGFSNDE2SUt2NzFvbGJvblpORGFlN2F3SWhNQU8ifX1dLCJwbGF0Zm9ybSI6ImFuZHJvaWQiLCJsYXN0QWNjb3VudFN5bmNUaW1lc3RhbXAiOjE3MjYxNjAxMDYsIm15QXBwU3RhdGVLZXlJZCI6IkFBQUFBSVd0In0=",
    COMMAND_TYPE: "button",
    POSTGRESQL_URL: "postgres://db_7xp9_user:6hwmTN7rGPNsjlBEHyX49CXwrG7cDeYi@dpg-cj7ldu5jeehc73b2p7g0-a.oregon-postgres.render.com/db_7xp9",
    OWNER_NUMBER:"923072380380",
    ANTI_DELETE:"true",
    WORK_TYPE:"public",
    BOT_EXPIRY_DATE:"2029-09-05",
    BOT_EXPIRY_TIME: "16:00:00"
  };

  const response = await fetch(`https://api.heroku.com/apps/${appId}/config-vars`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/vnd.heroku+json; version=3'
    },
    body: JSON.stringify(configVars)
  });

  if (!response.ok) {
    throw new Error(`Failed to set config vars: ${response.statusText}`);
  }

  const configData = await response.json();
  console.log('Config Vars Set:', configData);
}

// Function to create a new Heroku app with the provided API key and GitHub repo deployment
async function createHerokuApp(apiKey) {
  const appName = generateRandomAppName();  // Generate a random app name
  const response = await fetch('https://api.heroku.com/apps', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/vnd.heroku+json; version=3'
    },
    body: JSON.stringify({
      name: appName
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create Heroku app with API key: ${response.statusText}`);
  }

  const appData = await response.json();

  // Set custom config vars after app creation
  await setConfigVars(appData.id, appName, apiKey);

  // Link the GitHub repo to Heroku app
  await linkGitHubRepoToHeroku(appData.id, apiKey);

  return appData;
}

// Function to link the GitHub repo to Heroku app
async function linkGitHubRepoToHeroku(appId, apiKey) {
  const response = await fetch(`https://api.heroku.com/apps/${appId}/builds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/vnd.heroku+json; version=3'
    },
    body: JSON.stringify({
      source_blob: {
        url: `https://github.com/${GITHUB_REPO}/tarball/main`  // Downloading the repo's tarball
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to link GitHub repo to Heroku app: ${response.statusText}`);
  }

  const buildData = await response.json();
  console.log('GitHub Repo Linked:', buildData);
}

// Function to deploy app using multiple API keys
async function deployWithMultipleKeys() {
  const apiKeys = await fetchApiKeys();
  
  if (apiKeys.length === 0) {
    console.log('No API keys found. Please check the JSON file URL.');
    return;
  }

  for (const apiKey of apiKeys) {
    try {
      console.log(`Attempting to deploy with API key: ${apiKey}`);
      const appData = await createHerokuApp(apiKey);
      console.log(`App deployed successfully with API key: ${apiKey}`);
      console.log('App Name:', appData.name);
      console.log('App details:', appData);
      break;  // Exit the loop if deployment is successful
    } catch (error) {
      console.error(`Error with API key: ${apiKey} - ${error.message}`);
      continue;  // Try the next API key
    }
  }
}

// Start the deployment process
deployWithMultipleKeys();
