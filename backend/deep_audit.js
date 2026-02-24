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
  console.log("Project ID:", sa.project_id);

  const userDocs = await db.collection("users").get();
  console.log(`Total active users: ${userDocs.size}`);

  for (const userDoc of userDocs.docs) {
    const uid = userDoc.id;
    const historySnap = await db
      .collection("users")
      .doc(uid)
      .collection("watch_history")
      .get();
    console.log(`\nUID: ${uid} (Email: ${userDoc.data().email})`);
    console.log(`- Watch History Count: ${historySnap.size}`);
    historySnap.forEach((d) => {
      console.log(
        `  * ${d.id}: ${d.data().title} (${d.data().progress}/${d.data().durationSeconds}s)`,
      );
    });

    const wishlistSnap = await db
      .collection("users")
      .doc(uid)
      .collection("wishlist")
      .get();
    console.log(`- Wishlist Count: ${wishlistSnap.size}`);
  }
}

run();
