import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import '../../product/screens/create/style.scss';
import { data } from '../../Language/index';
import LocalizedStrings from 'react-localization';
import CreateProduct from '../../product/screens/create/screen';

const strings = new LocalizedStrings(data);

const ProductModal = props => {
  const [language] = useState(() => window.localStorage.getItem('language') || 'en');

  strings.setLanguage(language);

  const { openProductModal, closeProductModal, income, expense } = props;

  return (
    <div className="contact-modal-screen">
      <Dialog open={openProductModal} onOpenChange={closeProductModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Product</DialogTitle>
          </DialogHeader>
          <CreateProduct
            getCurrentProductData={Data => {
              props.getCurrentProduct(Data);
            }}
            closeModal={e => {
              closeProductModal(e);
            }}
            isParentComponentPresent={true}
            income={income === true ? income : false}
            expense={expense === true ? expense : false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductModal;
