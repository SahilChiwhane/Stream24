import { GiNinjaStar } from "react-icons/gi";
import { MdLocalMovies, MdOutlineLiveTv } from "react-icons/md";
import { FaSearch, FaListAlt, FaCog } from "react-icons/fa";

export const LOCAL_USER_KEY = "stream24_auth_v1";

export const NAV_ITEMS = [
  {
    key: "movies",
    label: "Movies",
    to: "/movies",
    icon: <MdLocalMovies className="sidebar--icon sidebar--icon-movie" />,
  },
  {
    key: "tvshows",
    label: "TV Shows",
    to: "/tvshows",
    icon: <MdOutlineLiveTv className="sidebar--icon sidebar--icon-tv" />,
  },
  {
    key: "anime",
    label: "Anime",
    to: "/anime",
    icon: <GiNinjaStar className="sidebar--icon sidebar--icon-ninja" />,
  },
  {
    key: "search",
    label: "Search",
    to: "/search",
    icon: <FaSearch className="sidebar--icon sidebar--icon-search" />,
  },
  {
    key: "wishlist",
    label: "Wishlist",
    to: "/wishlist",
    icon: <FaListAlt className="sidebar--icon sidebar--icon-wishlist" />,
  },
  {
    key: "settings",
    label: "Settings",
    to: "/settings",
    icon: <FaCog className="sidebar--icon sidebar--icon-settings" />,
  },
];
