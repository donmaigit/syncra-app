"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Image as ImageIcon, Loader2, RefreshCw } from "lucide-react";

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  locale: string;
}

export default function MediaLibraryModal({ isOpen, onClose, onSelect, locale }: MediaLibraryModalProps) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (data.images) setImages(data.images);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchImages();
  }, [isOpen]);

  const handleDelete = async (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(locale === 'ja' ? "本当に削除しますか？" : "Delete this image permanently?")) return;
    
    setDeleting(key);
    try {
      const res = await fetch("/api/media", {
        method: "DELETE",
        body: JSON.stringify({ key })
      });
      if (res.ok) {
        setImages(prev => prev.filter(img => img.key !== key));
      }
    } catch (e) {
      alert("Delete failed");
    }
    setDeleting(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-white/10">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/20">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <ImageIcon className="text-purple-600" />
            {locale === 'ja' ? 'メディアライブラリ' : 'Media Library'}
          </h2>
          <div className="flex gap-2">
            <button onClick={fetchImages} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors" title="Refresh">
              <RefreshCw size={18} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-black/40">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mr-2" /> Loading...
            </div>
          ) : images.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ImageIcon size={48} className="mb-4 opacity-50" />
              <p>{locale === 'ja' ? '画像が見つかりません' : 'No images found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img) => (
                <div 
                  key={img.key} 
                  onClick={() => { onSelect(img.url); onClose(); }}
                  className="group relative aspect-square bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden cursor-pointer hover:border-purple-500 hover:ring-2 hover:ring-purple-500/50 transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="Uploaded" className="w-full h-full object-cover" />
                  
                  {/* HOVER OVERLAY */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-start justify-end p-2 opacity-0 group-hover:opacity-100">
                    <button 
                      onClick={(e) => handleDelete(img.key, e)}
                      disabled={deleting === img.key}
                      className="bg-white text-red-500 p-1.5 rounded-full shadow-md hover:bg-red-50 transition-transform hover:scale-110"
                      title="Delete"
                    >
                      {deleting === img.key ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}