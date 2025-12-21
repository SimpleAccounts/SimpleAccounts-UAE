import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import 'react-phone-input-2/lib/style.css';
import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';
import CreateContact from '../../contact/screens/create/screen';

const strings = new LocalizedStrings(data);

const CustomerModal = props => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const language = window.localStorage.getItem('language') || 'en';
  strings.setLanguage(language);

  const { openCustomerModal, closeCustomerModal } = props;

  const openConfirmation = () => {
    setShowConfirmation(true);
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
  };

  const confirmCancel = () => {
    closeCustomerModal();
    closeConfirmation();
  };

  return (
    <div className="contact-modal-screen">
      <Dialog open={openCustomerModal} onOpenChange={closeCustomerModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Customer</DialogTitle>
          </DialogHeader>
          <CreateContact
            getCurrentContactData={contactData => {
              props.getCurrentUser(contactData);
            }}
            closeModal={e => {
              closeCustomerModal(e);
            }}
            confirmCancel={() => {
              openConfirmation();
            }}
            contactType={{ label: 'Customer', value: 2 }}
            isParentComponentPresent={true}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Do you want to switch to another page?</AlertDialogTitle>
            <AlertDialogDescription>
              By doing so your current changes will get discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeConfirmation}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerModal;
