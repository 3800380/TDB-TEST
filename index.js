import fetch from 'node-fetch';

// URL of the JSON file hosted in your GitHub repository's raw content
const API_KEYS_URL = 'https://raw.githubusercontent.com/3800380/3800380TDB/main/apis.json'; 

// GitHub repository details
const GITHUB_REPO = 'HyHamza/X-BYTE';  // GitHub repo in format 'username/repo'

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
    SESSION_ID: "Hiinde"
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
