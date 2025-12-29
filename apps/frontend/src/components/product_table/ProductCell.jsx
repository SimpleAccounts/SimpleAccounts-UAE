import { useCallback } from 'react';
import Select from 'react-select';
import { Textarea } from '@/components/ui/textarea';
import { optionFactory, selectOptionsFactory } from 'utils';

const ProductCell = ({ row, product_list, disableAll, selectItem, getIndex }) => {
  const idx = getIndex(row.original.id);
  const onProductChange = useCallback(e => {
    if (e && e.label !== 'Select Product') {
      // productValue logic ...
    }
  }, []);

  const onDescriptionChange = useCallback(
    e => {
      selectItem(e.target.value, row.original, 'description', idx);
    },
    [selectItem, row.original, idx]
  );

  return (
    <div className="flex flex-col gap-1">
      <Select
        isDisabled={disableAll}
        options={
          product_list ? optionFactory.renderOptions('name', 'id', product_list, 'Product') : []
        }
        value={
          product_list &&
          selectOptionsFactory
            .renderOptions('name', 'id', product_list, 'Product')
            .find(opt => opt.value === +row.original.productId)
        }
        onChange={onProductChange}
      />
      {row.original.productId !== '' && (
        <Textarea
          value={row.original.description || ''}
          disabled={disableAll}
          onChange={onDescriptionChange}
        />
      )}
    </div>
  );
};

export default ProductCell;
