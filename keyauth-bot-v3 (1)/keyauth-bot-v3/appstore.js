const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'apps.json');

function loadApps() {
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify([], null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function saveApps(apps) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(apps, null, 2));
}

function getApps() {
  return loadApps();
}

function getApp(name) {
  return loadApps().find(a => a.name.toLowerCase() === name.toLowerCase());
}

function addApp(appData) {
  const apps = loadApps();
  const existing = apps.findIndex(a => a.name.toLowerCase() === appData.name.toLowerCase());
  if (existing >= 0) {
    apps[existing] = appData; // update if exists
  } else {
    apps.push(appData);
  }
  saveApps(apps);
}

function removeApp(name) {
  const apps = loadApps().filter(a => a.name.toLowerCase() !== name.toLowerCase());
  saveApps(apps);
}

module.exports = { getApps, getApp, addApp, removeApp };
