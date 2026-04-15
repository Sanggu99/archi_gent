import React from 'react';

const snapshots = [
  { id: 1, name: 'Perspective', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 2, name: 'Elevation', img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 3, name: 'Section', img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=200&h=200' },
];

export function VariantSnapshots() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {snapshots.map((snap) => (
        <div key={snap.id} className="group cursor-pointer flex flex-col gap-1.5">
          <div className="aspect-square rounded-md overflow-hidden border border-white/10 relative bg-[#222]">
            <img 
              src={snap.img} 
              alt={snap.name} 
              className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity duration-300 mix-blend-luminosity group-hover:mix-blend-normal"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent opacity-80"></div>
          </div>
          <p className="text-[9px] text-center text-white/50 uppercase tracking-wider group-hover:text-white/90 transition-colors">{snap.name}</p>
        </div>
      ))}
    </div>
  );
}
