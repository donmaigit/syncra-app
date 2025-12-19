"use client";

import { useState } from "react";
import { UploadCloud, Loader2, Image as ImageIcon, X, FolderOpen } from "lucide-react";
import MediaLibraryModal from "./MediaLibraryModal";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  locale?: string;
}

export default function ImageUploader({ value, onChange, locale = 'ja' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const { signedUrl, publicUrl } = await res.json();

      if (!signedUrl) throw new Error("No upload URL");

      await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      onChange(publicUrl);
    } catch (error) {
      alert("Upload failed.");
      console.error(error);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-3">
      {/* PREVIEW AREA */}
      {value ? (
        <div className="relative group w-full h-32 bg-slate-100 dark:bg-white/5 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button 
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-white text-red-500 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="w-full h-32 bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-lg flex flex-col items-center justify-center text-slate-400">
          <ImageIcon size={24} className="mb-2" />
          <span className="text-xs">{locale === 'ja' ? '画像がありません' : 'No Image'}</span>
        </div>
      )}

      {/* BUTTONS ROW */}
      <div className="flex gap-2">
        {/* Upload Button */}
        <label className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-[10px] font-bold cursor-pointer hover:bg-purple-100 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
          {uploading ? (locale === 'ja' ? 'アップロード中...' : 'Uploading...') : (locale === 'ja' ? 'アップロード' : 'Upload')}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>

        {/* Library Button */}
        <button 
          onClick={() => setLibraryOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 text-[10px] font-bold hover:bg-slate-50 transition-colors"
        >
          <FolderOpen size={14} />
          {locale === 'ja' ? 'ライブラリ' : 'Library'}
        </button>
      </div>

      {/* URL INPUT */}
      <div>
        <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">{locale==='ja'?'または URL を入力':'Or Paste URL'}</label>
        <input 
          type="text" 
          value={value || ""} 
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full p-2 text-xs border rounded bg-slate-50 dark:bg-black/20 outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* MODAL */}
      <MediaLibraryModal 
        isOpen={libraryOpen} 
        onClose={() => setLibraryOpen(false)} 
        onSelect={onChange} 
        locale={locale} 
      />
    </div>
  );
}