import { useCallback } from 'react';
import { Button } from 'components/migration';
import { Trash2 } from 'lucide-react';

const ActionsCell = ({ row, data, setData, updateAmount, disableAll }) => {
  const onRemove = useCallback(
    e => {
      e.preventDefault();
      const newData = data.filter(obj => obj.id !== row.original.id);
      setData(newData);
      updateAmount(newData);
    },
    [data, setData, updateAmount, row.original.id]
  );

  return (
    row.original.productId !== '' && (
      <Button
        size="sm"
        className="btn-twitter btn-brand icon mt-1"
        disabled={disableAll && data && data.length === 1}
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    )
  );
};

export default ActionsCell;
