export const AVATARS = [
  { id: "blue", label: "Blue", url: "/avatars/Breeze.png" },
  { id: "green", label: "Green", url: "/avatars/Zen.png" },
  { id: "red", label: "Red", url: "/avatars/Edge.png" },
  { id: "yellow", label: "Yellow", url: "/avatars/Sunny.png" },
  { id: "purple", label: "Purple", url: "/avatars/Nova.png" },
  { id: "teal", label: "Teal", url: "/avatars/Mellow.png" },
  { id: "orange", label: "Orange", url: "/avatars/Crush.png" },
  { id: "pink", label: "Pink", url: "/avatars/Blush.png" },
  { id: "gray", label: "Gray", url: "/avatars/Zap.png" },
  { id: "cyan", label: "Cyan", url: "/avatars/Splash.png" },
];

export const getAvatarById = (id) =>
  AVATARS.find((a) => a.id === id) || null;
