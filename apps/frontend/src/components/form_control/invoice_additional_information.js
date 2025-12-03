import React from 'react';
import {
    FormGroup,
    Input,
    Label,
    Col,
} from 'reactstrap';
import { TextField } from '@material-ui/core';

function InvoiceAdditionaNotesInformation(props) {
    const { onChange, notesValue, notesLabel, notesPlaceholder, referenceNumberLabel, referenceNumberPlaceholder, referenceNumberValue,
        referenceNumber,
        notes,
        footNote,
        footNoteValue,
        footNotePlaceholder,
        footNoteLabel } = props;
    return (
        <>
            {referenceNumber &&
                <Col lg={7}>
                    <FormGroup className="mb-3">
                        <Label htmlFor="receiptNumber">
                            {referenceNumberLabel}
                        </Label>
                        <Input
                            type="text"
                            maxLength="20"
                            id="receiptNumber"
                            name="receiptNumber"
                            value={referenceNumberValue ?? ''}
                            placeholder={referenceNumberPlaceholder}
                            onChange={(value) => {
                                onChange('receiptNumber', value);

                            }}
                        />
                    </FormGroup>
                </Col>
            }
            {notes &&
                <Col lg={7}>
                    <FormGroup className="py-2">
                        <Label htmlFor="notes">{notesLabel}</Label><br />
                        <TextField
                            type="textarea"
                            //style={{ width: "500px" }}
                            className="textarea"
                            inputProps={{ maxLength: 255 }}
                            multiline
                            name="notes"
                            id="notes"
                            maxRows="4"
                            placeholder={notesPlaceholder}
                            onChange={(option) =>
                                onChange('notes', option)
                            }
                            value={notesValue ?? ''}
                        />
                    </FormGroup>
                </Col>
            }
            {footNote &&
                <Col lg={7}>
                    <FormGroup className="mb-3">
                        <Label htmlFor="footNote">
                            {footNoteLabel}
                        </Label>
                        <br />
                        <TextField
                            type="textarea"
                            className="textarea"
                            inputProps={{ maxLength: 255 }}
                            name="footNote"
                            id="footNote"
                            maxRows={4}
                            multiline
                            placeholder={footNotePlaceholder}
                            onChange={(option) =>
                                onChange('footNote', option)
                            }
                            value={footNoteValue ?? ''}
                        />
                    </FormGroup>
                </Col>
            }
        </>
    )
}

export default InvoiceAdditionaNotesInformation;
