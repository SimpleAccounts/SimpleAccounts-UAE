import { useCallback } from 'react';
import Select from 'react-select';

const VatCell = ({ row, selectItem, getIndex, vat_list }) => {
  const idx = getIndex(row.original.id);
  const onVatChange = useCallback(
    e => {
      selectItem(e.value, row.original, 'vatCategoryId', idx);
    },
    [selectItem, row.original, idx]
  );

  return (
    <Select
      options={vat_list}
      value={vat_list.find(opt => opt.value === parseInt(row.original.vatCategoryId))}
      onChange={onVatChange}
    />
  );
};

export default VatCell;
