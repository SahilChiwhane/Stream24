import { firestore } from "./src/config/firebase.js";

async function auditWatchHistory() {
  try {
    const snap = await firestore.collection("watch_history").get();
    console.log(`\n=== FIRESTORE AUDIT [WATCH HISTORY] ===`);
    console.log(`Total Records: ${snap.size}`);

    if (snap.empty) {
      console.log("No records found in watch_history.");
    }

    snap.forEach((doc) => {
      const data = doc.data();
      console.log(`\nRecord: ${doc.id}`);
      console.log(`- Title: ${data.title}`);
      console.log(`- UID: ${data.uid}`);
      console.log(`- ContentID: ${data.contentId}`);
      console.log(`- Progress: ${data.progress} / ${data.durationSeconds}s`);
      console.log(
        `- Ratio: ${(data.progress / data.durationSeconds || 0).toFixed(4)}`,
      );
      console.log(`- Last Updated: ${data.updatedAt}`);
    });
  } catch (err) {
    console.error("Audit failed:", err);
  }
}

auditWatchHistory();
