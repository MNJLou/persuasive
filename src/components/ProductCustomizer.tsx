// ============================================================
// PERSUASIVE — Product customizer (Tee + Cap) — redesigned
// Backend preserved: stock loaded from /api/admin/stock, cart contract
// stays { shirtColor, embroideryColor, size, price, image } (+ display extras).
// ============================================================
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CartItem } from '../App';
import { Icon } from './persuasive/ui';
import {
  sleevedShirtColors,
  sleevelessShirtColors,
  embroideryColorsByShirt,
  shirtImagesByVariant,
  TEE_SIZES,
  teePrice,
  capColorways,
  CAP_PRICE,
  cropTopColorways,
  CROP_TOP_SIZES,
  featuredShirts,
  FeaturedShirt,
  SIZE_GUIDE,
  type ColorOption,
} from './persuasive/data';

interface ProductCustomizerProps {
  onAddToCart: (item: CartItem) => void;
}

interface StockRow { color: string; size: string; stock: number }

// ---------- Swatch ----------
function Swatch({ color, active, onClick, label }: { color: ColorOption | { name: string; value: string; border?: boolean }; active: boolean; onClick: () => void; label: string }) {
  const tickColor = (color.name === 'White' || color.value.toLowerCase() === '#ffffff' || color.border) ? '#0c0c0c' : '#fff';
  return (
    <button className="swatch" data-active={active} onClick={onClick} style={{ background: color.value }} aria-label={label} title={color.name}>
      {active && <span className="tick" style={{ color: tickColor }}><Icon.Check size={16} /></span>}
    </button>
  );
}

