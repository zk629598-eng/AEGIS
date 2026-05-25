const axios = require('axios');

const BASE_URL = 'https://keyauth.win/api/1.2/';

async function request(ownerID, params) {
  try {
    const response = await axios.get(BASE_URL, {
      params: { ownerkey: ownerID, ...params },
      timeout: 10000,
    });
    return response.data;
  } catch (err) {
    console.error('KeyAuth API error:', err.message);
    return { success: false, message: err.message };
  }
}

// Test if credentials are valid
async function testCredentials(ownerID, appName) {
  return request(ownerID, { type: 'fetchallkeys', app: appName });
}

async function generateKey(ownerID, appName, amount, expiry) {
  return request(ownerID, { type: 'add', app: appName, amount, expiry, mask: 'XXXXXX-XXXXXX-XXXXXX', level: 1, roleid: '1' });
}

async function fetchKeys(ownerID, appName) {
  return request(ownerID, { type: 'fetchallkeys', app: appName });
}

async function fetchUsers(ownerID, appName) {
  return request(ownerID, { type: 'fetchallusers', app: appName });
}

async function fetchLogs(ownerID, appName) {
  return request(ownerID, { type: 'fetchlogs', app: appName });
}

async function deleteKey(ownerID, appName, key) {
  return request(ownerID, { type: 'del', app: appName, key });
}

async function banKey(ownerID, appName, key) {
  return request(ownerID, { type: 'ban', app: appName, key });
}

async function unbanKey(ownerID, appName, key) {
  return request(ownerID, { type: 'unban', app: appName, key });
}

async function verifyKey(ownerID, appName, key) {
  return request(ownerID, { type: 'verify', app: appName, key });
}

async function banUser(ownerID, appName, user) {
  return request(ownerID, { type: 'banuser', app: appName, user });
}

async function unbanUser(ownerID, appName, user) {
  return request(ownerID, { type: 'unbanuser', app: appName, user });
}

async function deleteUser(ownerID, appName, user) {
  return request(ownerID, { type: 'deluser', app: appName, user });
}

async function resetUser(ownerID, appName, user) {
  return request(ownerID, { type: 'resetuser', app: appName, user });
}

async function getDashboardSummary(ownerID, appName) {
  const [keysRes, usersRes] = await Promise.all([
    fetchKeys(ownerID, appName),
    fetchUsers(ownerID, appName),
  ]);

  const keys = keysRes.success ? (keysRes.keys || []) : [];
  const users = usersRes.success ? (usersRes.users || []) : [];

  return {
    totalKeys: keys.length,
    usedKeys: keys.filter(k => k.used === '1').length,
    unusedKeys: keys.filter(k => k.used === '0').length,
    bannedKeys: keys.filter(k => k.banned === '1').length,
    totalUsers: users.length,
    activeUsers: users.filter(u => u.banned !== '1').length,
    bannedUsers: users.filter(u => u.banned === '1').length,
  };
}

module.exports = {
  testCredentials, generateKey, fetchKeys, fetchUsers, fetchLogs,
  deleteKey, banKey, unbanKey, verifyKey,
  banUser, unbanUser, deleteUser, resetUser,
  getDashboardSummary,
};
