import React from 'react';
import { FormGroup, Input, Label, Col } from 'components/migration';

function InvoiceAdditionaNotesInformation(props) {
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
      {referenceNumber && (
        <Col lg={7}>
          <FormGroup className="mb-3">
            <Label htmlFor="receiptNumber">{referenceNumberLabel}</Label>
            <Input
              type="text"
              maxLength="20"
              id="receiptNumber"
              name="receiptNumber"
              value={referenceNumberValue ?? ''}
              placeholder={referenceNumberPlaceholder}
              onChange={value => {
                onChange('receiptNumber', value);
              }}
            />
          </FormGroup>
        </Col>
      )}
      {notes && (
        <Col lg={7}>
          <FormGroup className="py-2">
            <Label htmlFor="notes">{notesLabel}</Label>
            <br />
            <Input
              type="textarea"
              //style={{ width: "500px" }}
              className="textarea"
              maxLength={255}
              name="notes"
              id="notes"
              rows="4"
              placeholder={notesPlaceholder}
              onChange={option => onChange('notes', option)}
              value={notesValue ?? ''}
            />
          </FormGroup>
        </Col>
      )}
      {footNote && (
        <Col lg={7}>
          <FormGroup className="mb-3">
            <Label htmlFor="footNote">{footNoteLabel}</Label>
            <br />
            <Input
              type="textarea"
              className="textarea"
              maxLength={255}
              name="footNote"
              id="footNote"
              rows={4}
              placeholder={footNotePlaceholder}
              onChange={option => onChange('footNote', option)}
              value={footNoteValue ?? ''}
            />
          </FormGroup>
        </Col>
      )}
    </>
  );
}

export default InvoiceAdditionaNotesInformation;