// ---------- Gallery with auto-cycle ----------
function Gallery({ images, bg }: { images: string[]; bg?: string }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => { setIdx(0); }, [images.join('|')]);
  useEffect(() => {
    if (paused || images.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 3000);
    return () => clearInterval(t);
  }, [images, paused]);

  if (!images.length) {
    return <div style={{ aspectRatio: '4/5', border: '1px solid var(--ink)', background: bg || 'var(--paper-2)' }} />;
  }

  return (
    <div className="stack" style={{ gap: 14 }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden', background: bg || 'var(--paper-2)', border: '1px solid var(--ink)' }}>
        {images.map((im, i) => (
          <img key={im} src={im} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: i === idx ? 1 : 0, transition: 'opacity .6s ease' }} />
        ))}
        <div style={{ position: 'absolute', left: 14, top: 14, display: 'flex', gap: 6 }}>
          {images.map((_, i) => (<span key={i} style={{ width: 22, height: 3, background: i === idx ? 'var(--ink)' : 'rgba(12,12,12,.28)' }} />))}
        </div>
        <div className="mono-sm" style={{ position: 'absolute', right: 14, bottom: 12, background: 'var(--ink)', color: '#fff', padding: '5px 9px' }}>{String(idx + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</div>
      </div>
      <div className="thumbs row" style={{ gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {images.map((im, i) => (
          <button key={im} onClick={() => setIdx(i)} style={{ flex: '0 0 auto', width: 74, height: 90, padding: 0, border: i === idx ? '1px solid var(--ink)' : '1px solid var(--line)', cursor: 'pointer', background: 'none', opacity: i === idx ? 1 : .62 }}>
            <img src={im} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </button>
        ))}
      </div>
    </div>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <div style={{ marginTop: 30, borderTop: '1px solid var(--line)' }}>
      {items.map((t, i) => (
        <div key={i} className="row" style={{ gap: 14, padding: '13px 0', borderBottom: '1px solid var(--line)' }}>
          <span className="mono-sm dim" style={{ width: 24 }}>0{i + 1}</span>
          <span style={{ fontSize: 14 }}>{t}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- TEE customizer ----------
function TeeCustomizer({ onAdd, stock }: { onAdd: (i: CartItem) => void; stock: StockRow[] }) {
  const [sleeve, setSleeve] = useState('Sleeved');
  const [shirt, setShirt] = useState(sleevedShirtColors[0]);
  const [emb, setEmb] = useState(embroideryColorsByShirt['White'][0]);
  const [size, setSize] = useState('Medium');
  const [guide, setGuide] = useState(false);

  const shirtColors = sleeve === 'Sleeved' ? sleevedShirtColors : sleevelessShirtColors;
  const embColors = embroideryColorsByShirt[shirt.name] || [];
  const images = shirtImagesByVariant[`${shirt.name}-${emb.name}`] || [];
  const price = teePrice(shirt.name);

  const getStock = (sz: string) => {
    const row = stock.find((r) => r.color === `${shirt.name}-${emb.name}` && r.size === sz);
    return row?.stock ?? 999; // unknown → unlimited (API may be unavailable)
  };
  const isOut = (sz: string) => getStock(sz) === 0;

  const changeSleeve = (s: string) => {
    setSleeve(s);
    const list = s === 'Sleeved' ? sleevedShirtColors : sleevelessShirtColors;
    const first = list[0];
    setShirt(first);
    setEmb(embroideryColorsByShirt[first.name][0]);
  };
  const changeShirt = (c: ColorOption) => {
    setShirt(c);
    const list = embroideryColorsByShirt[c.name];
    if (list && list[0]) setEmb(list[0]);
  };

  const out = isOut(size);
  const add = () => {
    onAdd({
      id: '',
      shirtColor: shirt.name,
      embroideryColor: emb.name,
      size,
      price,
      image: images[0],
      productType: 'tee',
      productName: 'Premium Cotton Tee',
      swatch: shirt.value,
      embSwatch: emb.value,
    });
    toast.success('Added to cart!', { description: `${shirt.name} tee · ${emb.name} thread` });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,0.95fr)', gap: 'clamp(28px,4vw,64px)', alignItems: 'start' }} className="cust-grid">
      <Gallery images={images} bg={shirt.value} />

      <div className="stack" style={{ gap: 0 }}>
        <div className="spread" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="mono dim" style={{ marginBottom: 12 }}>Apparel / 001</div>
            <h1 className="display" style={{ fontSize: 'clamp(32px,4.4vw,56px)' }}>Premium<br />Cotton Tee</h1>
          </div>
          <div className="display" style={{ fontSize: 34, whiteSpace: 'nowrap' }}>R{price.toFixed(0)}</div>
        </div>

        <div className="tag" style={{ alignSelf: 'flex-start', marginTop: 18, borderColor: 'var(--ink)' }}><Icon.Truck size={14} /> Buy 2 — Free shipping</div>

        <p style={{ color: 'var(--muted)', fontSize: 15, marginTop: 22, maxWidth: 460 }}>
          Heavyweight 100% organic cotton, embroidered to order. Pick your shirt colour and thread to make it uniquely yours.
        </p>

        <hr className="rule" style={{ margin: '30px 0' }} />

        {/* Sleeve */}
        <label className="field-label">Sleeve — <span style={{ color: 'var(--ink)' }}>{sleeve}</span></label>
        <div className="seg" style={{ alignSelf: 'flex-start', marginBottom: 28 }}>
          <button data-active={sleeve === 'Sleeved'} onClick={() => changeSleeve('Sleeved')}>Sleeved · R550</button>
          <button data-active={sleeve === 'Sleeveless'} onClick={() => changeSleeve('Sleeveless')}>Sleeveless · R450</button>
        </div>

        {/* Shirt colour */}
        <label className="field-label">Shirt colour — <span style={{ color: 'var(--ink)' }}>{shirt.name.replace(' Sleeveless', '')}</span></label>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
          {shirtColors.map((c) => <Swatch key={c.name} color={c} active={shirt.name === c.name} onClick={() => changeShirt(c)} label={c.name} />)}
        </div>

        {/* Embroidery */}
        <label className="field-label">Thread colour — <span style={{ color: 'var(--ink)' }}>{emb.name}</span></label>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
          {embColors.map((c) => <Swatch key={c.name} color={c} active={emb.name === c.name} onClick={() => setEmb(c)} label={c.name} />)}
        </div>

        {/* Size */}
        <div className="spread" style={{ marginBottom: 10 }}>
          <label className="field-label" style={{ margin: 0 }}>Size — <span style={{ color: 'var(--ink)' }}>{size}</span></label>
          <button className="navlink" onClick={() => setGuide(true)}>Size guide</button>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {TEE_SIZES.map((s) => {
            const so = isOut(s);
            return (
              <button key={s} onClick={() => !so && setSize(s)} disabled={so}
                style={{ minWidth: 54, padding: '13px 14px', border: '1px solid var(--ink)', background: size === s ? 'var(--ink)' : 'transparent', color: size === s ? '#fff' : 'var(--ink)', cursor: so ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em', opacity: so ? 0.32 : 1, textDecoration: so ? 'line-through' : 'none', position: 'relative' }}>
                {s}
              </button>
            );
          })}
        </div>

        <button className="btn btn-block btn-lg" onClick={add} disabled={out}>
          {out ? 'Out of stock' : <>Add to cart — R{price.toFixed(0)} <Icon.Arrow className="arrow" /></>}
        </button>

        <FeatureList items={['100% organic cotton', 'Custom embroidery', 'Pre-shrunk fabric', 'Unisex oversized fit', 'Machine washable']} />
      </div>

      {guide && (
        <div className="modal-back" onClick={() => setGuide(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-x" onClick={() => setGuide(false)}><Icon.Close size={15} /></button>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--ink)' }}><span className="mono">Size guide</span></div>
            <img src={SIZE_GUIDE} alt="Size guide" style={{ width: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- CAP customizer ----------
function CapCustomizer({ onAdd }: { onAdd: (i: CartItem) => void }) {
  const [way, setWay] = useState(capColorways[0]);
  const emb = way.embroidery;
  const add = () => {
    onAdd({
      id: '',
      shirtColor: way.key,
      embroideryColor: emb.name,
      size: 'One Size',
      price: CAP_PRICE,
      image: way.images[0],
      productType: 'cap',
      productName: 'Cap',
      swatch: way.value,
      embSwatch: emb.value,
    });
    toast.success('Added to cart!', { description: `${way.name} cap · ${emb.name} thread` });
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,0.95fr)', gap: 'clamp(28px,4vw,64px)', alignItems: 'start' }} className="cust-grid">
      <Gallery images={way.images} bg={way.key === 'Black' ? '#0c0c0c' : 'var(--paper-2)'} />

      <div className="stack" style={{ gap: 0 }}>
        <div className="spread" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="mono dim" style={{ marginBottom: 12 }}>Headwear / 002 — New</div>
            <h1 className="display" style={{ fontSize: 'clamp(32px,4.4vw,56px)' }}>Cap</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="display" style={{ fontSize: 34, whiteSpace: 'nowrap' }}>R{CAP_PRICE.toFixed(0)}</div>
            <div className="mono" style={{ fontSize: 13, color: 'var(--accent)', marginTop: 4, whiteSpace: 'nowrap' }}>34% off</div>
          </div>
        </div>

        <div className="tag" style={{ alignSelf: 'flex-start', marginTop: 18, borderColor: 'var(--ink)' }}><Icon.Truck size={14} /> Buy 2 — Free shipping</div>

        <p style={{ color: 'var(--muted)', fontSize: 15, marginTop: 22, maxWidth: 460 }}>
          Structured foam front with a breathable mesh back and a stacked PER·SUA·SIVE embroidery. Adjustable snapback, one size fits most.
        </p>

        <hr className="rule" style={{ margin: '30px 0' }} />

        {/* Colourway */}
        <label className="field-label">Colourway — <span style={{ color: 'var(--ink)' }}>{way.name}</span></label>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
          {capColorways.map((c) => <Swatch key={c.key} color={c} active={way.key === c.key} onClick={() => setWay(c)} label={c.name} />)}
        </div>

        {/* Thread (fixed per colourway) */}
        <label className="field-label">Thread colour — <span style={{ color: 'var(--ink)' }}>{emb.name}</span></label>
        <div className="row" style={{ gap: 12, alignItems: 'center', marginBottom: 28 }}>
          <span className="swatch" data-active="true" style={{ background: emb.value, cursor: 'default' }}></span>
          <span className="mono dim">Matched to colourway</span>
        </div>

        {/* Size */}
        <label className="field-label">Size</label>
        <div className="seg" style={{ alignSelf: 'flex-start', marginBottom: 32 }}>
          <button data-active={true} style={{ cursor: 'default' }}>One Size · Snapback</button>
        </div>

        <button className="btn btn-block btn-lg" onClick={add}>Add to cart — R{CAP_PRICE.toFixed(0)} <Icon.Arrow className="arrow" /></button>

        <FeatureList items={['Foam front, mesh back', 'Embroidered PER·SUA·SIVE', 'Curved brim', 'Adjustable snapback', 'One size fits most']} />
      </div>
    </div>
  );
}

// ---------- CROP TOP customizer ----------
function CropTopCustomizer({ onAdd }: { onAdd: (i: CartItem) => void }) {
  const [way, setWay] = useState(cropTopColorways[0]);
  const [size, setSize] = useState('Medium');
  const emb = way.embroidery;
  const add = () => {
    onAdd({
      id: '',
      shirtColor: way.key,
      embroideryColor: emb.name,
      size,
      price: way.price,
      image: way.images[0],
      productType: 'croptop',
      productName: way.productName,
      swatch: way.value,
      embSwatch: emb.value,
    });
    toast.success('Added to cart!', { description: `${way.productName} · ${way.name} / ${emb.name} thread · ${size}` });
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,0.95fr)', gap: 'clamp(28px,4vw,64px)', alignItems: 'start' }} className="cust-grid">
      <Gallery images={way.images} bg={way.key === 'Black' ? '#0c0c0c' : 'var(--paper-2)'} />

      <div className="stack" style={{ gap: 0 }}>
        <div className="spread" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="mono dim" style={{ marginBottom: 12 }}>Apparel / 003 — New</div>
            <h1 className="display" style={{ fontSize: 'clamp(32px,4.4vw,56px)' }}>{way.productName}</h1>
          </div>
          <div className="display" style={{ fontSize: 34, whiteSpace: 'nowrap' }}>R{way.price.toFixed(0)}</div>
        </div>

        <div className="tag" style={{ alignSelf: 'flex-start', marginTop: 18, borderColor: 'var(--ink)' }}><Icon.Truck size={14} /> Buy 2 — Free shipping</div>

        <p style={{ color: 'var(--muted)', fontSize: 15, marginTop: 22, maxWidth: 460 }}>
          Cropped fit in heavyweight cotton with signature PER·SUA·SIVE embroidery. Pick your colourway — pink thread throughout.
        </p>

        <hr className="rule" style={{ margin: '30px 0' }} />

        {/* Colourway */}
        <label className="field-label">Colourway — <span style={{ color: 'var(--ink)' }}>{way.name}</span></label>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
          {cropTopColorways.map((c) => <Swatch key={c.key} color={c} active={way.key === c.key} onClick={() => setWay(c)} label={c.name} />)}
        </div>

        {/* Thread (fixed per colourway) */}
        <label className="field-label">Thread colour — <span style={{ color: 'var(--ink)' }}>{emb.name}</span></label>
        <div className="row" style={{ gap: 12, alignItems: 'center', marginBottom: 28 }}>
          <span className="swatch" data-active="true" style={{ background: emb.value, cursor: 'default' }}></span>
          <span className="mono dim">Matched to colourway</span>
        </div>

        {/* Size */}
        <label className="field-label" style={{ marginBottom: 10 }}>Size — <span style={{ color: 'var(--ink)' }}>{size}</span></label>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {CROP_TOP_SIZES.map((s) => (
            <button key={s} onClick={() => setSize(s)}
              style={{ minWidth: 54, padding: '13px 14px', border: '1px solid var(--ink)', background: size === s ? 'var(--ink)' : 'transparent', color: size === s ? '#fff' : 'var(--ink)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em' }}>
              {s}
            </button>
          ))}
        </div>

        <button className="btn btn-block btn-lg" onClick={add}>Add to cart — R{way.price.toFixed(0)} <Icon.Arrow className="arrow" /></button>

        <FeatureList items={['Heavyweight cotton', 'Embroidered PER·SUA·SIVE', 'Cropped fit', 'Pink thread', 'Machine washable']} />
      </div>
    </div>
  );
}

// ---------- FEATURED shirt customizer (Delusional / Angel) ----------
function FeaturedShirtCustomizer({ shirt, onAdd }: { shirt: FeaturedShirt; onAdd: (i: CartItem) => void }) {
  const [size, setSize] = useState('Medium');
  const add = () => {
    onAdd({
      id: '',
      shirtColor: shirt.key,
      embroideryColor: shirt.print.name,
      size,
      price: shirt.price,
      image: shirt.images[0],
      productType: 'featured',
      productName: shirt.productName,
      swatch: shirt.value,
      embSwatch: shirt.print.value,
    });
    toast.success('Added to cart!', { description: `${shirt.productName} · ${shirt.colorName} · ${size}` });
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,0.95fr)', gap: 'clamp(28px,4vw,64px)', alignItems: 'start' }} className="cust-grid">
      <Gallery images={shirt.images} bg="var(--paper-2)" />

      <div className="stack" style={{ gap: 0 }}>
        <div className="spread" style={{ alignItems: 'flex-start' }}>
          <div>
            <div className="mono dim" style={{ marginBottom: 12 }}>Apparel — New</div>
            <h1 className="display" style={{ fontSize: 'clamp(32px,4.4vw,56px)' }}>{shirt.productName}</h1>
          </div>
          <div className="display" style={{ fontSize: 34, whiteSpace: 'nowrap' }}>R{shirt.price.toFixed(0)}</div>
        </div>

        <div className="tag" style={{ alignSelf: 'flex-start', marginTop: 18, borderColor: 'var(--ink)' }}><Icon.Truck size={14} /> Buy 2 — Free shipping</div>

        <p style={{ color: 'var(--muted)', fontSize: 15, marginTop: 22, maxWidth: 460 }}>{shirt.blurb}</p>

        <hr className="rule" style={{ margin: '30px 0' }} />

        <label className="field-label">Colour — <span style={{ color: 'var(--ink)' }}>{shirt.colorName}</span></label>
        <div className="row" style={{ gap: 12, alignItems: 'center', marginBottom: 28 }}>
          <span className="swatch" data-active="true" style={{ background: shirt.value, cursor: 'default' }}></span>
          <span className="mono dim">Only colourway</span>
        </div>

        <label className="field-label" style={{ marginBottom: 10 }}>Size — <span style={{ color: 'var(--ink)' }}>{size}</span></label>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {TEE_SIZES.map((s) => (
            <button key={s} onClick={() => setSize(s)}
              style={{ minWidth: 54, padding: '13px 14px', border: '1px solid var(--ink)', background: size === s ? 'var(--ink)' : 'transparent', color: size === s ? '#fff' : 'var(--ink)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em' }}>
              {s}
            </button>
          ))}
        </div>

        <button className="btn btn-block btn-lg" onClick={add}>Add to cart — R{shirt.price.toFixed(0)} <Icon.Arrow className="arrow" /></button>

        <FeatureList items={shirt.features} />
      </div>
    </div>
  );
}

// ---------- Wrapper with product switcher ----------
export function ProductCustomizer({ onAddToCart }: ProductCustomizerProps) {
  const [tab, setTab] = useState<string>('tee');
  const [stock, setStock] = useState<StockRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/stock');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setStock(data.stock || []);
        }
      } catch (err) {
        console.error('Failed to load stock:', err);
        // leave stock empty → all sizes treated as available
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="psv">
      <div style={{ borderBottom: '1px solid var(--line)', background: 'var(--paper)', position: 'sticky', top: 70, zIndex: 30 }}>
        <div className="wrap row" style={{ gap: 0, height: 56 }}>
          <button className="prodtab" data-active={tab === 'tee'} onClick={() => setTab('tee')}>
            <span className="mono">Cotton Tee</span><span className="mono-sm dim">R550</span>
          </button>
          <button className="prodtab" data-active={tab === 'cap'} onClick={() => setTab('cap')}>
            <span className="mono">Cap</span><span className="mono-sm" style={{ color: 'var(--accent)' }}>New · R150</span>
          </button>
          <button className="prodtab" data-active={tab === 'croptop'} onClick={() => setTab('croptop')}>
            <span className="mono">Crop Top</span><span className="mono-sm" style={{ color: 'var(--accent)' }}>New · From R400</span>
          </button>
          {featuredShirts.map((f) => (
            <button key={f.id} className="prodtab" data-active={tab === f.id} onClick={() => setTab(f.id)}>
              <span className="mono">{f.tabLabel}</span><span className="mono-sm" style={{ color: 'var(--accent)' }}>New · R{f.price.toFixed(0)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="wrap section" style={{ paddingTop: 'clamp(36px,5vw,64px)', paddingBottom: 'clamp(48px,7vw,96px)' }}>
        {tab === 'tee' && <TeeCustomizer onAdd={onAddToCart} stock={stock} />}
        {tab === 'cap' && <CapCustomizer onAdd={onAddToCart} />}
        {tab === 'croptop' && <CropTopCustomizer onAdd={onAddToCart} />}
        {featuredShirts.filter((f) => f.id === tab).map((f) => <FeaturedShirtCustomizer key={f.id} shirt={f} onAdd={onAddToCart} />)}
      </div>
    </div>
  );
}
