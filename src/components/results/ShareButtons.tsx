"use client";
import { useState } from "react";
import type { ShareContent } from "@/lib/types";

type Props = { share: ShareContent; url?: string };

export function ShareButtons({ share, url }: Props) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.origin : share.share_url);

  const openWhatsApp = () => {
    const text = encodeURIComponent(`${share.whatsapp_text} ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };
  const openTwitter = () => {
    const text = encodeURIComponent(share.twitter_text);
    const u = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${u}`, "_blank");
  };
  const openLinkedIn = () => {
    const u = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${u}`, "_blank");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${share.whatsapp_text} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: share.og_title,
          text: share.whatsapp_text,
          url: shareUrl,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={openWhatsApp}
        className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
      >
        <span>💬</span> WhatsApp
      </button>
      <button
        onClick={openTwitter}
        className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        <span>𝕏</span> Twitter
      </button>
      <button
        onClick={openLinkedIn}
        className="flex items-center gap-2 rounded-full bg-[#0A66C2] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
      >
        <span>in</span> LinkedIn
      </button>
      <button
        onClick={nativeShare}
        className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
      >
        <span>📤</span> Más…
      </button>
      <button
        onClick={copyLink}
        className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/10"
      >
        <span>{copied ? "✅" : "🔗"}</span> {copied ? "Copiado" : "Copiar link"}
      </button>
    </div>
  );
}
