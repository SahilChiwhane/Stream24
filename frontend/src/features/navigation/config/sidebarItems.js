import {
  FaSearch,
  FaFilm,
  FaTv,
  FaListAlt,
  FaCog,
  FaQuestionCircle,
} from "react-icons/fa";

const sidebarItems = [
  { key: "movies", label: "Movies", to: "/movies", icon: FaFilm },
  { key: "tvshows", label: "TV Shows", to: "/tvshows", icon: FaTv },
  { key: "anime",  label: "Anime", to: "/anime", icon: FaFilm },
  { key: "search", label: "Search", to: "/search", icon: FaSearch },
  { key: "wishlist", label: "Wishlist", to: "/wishlist", icon: FaListAlt },
  { key: "settings", label: "Settings", to: "/settings", icon: FaCog },
  { key: "help", label: "Help", to: "/help", icon: FaQuestionCircle },
];

export default sidebarItems;
