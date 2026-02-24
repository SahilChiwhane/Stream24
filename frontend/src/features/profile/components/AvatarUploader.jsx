// import React from "react";
// import { resizeImageFileToDataUrl } from "../utils/image";
// import { FaUpload, FaTrash } from "react-icons/fa";

// export default function AvatarUploader({
//   fileInputRef,
//   avatarDataUrl,
//   setAvatarDataUrl,
//   setStatusMessage,
// }) {
//   const handleFileChange = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const maxMB = 2;

//     if (file.size > maxMB * 1024 * 1024) {
//       setStatusMessage(`File too large. Please use ≤ ${maxMB}MB.`);
//       e.target.value = "";
//       return;
//     }

//     if (!file.type.startsWith("image/")) {
//       setStatusMessage("Please upload a valid image file.");
//       e.target.value = "";
//       return;
//     }

//     try {
//       const resized = await resizeImageFileToDataUrl(file, 256);
//       setAvatarDataUrl(resized);
//       setStatusMessage("Avatar selected — click Save to persist.");
//     } catch {
//       const reader = new FileReader();
//       reader.onload = (evt) => {
//         setAvatarDataUrl(evt.target.result);
//         setStatusMessage("Avatar selected — click Save to persist.");
//       };
//       reader.onerror = () => setStatusMessage("Failed to read file.");
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleUploadClick = () => fileInputRef.current?.click();
//   const handleRemoveAvatar = () => {
//     setAvatarDataUrl(null);
//     setStatusMessage("Avatar removed — click Save to persist.");
//   };

//   /** Enforce perfect circle */
//   const circleStyle = {
//     width: 128,
//     height: 128,
//     borderRadius: "9999px",
//     overflow: "hidden",
//     flexShrink: 0,
//     backgroundColor: "#1f1f1f",
//     boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
//   };

//   const imgStyle = {
//     width: "100%",
//     height: "100%",
//     objectFit: "cover",
//     borderRadius: "9999px",
//   };

//   return (
//     <div className="flex flex-col items-center gap-4 mb-10">
//       {/* Avatar Preview */}
//       <div style={circleStyle} data-cy="avatar-preview">
//         {avatarDataUrl ? (
//           <img src={avatarDataUrl} alt="Avatar preview" style={imgStyle} />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">
//             No avatar
//           </div>
//         )}
//       </div>

//       {/* Hidden Input */}
//       <input
//         ref={fileInputRef}
//         type="file"
//         accept="image/*"
//         onChange={handleFileChange}
//         className="hidden"
//         data-cy="avatar-input"
//       />

//       {/* Icon Buttons */}
//       <div className="flex items-center gap-3">
//         {/* Upload Button */}
//         <button
//           type="button"
//           onClick={handleUploadClick}
//           className="
//             flex items-center gap-2
//             px-4 py-2 rounded-lg
//             bg-blue-600/80 hover:bg-blue-600
//             text-white font-medium
//             shadow-sm hover:shadow-md
//             transition-all
//           "
//           data-cy="avatar-upload-btn"
//         >
//           <FaUpload size={14} />
//           <span>Upload</span>
//         </button>

//         {/* Remove Button */}
//         {avatarDataUrl && (
//           <button
//             type="button"
//             onClick={handleRemoveAvatar}
//             className="
//               flex items-center gap-2
//               px-4 py-2 rounded-lg
//               bg-red-600/80 hover:bg-red-600
//               text-white font-medium
//               shadow-sm hover:shadow-md
//               transition-all
//             "
//             data-cy="avatar-remove-btn"
//           >
//             <FaTrash size={13} />
//             <span>Remove</span>
//           </button>
//         )}
//       </div>

//       <p className="text-sm text-gray-400">
//         JPG/PNG up to 2MB. Stored locally or via Auth profile.
//       </p>
//     </div>
//   );
// }




























import React from "react";
import { FaUpload, FaTrash } from "react-icons/fa";
import {
  uploadAvatarAndReturnMeta,
  removeAvatarAndDeleteFile,
  saveUserProfile,
} from "../services/userProfileService";

export default function AvatarUploader({
  fileInputRef,
  avatarDataUrl,
  setAvatarDataUrl,
  avatarMeta,
  setAvatarMeta,
  setStatusMessage,
}) {
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusMessage("Please upload a valid image file.");
      return;
    }

    try {
      // upload + replace previous
      const meta = await uploadAvatarAndReturnMeta(file, avatarMeta);

      // live preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarDataUrl(previewUrl);
      setAvatarMeta(meta);

      await saveUserProfile({ avatar: meta });

      setStatusMessage("Avatar updated successfully.");
    } catch {
      setStatusMessage("Failed to upload avatar.");
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatarAndDeleteFile(avatarMeta);
      await saveUserProfile({ avatar: null });

      setAvatarDataUrl(null);
      setAvatarMeta(null);

      setStatusMessage("Avatar removed.");
    } catch {
      setStatusMessage("Failed to remove avatar.");
    }
  };

  return (
    <div className="flex items-center gap-3 mt-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleUploadClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white"
      >
        <FaUpload size={13} />
        Change
      </button>

      {avatarDataUrl && (
        <button
          type="button"
          onClick={handleRemoveAvatar}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white"
        >
          <FaTrash size={12} />
          Remove
        </button>
      )}
    </div>
  );
}
