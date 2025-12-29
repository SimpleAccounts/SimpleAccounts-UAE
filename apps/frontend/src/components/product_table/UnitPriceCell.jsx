import { useCallback } from 'react';
import { Input } from 'components/migration';

const UnitPriceCell = ({ row, selectItem, getIndex, disableAll }) => {
  const idx = getIndex(row.original.id);
  const onUnitPriceChange = useCallback(
    e => {
      selectItem(e.target.value, row.original, 'unitPrice', idx);
    },
    [selectItem, row.original, idx]
  );

  return (
    <Input
      disabled={disableAll}
      type="number"
      value={row.original.unitPrice || 0}
      onChange={onUnitPriceChange}
    />
  );
};

export default UnitPriceCell;
