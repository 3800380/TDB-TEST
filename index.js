import fetch from 'node-fetch';

// URL of the JSON file hosted in your GitHub repository's raw content
const API_KEYS_URL = 'https://raw.githubusercontent.com/3800380/3800380TDB/main/apis.json';

// GitHub repository details
const GITHUB_REPO = 'HyHamza/X-BYTE'; // GitHub repo in format 'username/repo'

// Random app name generator
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

// Function to fetch `app.json` from GitHub and merge with custom variables
async function fetchAppJson() {
  const appJsonUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/app.json`;
  try {
    const response = await fetch(appJsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch app.json: ${response.statusText}`);
    }
    const appJson = await response.json();
    return appJson;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Extracts only the values from app.json's env object
function extractEnvValues(env) {
  const extractedValues = {};
  for (const [key, metadata] of Object.entries(env)) {
    extractedValues[key] = metadata.value; // Only keep the "value" field
  }
  return extractedValues;
}

// Function to set config vars from both app.json and custom vars
async function setConfigVars(appId, apiKey, customVars = {}) {
  const appJson = await fetchAppJson();
  
  if (!appJson) {
    throw new Error('Failed to load app.json.');
  }

  // Extract only values from app.json's env section
  const appJsonEnvValues = extractEnvValues(appJson.env);

  // Combine variables from app.json with customVars (customVars take precedence)
  const configVars = {
    ...appJsonEnvValues, // Variables from app.json
    ...customVars,       // Custom overrides from Node.js code
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
async function createHerokuApp(apiKey, customVars = {}) {
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
  await setConfigVars(appData.id, apiKey, customVars);

  // Link the GitHub repo to Heroku app
  await linkGitHubRepoToHeroku(appData.id, apiKey);

  return appData;
}

// Function to link the GitHub repo to Heroku app and apply buildpacks from app.json
async function linkGitHubRepoToHeroku(appId, apiKey) {
  const appJson = await fetchAppJson();

  if (!appJson) {
    throw new Error('Failed to load app.json.');
  }

  // Set buildpacks from app.json
  if (appJson.buildpacks && appJson.buildpacks.length > 0) {
    for (const buildpack of appJson.buildpacks) {
      await fetch(`https://api.heroku.com/apps/${appId}/buildpack-installations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/vnd.heroku+json; version=3'
        },
        body: JSON.stringify({ updates: [{ buildpack: buildpack.url }] })
      });
    }
  }

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
  console.log('GitHub Repo Linked and Buildpacks Applied:', buildData);
}

// Function to deploy app using multiple API keys
async function deployWithMultipleKeys() {
  const apiKeys = await fetchApiKeys();

  if (apiKeys.length === 0) {
    console.log('No API keys found. Please check the JSON file URL.');
    return;
  }

  const customVars = {
    SESSION_ID: 'Hiinde', // Your custom variables to override app.json
  };

  for (const apiKey of apiKeys) {
    try {
      console.log(`Attempting to deploy with API key: ${apiKey}`);
      const appData = await createHerokuApp(apiKey, customVars);
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
  
