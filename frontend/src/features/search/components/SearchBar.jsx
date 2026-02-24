// import React from 'react';
// import { useSearch } from '../contexts/SearchContext';
// import { useNavigate } from 'react-router-dom';

// const SearchBar = () => {
//   const { query, setQuery, closeSearch } = useSearch();
//   const navigate = useNavigate();

//   const submit = (e) => {
//     e.preventDefault();
//     if (!query || !query.trim()) return;
//     closeSearch();
//     navigate(`/search?q=${encodeURIComponent(query.trim())}`);
//   };

//   return (
//     <form onSubmit={submit} className="mx-auto max-w-3xl">
//       <div className="flex items-center rounded-full px-4 py-3" style={{ background: 'var(--card)', border: `1px solid var(--border)` }}>
//         <input
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           className="w-full bg-transparent outline-none placeholder:text-secondary"
//           placeholder="Search movies, tv shows, actors..."
//           aria-label="Quick search"
//           style={{ color: 'var(--text-main)' }}
//         />
//         <button
//           type="button"
//           onClick={() => { setQuery(''); closeSearch(); }}
//           className="ml-3 px-3 py-1 rounded"
//           aria-label="Close search"
//           style={{ color: 'var(--text-secondary)' }}
//         >
//           Close
//         </button>
//       </div>
//     </form>
//   );
// };

// export default SearchBar;
