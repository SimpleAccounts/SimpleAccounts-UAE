import React from 'react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/**
 * Modern Invoice Additional Information Component
 * Uses shadcn/ui components
 */
function InvoiceAdditionalNotesInformation(props) {
  const {
    onChange,
    notesValue,
    notesLabel,
    notesPlaceholder,
    referenceNumberLabel,
    referenceNumberPlaceholder,
    referenceNumberValue,
    referenceNumber,
    notes,
    footNote,
    footNoteValue,
    footNotePlaceholder,
    footNoteLabel,
  } = props;

  return (
    <>
      {/* Reference Number */}
      {referenceNumber && (
        <div className="lg:col-span-7">
          <div className="mb-3">
            <Label htmlFor="receiptNumber" className="mb-2 block">
              {referenceNumberLabel}
            </Label>
            <Input
              type="text"
              maxLength={20}
              id="receiptNumber"
              name="receiptNumber"
              value={referenceNumberValue || ''}
              placeholder={referenceNumberPlaceholder}
              onChange={(e) => {
                onChange('receiptNumber', e);
              }}
              className="input-transition"
            />
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="lg:col-span-7">
          <div className="py-2">
            <Label htmlFor="notes" className="mb-2 block">
              {notesLabel}
            </Label>
            <Textarea
              id="notes"
              name="notes"
              maxLength={255}
              rows={4}
              placeholder={notesPlaceholder}
              value={notesValue || ''}
              onChange={(e) => onChange('notes', e)}
              className="input-transition"
            />
          </div>
        </div>
      )}

      {/* Foot Note */}
      {footNote && (
        <div className="lg:col-span-7">
          <div className="mb-3">
            <Label htmlFor="footNote" className="mb-2 block">
              {footNoteLabel}
            </Label>
            <Textarea
              id="footNote"
              name="footNote"
              maxLength={255}
              rows={4}
              placeholder={footNotePlaceholder}
              value={footNoteValue || ''}
              onChange={(e) => onChange('footNote', e)}
              className="input-transition"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default InvoiceAdditionalNotesInformation;
