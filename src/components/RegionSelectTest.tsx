import React, { useState } from 'react';
import { RegionSelect } from './RegionSelect';

export const RegionSelectTest: React.FC = () => {
  const [region, setRegion] = useState<string | null>(null);
  return (
    <div className="max-w-md mx-auto p-8 space-y-6">
      <h2 className="text-white font-serif-title text-xl">RegionSelect test</h2>
      <RegionSelect
        value={region}
        onChange={setRegion}
        label="Region"
      />
      <div className="text-[#888888] font-['JetBrains_Mono'] text-xs">
        Selected: <span className="text-[#C5A059]">{region || '—'}</span>
      </div>
    </div>
  );
};

