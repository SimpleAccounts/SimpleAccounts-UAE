import { useCallback } from 'react';
import { Input } from 'components/migration';
import Select from 'react-select';

const DiscountCell = ({ row, selectItem, getIndex, disableAll, discountOptions }) => {
  const idx = getIndex(row.original.id);
  const onDiscountChange = useCallback(
    e => {
      selectItem(e.target.value, row.original, 'discount', idx);
    },
    [selectItem, row.original, idx]
  );

  const onDiscountTypeChange = useCallback(
    e => {
      selectItem(e.value, row.original, 'discountType', idx);
    },
    [selectItem, row.original, idx]
  );

  return (
    <div className="flex flex-col gap-1">
      <Input disabled={disableAll} value={row.original.discount || 0} onChange={onDiscountChange} />
      <Select
        isDisabled={disableAll}
        options={discountOptions}
        value={discountOptions.find(opt => opt.value === row.original.discountType)}
        onChange={onDiscountTypeChange}
      />
    </div>
  );
};

export default DiscountCell;
