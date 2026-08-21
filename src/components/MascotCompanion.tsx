import { X } from "lucide-react";
import { Mascot, mascots } from "../config/mascots";

export function MascotCompanion({ mascot, onOpen }: { mascot: Mascot; onOpen: () => void }) {
  return <button className="mascot-companion" onClick={onOpen} aria-label={`認識角色夥伴 ${mascot.name}`}>
    <img src={mascot.image} alt={mascot.animal} />
    <span><small>{mascot.feature}</small><strong>{mascot.name}</strong><em>{mascot.message}</em></span>
  </button>;
}

export function MascotGallery({ onClose }: { onClose: () => void }) {
  return <div className="modal-back mascot-gallery-back" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal mascot-gallery" role="dialog" aria-modal="true" aria-labelledby="mascot-gallery-title">
      <div className="modal-head"><div><span className="kicker">灣DAY CHARACTERS</span><h2 id="mascot-gallery-title">認識你的角色夥伴</h2><p>每位台灣動物夥伴，會在最擅長的功能陪你一起前進。</p></div><button onClick={onClose} aria-label="關閉"><X /></button></div>
      <div className="mascot-grid">{mascots.map((mascot) => <article key={mascot.name}>
        <div className="mascot-portrait"><img src={mascot.image} alt={mascot.animal} /></div>
        <div><span>{mascot.food}</span><h3>{mascot.name}<small>{mascot.animal}</small></h3><b>{mascot.feature}</b><p>{mascot.personality}</p><blockquote>{mascot.message}</blockquote></div>
      </article>)}</div>
    </section>
  </div>;
}
