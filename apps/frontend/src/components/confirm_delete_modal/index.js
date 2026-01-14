import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

class ConfirmDeleteModal extends React.Component {
  render() {
    const { isOpen, okHandler, cancelHandler, message, message1, title } = this.props;

    return (
      <Dialog open={isOpen} onOpenChange={open => !open && cancelHandler()}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {title || 'Delete'}
              </DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="pt-2 text-gray-600">
              {message1 && <span className="block font-medium text-gray-900 mb-1">{message1}</span>}
              <span>
                {message ||
                  'Are you sure you want to delete this record? This action cannot be undone.'}
              </span>
            </div>
          </DialogDescription>
          <DialogFooter className="flex flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={cancelHandler}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={okHandler}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}

export default ConfirmDeleteModal;
