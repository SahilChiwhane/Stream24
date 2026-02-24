import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n");

admin.initializeApp({
  credential: admin.credential.cert(sa),
});

const db = admin.firestore();

async function run() {
  const uid = "zLMJPbZszuOHkeVeYbgKemsPRC53";
  const docId = `${uid}_TEST_MOVIE`;

  console.log("Writing test record to watch_history...");
  await db.collection("watch_history").doc(docId).set({
    uid,
    contentId: "TEST_MOVIE",
    title: "Test Movie System",
    progress: 50,
    durationSeconds: 100,
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log("Reading it back...");
  const doc = await db.collection("watch_history").doc(docId).get();
  if (doc.exists) {
    console.log("SUCCESS: Record found!", doc.data().title);
  } else {
    console.log("FAILURE: Record not found!");
  }
}

run();
