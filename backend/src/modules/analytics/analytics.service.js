import { firestore } from "../../config/firebase.js";

const eventsRef = firestore.collection("playback_events");

const now = () => new Date().toISOString();

export const logPlaybackEvent = async ({
  uid,
  contentId,
  contentType,
  event,
  meta = {},
}) => {
  const doc = {
    uid,
    contentId,
    contentType,
    event,
    meta,
    createdAt: now(),
  };

  await eventsRef.add(doc);
  return doc;
};
