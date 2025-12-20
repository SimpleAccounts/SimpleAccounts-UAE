import React, { useState, useEffect, useRef } from 'react';
import {
    Button,
    Row,
    Col,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    CardHeader,
    ModalBody,
    ModalFooter,
} from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { ReactMultiEmail } from 'react-multi-email';
import 'react-multi-email/dist/style.css';
import { Checkbox } from '@/components/ui/checkbox';
import './style.scss';
import { connect } from 'react-redux';
import { data } from 'screens/Language/index';
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

// Zod validation schema
const emailSchema = z.object({
    to_emails: z.array(z.string().email()).optional(),
    cc_emails: z.array(z.string().email()).optional(),
    bcc_emails: z.array(z.string().email()).optional(),
    subject: z.string().optional(),
    message: z.string().optional(),
    attachmentFile: z.any().optional(),
});

const EmailPopUpModal = ({ 
    openEmailModal,
    removeDialog,
    currentEntityEmailDetails,
    sendCustomEmail,
    updateChange,
    id,
}) => {
    const [language] = useState(window['localStorage'].getItem('language'));
    const [loading, setLoading] = useState(false);
    const [addBcc, setAddBcc] = useState(false);
    const [attach, setAttach] = useState(true);
    const [focused, setFocused] = useState(false);
    const [pdfFiles, setPdfFiles] = useState([]);
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [localEmailDetails, setLocalEmailDetails] = useState({});

    const uploadFileRef = useRef(null);
    const toEmailError = useRef(0);
    const CCEmailError = useRef(0);
    const BCCEmailError = useRef(0);

    const allowedKeys = useRef(['Backspace']);

    useEffect(() => {
        // Add alphabets, numbers, and special characters to the allowedKeys array
        const keys = ['Backspace'];
        for (let i = 33; i <= 126; i++) {
            if (i !== 46) keys.push(String.fromCharCode(i));
        }
        allowedKeys.current = keys;
    }, []);

    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
        trigger,
    } = useForm({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            to_emails: currentEntityEmailDetails?.billingEmail ? [currentEntityEmailDetails.billingEmail] : [],
            cc_emails: currentEntityEmailDetails?.cc_emails || [],
            bcc_emails: currentEntityEmailDetails?.bcc_emails || [],
            subject: currentEntityEmailDetails?.subject || '',
            message: currentEntityEmailDetails?.message || '',
            attachmentFile: null,
        },
    });

    useEffect(() => {
        if (currentEntityEmailDetails) {
            setLocalEmailDetails(currentEntityEmailDetails);
            reset({
                to_emails: currentEntityEmailDetails.billingEmail ? [currentEntityEmailDetails.billingEmail] : [],
                cc_emails: currentEntityEmailDetails.cc_emails || [],
                bcc_emails: currentEntityEmailDetails.bcc_emails || [],
                subject: currentEntityEmailDetails.subject || '',
                message: currentEntityEmailDetails.message || '',
            });
        }
    }, [currentEntityEmailDetails, reset]);

    const onSubmit = (data) => {
        let payload = { ...localEmailDetails };
        payload.id = id;
        payload.attachmentFiles = pdfFiles;
        payload.message = payload.message.replace(/\n/g, '<p></p>\n');
        payload.cc_emails = data.cc_emails;
        payload.bcc_emails = data.bcc_emails;
        payload.emailContent = payload.contentPrefix + payload.message + payload.contentSufix;

        const formData = new FormData();
        formData.append('attachPrimaryPdf', attach);

        if (pdfFiles) {
            for (let i = 0; i < pdfFiles.length; i++) {
                formData.append('pdfFilesData', pdfFiles[i]);
            }
        }

        if (attachmentFile) {
            for (let i = 0; i < attachmentFile.length; i++) {
                formData.append('attachmentFiles', attachmentFile[i]);
            }
        }

        formData.append('id', id);
        formData.append('type', payload.type);
        data.cc_emails && formData.append('cc_emails', data.cc_emails);
        data.bcc_emails && formData.append('bcc_emails', data.bcc_emails);
        formData.append('subject', payload.subject);
        formData.append('message', payload.message.replace(/\n\n/g, '<p></p>\n'));
        formData.append('pdfBody', payload.pdfBody);
        formData.append('billingEmail', payload.billingEmail);
        formData.append('to_emails', payload.billingEmail);
        formData.append('emailContent', payload.contentPrefix + payload.message + payload.contentSufix);
        formData.append('fromEmailAddress', payload.fromEmailAddress);
        formData.append('fromEmailName', payload.fromEmailName);

        if (payload.postingRequestModel) {
            formData.append('amount', payload.postingRequestModel.amount);
            formData.append('postingRefId', payload.postingRequestModel.postingRefId);
            formData.append('postingRefType', payload.postingRequestModel.postingRefType);
            formData.append('amountInWords', payload.postingRequestModel.amountInWords);
            formData.append('vatInWords', payload.postingRequestModel.vatInWords);
            formData.append('markAsSent', payload.postingRequestModel.markAsSent);
        }

        sendCustomEmail(formData);
        setLocalEmailDetails({});
        setAttach(true);
        setAttachmentFile(null);
        updateChange({});
    };

    const handleFileChange = (e) => {
        e.preventDefault();
        const maxFileSizeBytes = 120 * 1024 * 1024; // Convert to bytes

        let filecheck = e.target.files[0];
        let newPdfFiles = [...pdfFiles];
        const alreadyExistingFiles = attachmentFile ?? [];
        let totalSize = alreadyExistingFiles.reduce((acc, file) => acc + file.size, 0);

        if (filecheck) {
            let files = e.target.files;
            let promises = [];

            if (files && files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    totalSize += files[i].size;

                    if (totalSize > maxFileSizeBytes) {
                        alert('The total file size exceeds the 120MB limit. Please select smaller files.');
                        return;
                    }

                    let reader = new FileReader();
                    let promise = new Promise((resolve, reject) => {
                        reader.onload = (evt) => {
                            const bstr = evt.target.result;
                            resolve(reader.result);
                        };
                        reader.onerror = (evt) => {
                            reject(evt);
                        };
                        reader.readAsBinaryString(files[i]);
                    });
                    promises.push(promise);
                }

                Promise.all(promises)
                    .then((results) => {
                        for (let i = 0; i < results.length; i++) {
                            if (results[i]) {
                                newPdfFiles.push(results[i].toString());
                            }
                        }
                        setValue('attachmentFile', [...files, ...alreadyExistingFiles], { shouldValidate: true });
                        setAttachmentFile([...files, ...alreadyExistingFiles]);
                        setPdfFiles(newPdfFiles);
                    })
                    .catch((err) => {
                        console.log('Error reading file:', err);
                    });
            }
        }
    };

    const handlekeyPress = (label, value) => {
        if (label === 'to_emails') {
            let error = toEmailError.current;
            if (value === 'Backspace') error = error === 0 ? 0 : error - 1;
            else error = error + 1;
            toEmailError.current = error;
        } else if (label === 'bcc_emails') {
            let error = BCCEmailError.current;
            if (value === 'Backspace') error = error === 0 ? 0 : error - 1;
            else error = error + 1;
            BCCEmailError.current = error;
        } else if (label === 'cc_emails') {
            let error = CCEmailError.current;
            if (value === 'Backspace') error = error === 0 ? 0 : error - 1;
            else error = error + 1;
            CCEmailError.current = error;
        }
    };

    const updateState = (e, label, value) => {
        label !== 'to_emails' && e.preventDefault();

        let updatedDetails = { ...localEmailDetails };
        switch (label) {
            case 'subject':
                updatedDetails.subject = value;
                setLocalEmailDetails(updatedDetails);
                setValue('subject', value, { shouldValidate: true });
                break;

            case 'mailTo':
                updatedDetails.billingEmail = value;
                setLocalEmailDetails(updatedDetails);
                setValue('mailTo', value, { shouldValidate: true });
                break;

            case 'to_emails':
                updatedDetails.billingEmail = value;
                setLocalEmailDetails(updatedDetails);
                setValue('to_emails', value, { shouldValidate: true });
                break;

            default:
                break;
        }
        updateChange(updatedDetails);
    };

    const DisplayFilesComponent = (Files) => {
        return (
            <div className="react-multi-email">
                <div className="data-labels" style={{ opacity: 1, display: 'contents', flexWrap: 'inherit' }}>
                    {Files.map((data, index) => {
                        return (
                            <div data-tag="true" key={index}>
                                <div data-tag-item="true">{data.name}</div>
                                <span
                                    data-tag-handle="true"
                                    onClick={() => {
                                        let newFiles = [];
                                        Files.forEach((fileData, i) => {
                                            if (index !== i) newFiles.push(fileData);
                                        });
                                        if (newFiles.length === 0) {
                                            setValue('attachmentFile', newFiles, { shouldValidate: true });
                                            var input = document.getElementById('fileInput');

                                            input.onclick = function () {
                                                this.value = null;
                                            };

                                            input.onchange = function () {
                                                console.log(this.value);
                                            };
                                        }
                                        setAttachmentFile(newFiles);
                                    }}
                                >
                                    ×
                                </span>
                            </div>
                        );
                    })}
                </div>
                <input type="text" value="" style={{ opacity: 1 }} readOnly />
            </div>
        );
    };

    const validateEmails = () => {
        let errors = {};

        if (toEmailError.current > 0) {
            errors.mailTo = strings.InValidEmailAddress;
        } else if (!localEmailDetails.billingEmail) {
            errors.mailTo = strings.ValidEmailAddressIsRequired;
        }

        if (CCEmailError.current > 0) {
            errors.cc_emails = strings.InValidEmailAddress;
        }

        if (BCCEmailError.current > 0) {
            errors.bcc_emails = strings.InValidEmailAddress;
        }

        return Object.keys(errors).length === 0;
    };

    strings.setLanguage(language);

    return (
        <div className="contact-modal-screen">
            <Modal isOpen={openEmailModal} className="modal-success contact-modal">
                <Form
                    name="simpleForm"
                    onSubmit={handleSubmit((data) => {
                        if (validateEmails()) {
                            onSubmit(data);
                        }
                    })}
                    className="create-contact-screen"
                >
                    <CardHeader>
                        <Row>
                            <Col lg={12}>
                                <div className="h4 mb-0 d-flex align-items-center">
                                    <i className="nav-icon fas fa-id-card-alt" />
                                    <span className="ml-2">Send This Email</span>
                                </div>
                            </Col>
                        </Row>
                    </CardHeader>
                    <ModalBody>
                        <Row className="row-rapper">
                            <Col>
                                <FormGroup>
                                    <Row>
                                        <Col sm="2">
                                            <Label htmlFor="from">From</Label>
                                        </Col>
                                        <Col sm="4" className="pull-left">
                                            <Input
                                                disabled
                                                type="text"
                                                id="from"
                                                name="from"
                                                placeholder="From"
                                                value={currentEntityEmailDetails.fromEmailAddress || ''}
                                            />
                                        </Col>
                                    </Row>
                                </FormGroup>
                                <FormGroup>
                                    <Row>
                                        <Col sm="2">
                                            <Label htmlFor="mailTo">
                                                <span className="text-danger">* </span>To
                                            </Label>
                                        </Col>
                                        <Col sm="9">
                                            <Controller
                                                name="to_emails"
                                                control={control}
                                                render={({ field }) => (
                                                    <>
                                                        <ReactMultiEmail
                                                            id="to_emails"
                                                            name="to_emails"
                                                            placeholder="Input your email"
                                                            emails={currentEntityEmailDetails.billingEmail ? [currentEntityEmailDetails.billingEmail] : []}
                                                            onChange={(_to_emails) => {
                                                                toEmailError.current = 0;
                                                                field.onChange(_to_emails);
                                                                updateState(
                                                                    { preventDefault: () => {} },
                                                                    'to_emails',
                                                                    _to_emails.length !== 0 ? _to_emails : undefined
                                                                );
                                                            }}
                                                            autoFocus={true}
                                                            onKeyDown={(event) => {
                                                                if (allowedKeys.current.includes(event.key)) {
                                                                    handlekeyPress('to_emails', event.key);
                                                                }
                                                            }}
                                                            onFocus={() => setFocused(true)}
                                                            onBlur={() => setFocused(false)}
                                                            getLabel={(email, index, removeEmail) => {
                                                                return (
                                                                    <div data-tag key={index}>
                                                                        <div data-tag-item>{email}</div>
                                                                        <span data-tag-handle onClick={() => removeEmail(index)}>
                                                                            ×
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }}
                                                        />
                                                        {toEmailError.current > 0 && (
                                                            <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                {strings.InValidEmailAddress}
                                                            </div>
                                                        )}
                                                        {toEmailError.current === 0 && !localEmailDetails.billingEmail && (
                                                            <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                {strings.ValidEmailAddressIsRequired}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            />
                                        </Col>
                                        <Col></Col>
                                    </Row>
                                </FormGroup>
                                <FormGroup>
                                    <Row>
                                        <Col sm="2">
                                            <Label htmlFor="_cc_emails">Cc</Label>
                                        </Col>
                                        <Col sm="9">
                                            <Controller
                                                name="cc_emails"
                                                control={control}
                                                render={({ field }) => (
                                                    <>
                                                        <ReactMultiEmail
                                                            placeholder="Input your email"
                                                            emails={field.value || []}
                                                            onChange={(_cc_emails) => {
                                                                CCEmailError.current = 0;
                                                                field.onChange(_cc_emails);
                                                            }}
                                                            autoFocus={true}
                                                            onFocus={() => setFocused(true)}
                                                            onBlur={() => setFocused(false)}
                                                            onKeyDown={(event) => {
                                                                if (allowedKeys.current.includes(event.key)) {
                                                                    handlekeyPress('cc_emails', event.key);
                                                                }
                                                            }}
                                                            getLabel={(email, index, removeEmail) => {
                                                                return (
                                                                    <div data-tag key={index}>
                                                                        <div data-tag-item>{email}</div>
                                                                        <span data-tag-handle onClick={() => removeEmail(index)}>
                                                                            ×
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }}
                                                        />
                                                        {CCEmailError.current > 0 && (
                                                            <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                {strings.InValidEmailAddress}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            />
                                        </Col>
                                        <Col></Col>
                                    </Row>
                                </FormGroup>

                                <hr />
                                <FormGroup>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={addBcc}
                                            onCheckedChange={(checked) => {
                                                setAddBcc(checked);
                                            }}
                                        />
                                        <Label htmlFor="mailTo">Add Bcc</Label>
                                    </div>
                                </FormGroup>
                                {addBcc === true && (
                                    <FormGroup>
                                        <Row>
                                            <Col sm="2">
                                                <Label htmlFor="bcc" className="pull-right">
                                                    Bcc
                                                </Label>
                                            </Col>
                                            <Col sm="9">
                                                <Controller
                                                    name="bcc_emails"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <>
                                                            <ReactMultiEmail
                                                                placeholder="Input your email"
                                                                emails={field.value || []}
                                                                onChange={(_bcc_emails) => {
                                                                    field.onChange(_bcc_emails);
                                                                    BCCEmailError.current = 0;
                                                                }}
                                                                autoFocus={true}
                                                                onFocus={() => setFocused(true)}
                                                                onBlur={() => setFocused(false)}
                                                                onKeyDown={(event) => {
                                                                    if (allowedKeys.current.includes(event.key)) {
                                                                        handlekeyPress('bcc_emails', event.key);
                                                                    }
                                                                }}
                                                                getLabel={(email, index, removeEmail) => {
                                                                    return (
                                                                        <div data-tag key={index}>
                                                                            <div data-tag-item>{email}</div>
                                                                            <span data-tag-handle onClick={() => removeEmail(index)}>
                                                                                ×
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                }}
                                                            />
                                                            {BCCEmailError.current > 0 && (
                                                                <div className="invalid-feedback" style={{ display: 'block' }}>
                                                                    {strings.InValidEmailAddress}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                />
                                            </Col>
                                            <Col></Col>
                                        </Row>
                                    </FormGroup>
                                )}
                                <hr />
                                <FormGroup>
                                    <Row>
                                        <Col sm="2">
                                            <Label htmlFor="subject">Subject</Label>
                                        </Col>
                                        <Col sm="9">
                                            <Controller
                                                name="subject"
                                                control={control}
                                                render={({ field }) => (
                                                    <Textarea
                                                        className="textarea"
                                                        maxLength={255}
                                                        name="subject"
                                                        id="subject"
                                                        rows={4}
                                                        placeholder={'Enter the Subject'}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            updateState(e, 'subject', e.target.value);
                                                        }}
                                                        value={currentEntityEmailDetails.subject || ''}
                                                    />
                                                )}
                                            />
                                        </Col>
                                        <Col></Col>
                                    </Row>
                                </FormGroup>
                                <FormGroup>
                                    <Row>
                                        <Col sm="2">
                                            <Label htmlFor="defaultFootNotes ">Message</Label>
                                            <br />
                                        </Col>
                                        <Col sm="9">
                                            <Controller
                                                name="message"
                                                control={control}
                                                render={({ field }) => (
                                                    <Textarea
                                                        maxLength={1000}
                                                        className="textarea"
                                                        name="message"
                                                        id="message"
                                                        rows={10}
                                                        onChange={(option) => {
                                                            field.onChange(option);
                                                            let updated = { ...localEmailDetails };
                                                            updated.message = option.target.value;
                                                            setLocalEmailDetails(updated);
                                                        }}
                                                        value={currentEntityEmailDetails.message}
                                                    />
                                                )}
                                            />
                                        </Col>
                                        <Col></Col>
                                    </Row>
                                </FormGroup>
                                <FormGroup>
                                    <Row>
                                        <Col sm="2"></Col>
                                        <Col className="p-0">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    checked={attach}
                                                    onCheckedChange={(checked) => {
                                                        setAttach(checked);
                                                    }}
                                                />
                                                <Label htmlFor="mailTo">Attach the pdf version of document</Label>
                                            </div>
                                        </Col>
                                    </Row>
                                </FormGroup>
                                <FormGroup>
                                    <Row>
                                        <Col sm="2"></Col>
                                        <Col>
                                            <Controller
                                                name="attachmentFile"
                                                control={control}
                                                render={({ field }) => (
                                                    <div>
                                                        <Button
                                                            color="primary"
                                                            onClick={() => {
                                                                document.getElementById('fileInput').click();
                                                            }}
                                                            className="btn-square mr-3"
                                                        >
                                                            <i className="fa fa-plus"></i> Attach Files
                                                        </Button>
                                                        <input
                                                            id="fileInput"
                                                            ref={uploadFileRef}
                                                            type="file"
                                                            multiple
                                                            style={{ display: 'none' }}
                                                            onChange={(e) => {
                                                                handleFileChange(e);
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            />
                                            {errors.attachmentFile && (
                                                <div className="invalid-file">{errors.attachmentFile.message}</div>
                                            )}
                                        </Col>
                                    </Row>
                                </FormGroup>
                                <FormGroup>
                                    {attachmentFile && attachmentFile.length !== 0 && (
                                        <Row>
                                            <Col sm="2">Attached Files</Col>
                                            <Col sm="9">{DisplayFilesComponent(attachmentFile)}</Col>
                                            <Col></Col>
                                        </Row>
                                    )}
                                </FormGroup>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" type="submit" className="btn-square">
                            <i className="fas fa-send"></i> {strings.Send}
                        </Button>
                        &nbsp;
                        <Button
                            color="secondary"
                            className="btn-square"
                            onClick={() => {
                                setLocalEmailDetails({});
                                setAttach(true);
                                setAttachmentFile(null);
                                updateChange({});
                                removeDialog(false);
                            }}
                        >
                            <i className="fa fa-ban"></i> {strings.Cancel}
                        </Button>
                    </ModalFooter>
                </Form>
            </Modal>
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailPopUpModal);
