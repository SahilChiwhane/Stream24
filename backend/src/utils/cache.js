import NodeCache from "node-cache";

// Standard industrial TTL: 1 hour for metadata, 2 hours for playback mapping
const cache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 120,
  useClones: false, // Optimization for large objects
});

export default cache;
