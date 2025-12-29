import { useCallback } from 'react';
import { Input } from 'components/migration';

const QuantityCell = ({ row, selectItem, getIndex }) => {
  const idx = getIndex(row.original.id);
  const onQuantityChange = useCallback(
    e => {
      selectItem(e.target.value, row.original, 'quantity', idx);
    },
    [selectItem, row.original, idx]
  );

  return (
    <div className="flex gap-1">
      <Input type="number" value={row.original.quantity || 0} onChange={onQuantityChange} />
      {row.original.productId !== '' && (
        <Input value={row.original.unitType} disabled className="w-20" />
      )}
    </div>
  );
};

export default QuantityCell;
