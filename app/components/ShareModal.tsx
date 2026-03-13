import { useState } from "react";
export function ShareModal({ groomName, brideName, onClose }: { groomName: string; brideName: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const link = `https://invitara.app/${groomName.toLowerCase()}-weds-${brideName.toLowerCase()}`;
  const copy = () => { navigator.clipboard?.writeText(link); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return <div className="fixed inset-0 z-[200] flex items-center justify-center p-6" onClick={onClose}>
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>
    <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-gold-xl animate-fade-up" onClick={e=>e.stopPropagation()}>
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full bg-gradient-to-r from-transparent via-gold-500 to-transparent"/>
      <div className="text-center mb-6"><div className="text-3xl mb-3">✨</div><h2 className="font-display text-2xl font-bold">Share Your Invite</h2><p className="text-sm opacity-45 mt-1">Your invitation is live!</p></div>
      <div className="flex gap-2 mb-6"><input readOnly value={link} className="input-gold !py-2.5 !text-sm flex-1 font-mono"/><button onClick={copy} className="btn-gold !py-2.5 !px-5 !text-[11px] shrink-0">{copied?"✓ Copied!":"Copy"}</button></div>
      <div className="grid grid-cols-2 gap-3 mb-6">{[{icon:"💬",name:"WhatsApp"},{icon:"✉️",name:"Email"},{icon:"💌",name:"SMS"},{icon:"📋",name:"Copy Link"}].map(ch=><button key={ch.name} onClick={ch.name==="Copy Link"?copy:undefined} className="p-4 rounded-xl text-center border border-gold-200/20 transition-all hover:bg-gold-50"><div className="text-2xl mb-1.5">{ch.icon}</div><div className="text-xs font-semibold">{ch.name}</div></button>)}</div>
      <button onClick={onClose} className="w-full py-3 rounded-xl text-sm font-medium border border-gold-200/30 hover:bg-cream-50 transition-all">Close</button>
    </div>
  </div>;
}
