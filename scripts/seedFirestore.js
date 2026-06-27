const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { rootCollections, subcollections } = require('./seedData');

const DEFAULT_SERVICE_ACCOUNT_PATH = path.resolve(
  __dirname,
  '..',
  'secrets',
  'firebase-service-account.local.json',
);

const args = new Set(process.argv.slice(2));
const shouldWrite = args.has('--write');
const shouldClear = args.has('--clear');

const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  COMMUNITIES: 'communities',
  LISTINGS: 'listings',
  CHATS: 'chats',
};

function loadDotEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  lines.forEach(line => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

function resolveServiceAccountPath() {
  const fromEnv =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;

  return path.resolve(fromEnv || DEFAULT_SERVICE_ACCOUNT_PATH);
}

function loadServiceAccount() {
  const serviceAccountPath = resolveServiceAccountPath();

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      [
        `Service account JSON not found: ${serviceAccountPath}`,
        'Download it from Firebase Console > Project settings > Service accounts.',
        'Save it as secrets/firebase-service-account.local.json or set FIREBASE_SERVICE_ACCOUNT_PATH.',
      ].join('\n'),
    );
  }

  return {
    serviceAccount: require(serviceAccountPath),
    serviceAccountPath,
  };
}

function convertDates(value) {
  if (value instanceof Date) {
    return admin.firestore.Timestamp.fromDate(value);
  }

  if (Array.isArray(value)) {
    return value.map(convertDates);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        convertDates(nestedValue),
      ]),
    );
  }

  return value;
}

function getWritePlan() {
  const rootWrites = Object.entries(rootCollections).flatMap(
    ([collectionName, documents]) =>
      Object.entries(documents).map(([id, data]) => ({
        path: [collectionName, id],
        data,
      })),
  );

  return [...rootWrites, ...subcollections];
}

async function deleteCollection(db, collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const batch = db.batch();

  snapshot.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();

  return snapshot.size;
}

async function clearSeedData(db) {
  const collectionNames = Object.values(COLLECTIONS);
  const results = [];

  for (const collectionName of collectionNames) {
    const deleted = await deleteCollection(db, collectionName);
    results.push(`${collectionName}: ${deleted}`);
  }

  return results;
}

async function seedFirestore() {
  loadDotEnv();

  const plan = getWritePlan();

  if (!shouldWrite) {
    console.log('Mode: DRY RUN');
    console.log(`Documents planned: ${plan.length}`);
    plan.forEach(item => console.log(`[dry-run] ${item.path.join('/')}`));
    console.log('No writes were made. Re-run with --write to seed Firestore.');
    return;
  }

  const { serviceAccount, serviceAccountPath } = loadServiceAccount();

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });

  const db = admin.firestore();

  console.log(`Firebase project: ${serviceAccount.project_id}`);
  console.log(`Service account: ${serviceAccountPath}`);
  console.log('Mode: WRITE');
  console.log(`Documents planned: ${plan.length}`);

  if (shouldClear) {
    const results = await clearSeedData(db);
    console.log(`Cleared root collections: ${results.join(', ')}`);
  }

  const batch = db.batch();

  plan.forEach(item => {
    const ref = db.doc(item.path.join('/'));
    batch.set(ref, convertDates(item.data), { merge: true });
  });

  await batch.commit();
  console.log(`Seed completed. Documents written: ${plan.length}`);
}

seedFirestore()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all(admin.apps.map(app => app.delete()));
  });
