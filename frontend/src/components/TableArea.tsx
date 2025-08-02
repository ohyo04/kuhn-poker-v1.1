// frontend/src/components/TableArea.tsx
import React from 'react';

interface TableAreaProps {
  pot: number;
}

const TableArea: React.FC<TableAreaProps> = ({ pot }) => {
  return (
    <div className="bg-[#2d2a3a] border-2 border-orange-400 rounded-lg py-3 px-8 shadow-lg mx-auto">
      <p className="text-center text-sm text-gray-300 mb-1">ポット</p>
      <p className="text-center text-white text-2xl font-bold">{pot}</p>
    </div>
  );
};

export default TableArea;