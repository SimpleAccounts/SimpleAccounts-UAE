import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

class ConfirmDeleteModal extends React.Component {
  render() {
    const { isOpen, okHandler, cancelHandler, message, message1, title } = this.props;

    return (
      <Dialog open={isOpen} onOpenChange={open => !open && cancelHandler()}>
        <DialogContent className="modal-danger">
          <DialogHeader>
            <DialogTitle>{title || 'Delete'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {message1 ? <p>{message1}</p> : null}
            {message ? <p>{message}</p> : <p>Are you sure want to delete this record?</p>}
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={okHandler}>
              Yes
            </Button>
            <Button variant="secondary" onClick={cancelHandler}>
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}

export default ConfirmDeleteModal;
