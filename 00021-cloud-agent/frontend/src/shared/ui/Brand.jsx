import { Layers2 } from 'lucide-react';

export function Brand({ light = false }) {
  return <span className={`brand ${light ? 'brand-light' : ''}`}>
    <span className="brand-mark"><Layers2 size={21} strokeWidth={2} /></span>
    <span>cloud<span className="font-normal">agent</span><span className="brand-dot">.</span></span>
  </span>;
}
