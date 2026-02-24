import React, { useState } from "react";

export default function PersonCard({ person, width = "100%" }) {
  const [error, setError] = useState(false);

  const image =
    !error && person.profileUrl
      ? person.profileUrl
      : "https://ui-avatars.com/api/?background=111&color=888&name=Actor";

  return (
    <div
      className="flex-shrink-0 opacity-80 hover:opacity-100 transition"
      style={{ width }}
    >
      <img
        src={image}
        alt={person.name}
        onError={() => setError(true)}
        className="rounded-lg w-full h-[150px] object-cover bg-[#111]"
        loading="lazy"
      />

      <div className="mt-2 space-y-0.5">
        <p className="text-xs font-medium text-gray-200 truncate">
          {person.name}
        </p>

        {person.character && (
          <p className="text-[11px] text-gray-500 truncate">
            {person.character}
          </p>
        )}
      </div>
    </div>
  );
}
