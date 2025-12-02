import React from 'react';
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
import { Field, Formik } from 'formik';
import { TextField, } from '@material-ui/core';
import { EditorState } from 'draft-js';
import { ReactMultiEmail, } from 'react-multi-email';
import 'react-multi-email/dist/style.css';
import { Checkbox } from '@mui/material';
import './style.scss';
import { connect } from 'react-redux';
import { data } from 'screens/Language/index'
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings(data);

const mapStateToProps = (state) => {

    return {
        // project_list: state.quota.project_list,		
    };

};
const mapDispatchToProps = (dispatch) => {
    return {
        // productActions: bindActionCreators(null, dispatch),
    };
};
class EmailPopUpModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            language: window['localStorage'].getItem('language'),
            loading: false,
            state_list: [],
            initValue: {
                id: '',
                body: '',
                subject: '',
                from: '',
                cc_emails: [],
            },
            editorState: EditorState.createEmpty(),
            contentState: {},
            viewEditor: false,
            addBcc: false,
            attach: true,
            focused: false,
            fileName: '',
            message: '',
            attachPrimaryPdf: true,
            pdfFiles: [],
        };
        this.formikRef = React.createRef();
        this.regEx = /^[0-9\d]+$/;
        this.regExBoth = /[a-zA-Z0-9]+$/;
        // this.regEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
        this.regExAlpha = /^[a-zA-Z ]+$/;
        this.content = {
            entityMap: {},
            blocks: [
                {
                    key: '637gr',
                    text: this.state.message,
                    type: 'unstyled',
                    depth: 0,
                    inlineStyleRanges: [],
                    entityRanges: [],
                    data: {},
                },
            ],
        };
        this.toEmailError = 0;
        this.CCEmailError = 0;
        this.BCCEmailError = 0;
        this.allowedKeys = ['Backspace']; // Define the allowed keys
        // Add alphabets, numbers, and special characters to the allowedKeys array
        for (let i = 33; i <= 126; i++) {
            if (i !== 46)
                this.allowedKeys.push(String.fromCharCode(i));
        }
    }

    onContentStateChange = (contentState) => {
        this.setState(
            {
                contentState,
            },
            () => {
                this.setState({
                    message: this.state.contentState.blocks[0].text,
                });
            },
        );
    };
    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.currentEntityEmailDetails !== nextProps.currentEntityEmailDetails) {
            return {
                currentEntityEmailDetails: nextProps.currentEntityEmailDetails,
            };
        }
    }
    handleSubmit = (data) => {
        const { currentEntityEmailDetails, sendCustomEmail, updateChange, id } = this.props;
        let payload = currentEntityEmailDetails
        payload.id = id
        payload.attachmentFiles = this.state.pdfFiles
        payload.message = payload.message.replace(/\n/g, '<p></p>\n');
        payload.cc_emails = data.cc_emails
        payload.bcc_emails = data.bcc_emails
        payload.emailContent = payload.contentPrefix + payload.message + payload.contentSufix;

        const formData = new FormData();
        formData.append('attachPrimaryPdf', this.state.attach)
        if (this.state.pdfFiles)
            for (let i = 0; i < this.state.pdfFiles.length; i++) {
                formData.append('pdfFilesData', this.state.pdfFiles[i]);
            }
        if (this.state.attachmentFile)
            for (let i = 0; i < this.state.attachmentFile.length; i++) {
                formData.append('attachmentFiles', this.state.attachmentFile[i]);
            }


        formData.append('id', id)
        formData.append('type', payload.type)
        data.cc_emails && formData.append('cc_emails', data.cc_emails)
        data.bcc_emails && formData.append('bcc_emails', data.bcc_emails)
        formData.append('subject', payload.subject)
        formData.append('message', payload.message.replace(/\n\n/g, '<p></p>\n'))
        formData.append('pdfBody', payload.pdfBody)
        formData.append('billingEmail', payload.billingEmail)
        formData.append('to_emails', payload.billingEmail)
        formData.append('emailContent', payload.contentPrefix + payload.message + payload.contentSufix)
        formData.append('fromEmailAddress', payload.fromEmailAddress)
        formData.append('fromEmailName', payload.fromEmailName)
        if (payload.postingRequestModel) {
            formData.append('amount', payload.postingRequestModel.amount)
            formData.append('postingRefId', payload.postingRequestModel.postingRefId)
            formData.append('postingRefType', payload.postingRequestModel.postingRefType)
            formData.append('amountInWords', payload.postingRequestModel.amountInWords)
            formData.append('vatInWords', payload.postingRequestModel.vatInWords)
            formData.append('markAsSent', payload.postingRequestModel.markAsSent)
        }
        sendCustomEmail(formData);
        this.setState({ currentEntityEmailDetails: {}, attach: true, attachmentFile: null })
        updateChange({});
    };
    handleFileChange = (e, props) => {
        e.preventDefault();
        const maxFileSizeBytes = 120 * 1024 * 1024; // Convert to bytes
    
        let filecheck = e.target.files[0];
        let pdfFiles = this.state.pdfFiles;
        const alreadyExistingFiles = this.state.attachmentFile ?? [];
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
                            this.setState({ dataString: bstr });
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
                                pdfFiles.push(results[i].toString());
                            }
                        }
                        props.setFieldValue("attachmentFile", [...files, ...alreadyExistingFiles], true);
                        this.setState({
                            attachmentFile: [...files, ...alreadyExistingFiles],
                            pdfFiles: pdfFiles,
                        });
                    })
                    .catch((err) => {
                        console.log("Error reading file:", err);
                    });
            }
        }
    };
    


    render() {
        strings.setLanguage(this.state.language);
        const { openEmailModal, removeDialog, currentEntityEmailDetails, updateChange } = this.props;
        const { initValue, contentState } = this.state;
        return (
            <div className="contact-modal-screen">
                <Modal isOpen={openEmailModal} className="modal-success contact-modal">
                    <Formik
                        ref={this.formikRef}
                        initialValues={currentEntityEmailDetails}
                        onSubmit={(values, { resetForm }) => {
                            this.handleSubmit(values, resetForm);
                        }}
                        validate={(values) => {
                            let errors = {};
                            const { currentEntityEmailDetails } = this.props
                            if (this.toEmailError > 0)
                                errors.mailTo = strings.InValidEmailAddress;
                            else if (!currentEntityEmailDetails.billingEmail)
                                errors.mailTo = strings.ValidEmailAddressIsRequired;
                            if (this.CCEmailError > 0)
                                errors.cc_emails = strings.InValidEmailAddress;
                            if (this.BCCEmailError > 0)
                                errors.bcc_emails = strings.InValidEmailAddress;
console.log(errors);
                            return errors
                        }}
                    >
                        {(props) => {
                            return (
                                <Form
                                    name="simpleForm"
                                    onSubmit={props.handleSubmit}
                                    className="create-contact-screen"
                                >
                                    <CardHeader toggle={this.toggleDanger}>
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
                                            <Col >
                                                <FormGroup>
                                                    <Row>
                                                        <Col sm="2">
                                                            <Label htmlFor="from">From</Label>
                                                        </Col>
                                                        <Col sm="4" className='pull-left'>
                                                            <Input
                                                                disabled
                                                                type="text"
                                                                id="from"
                                                                name="from"
                                                                placeholder="From"
                                                                value={currentEntityEmailDetails.fromEmailAddress &&
                                                                    currentEntityEmailDetails.fromEmailAddress}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Row>
                                                        <Col sm="2">
                                                            <Label htmlFor="mailTo"><span className="text-danger">* </span>To</Label>
                                                        </Col>
                                                        <Col sm="9">
                                                            <ReactMultiEmail
                                                                id="to_emails"
                                                                name="to_emails"
                                                                placeholder='Input your email'
                                                                emails={currentEntityEmailDetails.billingEmail && currentEntityEmailDetails.billingEmail}
                                                                onChange={(_to_emails) => {
                                                                    this.toEmailError = 0;
                                                                    props.handleChange('to_emails')(_to_emails);
                                                                    this.updateState(_to_emails.length != 0 ? _to_emails : undefined, props, "to_emails", _to_emails.length != 0 ? _to_emails : undefined)
                                                                }}
                                                                autoFocus={true}
                                                                onKeyDown={(event) => {
                                                                    if (this.allowedKeys.includes(event.key)) {
                                                                        this.handlekeyPress('to_emails', event.key)
                                                                        props.handleChange('eventchanged')(true);
                                                                    }
                                                                }}
                                                                onFocus={() => this.setState({ focused: true, })}
                                                                onBlur={() => this.setState({ focused: false, })}
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
                                                            {props.errors.mailTo && (
                                                                <div className="invalid-feedback">
                                                                    {props.errors.mailTo}
                                                                </div>
                                                            )}
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
                                                            <ReactMultiEmail
                                                                placeholder='Input your email'
                                                                emails={props.values.cc_emails}
                                                                onChange={(_cc_emails) => {
                                                                    this.CCEmailError = 0;
                                                                    props.handleChange('cc_emails')(_cc_emails);
                                                                }}
                                                                autoFocus={true}
                                                                onFocus={() => this.setState({ focused: true, })}
                                                                onBlur={() => this.setState({ focused: false, })}
                                                                onKeyDown={(event) => {
                                                                    if (this.allowedKeys.includes(event.key)) {
                                                                        this.handlekeyPress('cc_emails', event.key)
                                                                        props.handleChange('eventchanged')(true);
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
                                                            {props.errors.cc_emails && (
                                                                <div className="invalid-feedback">
                                                                    {props.errors.cc_emails}
                                                                </div>
                                                            )}
                                                        </Col>
                                                        <Col></Col>
                                                    </Row>
                                                </FormGroup>

                                                <hr />
                                                <FormGroup>
                                                    <Checkbox onClick={() => {
                                                        this.setState({ addBcc: !this.state.addBcc })
                                                    }} /><Label htmlFor="mailTo">Add Bcc</Label>

                                                </FormGroup>
                                                {this.state.addBcc == true && (
                                                    <FormGroup>
                                                        <Row>
                                                            <Col sm="2">
                                                                <Label htmlFor="bcc" className='pull-right'>Bcc</Label>
                                                            </Col>
                                                            <Col sm="9">
                                                                <ReactMultiEmail
                                                                    placeholder='Input your email'
                                                                    emails={props.values.bcc_emails}
                                                                    onChange={(_bcc_emails) => {
                                                                        props.handleChange('bcc_emails')(_bcc_emails);
                                                                        this.BCCEmailError = 0;
                                                                    }}
                                                                    autoFocus={true}
                                                                    onFocus={() => this.setState({ focused: true, })}
                                                                    onBlur={() => this.setState({ focused: false, })}
                                                                    onKeyDown={(event) => {
                                                                        if (this.allowedKeys.includes(event.key)) {
                                                                            this.handlekeyPress('bcc_emails', event.key)
                                                                            props.handleChange('eventchanged')(true);
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
                                                                {props.errors.bcc_emails && (
                                                                    <div className="invalid-feedback">
                                                                        {props.errors.bcc_emails}
                                                                    </div>
                                                                )}
                                                            </Col>
                                                            <Col></Col>
                                                        </Row>
                                                    </FormGroup>)}
                                                <hr />
                                                <FormGroup>
                                                    <Row>
                                                        <Col sm="2">
                                                            <Label htmlFor="subject">Subject</Label>
                                                        </Col>
                                                        <Col sm="9">
                                                            <TextField
                                                                type="textarea"
                                                                className="textarea"
                                                                inputProps={{ maxLength: 255 }}
                                                                multiline
                                                                name="subject"
                                                                id="subject"
                                                                maxRows="4"
                                                                placeholder={'Enter the Subject'}
                                                                onChange={(e) =>
                                                                    this.updateState(e, props, "subject", e.target.value)
                                                                }
                                                                value={currentEntityEmailDetails.subject && currentEntityEmailDetails.subject}
                                                            />
                                                        </Col>
                                                        <Col></Col>
                                                    </Row>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Row>
                                                        <Col sm="2">
                                                            <Label htmlFor="defaultFootNotes ">
                                                                {/* <span className="text-danger">* </span> */}
                                                                Message
                                                            </Label>
                                                            <br />
                                                        </Col>
                                                        <Col sm="9">
                                                            <TextField
                                                                type="textarea"
                                                                inputProps={{ maxLength: 1000 }}
                                                                className='textarea'
                                                                multiline
                                                                name="message"
                                                                id="message"
                                                                minRows="10"
                                                                maxRows={12}
                                                                onChange={(option) => {
                                                                    props.handleChange(
                                                                        'message',
                                                                    )(option)
                                                                    currentEntityEmailDetails.message = option.target.value;
                                                                }
                                                                }
                                                                value={currentEntityEmailDetails.message}
                                                            />
                                                        </Col>
                                                        <Col></Col>
                                                    </Row>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Row>
                                                        <Col sm="2"></Col>
                                                        <Col className='p-0'>
                                                            <Checkbox checked={this.state.attach}
                                                                onClick={() => {
                                                                    this.setState({ attach: !this.state.attach })
                                                                }} />
                                                            <Label htmlFor="mailTo">Attach the pdf version of document</Label>
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                                <FormGroup  >
                                                    <Row>
                                                        <Col sm="2"></Col>
                                                        <Col >
                                                            <Field
                                                                id="attachmentFile"
                                                                name="attachmentFile"
                                                                render={({ field, form }) => (
                                                                    <div>
                                                                        <Button
                                                                            color="primary"
                                                                            onClick={() => {
                                                                                document
                                                                                    .getElementById('fileInput')
                                                                                    .click();
                                                                            }}
                                                                            className="btn-square mr-3"
                                                                        >
                                                                            <i className="fa fa-plus"></i>{' '}
                                                                            Attach Files
                                                                        </Button>
                                                                        <input
                                                                            id="fileInput"
                                                                            ref={(ref) => {
                                                                                this.uploadFile = ref;
                                                                            }}
                                                                            type="file"
                                                                            multiple
                                                                            style={{ display: 'none' }}
                                                                            onChange={(e) => {
                                                                                this.handleFileChange(
                                                                                    e,
                                                                                    props,
                                                                                );
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                            />
                                                            {props.errors.attachmentFile &&
                                                                props.touched.attachmentFile && (
                                                                    <div className="invalid-file">
                                                                        {props.errors.attachmentFile}
                                                                    </div>
                                                                )}
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                                <FormGroup>
                                                    {this.state.attachmentFile &&
                                                        this.state.attachmentFile.length !== 0 &&
                                                        <Row>
                                                            <Col sm="2">Attached Files</Col>
                                                            <Col sm="9">
                                                                {this.DisplayFilesComponent(props, this.state.attachmentFile)}
                                                            </Col>
                                                            <Col></Col>
                                                        </Row>
                                                    }
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                    </ModalBody>
                                    <ModalFooter>
                                        <Button
                                            color="primary"
                                            type="submit"
                                            className="btn-square"
                                        >
                                            <i className="fas fa-send"></i> {strings.Send}
                                        </Button>
                                        &nbsp;
                                        <Button
                                            color="secondary"
                                            className="btn-square"
                                            onClick={() => {
                                                this.setState({ currentEntityEmailDetails: {}, attach: true, attachmentFile: null })
                                                updateChange({});
                                                removeDialog(false);
                                            }}
                                        >
                                            <i className="fa fa-ban"></i> {strings.Cancel}
                                        </Button>
                                    </ModalFooter>
                                </Form>
                            );
                        }}
                    </Formik>
                </Modal>
            </div>
        );
    }
    handlekeyPress = (label, value) => {
        if (label === "to_emails") {
            let error = this.toEmailError;
            if (value === "Backspace")
                error = error === 0 ? 0 : error - 1;
            else
                error = error + 1;
            this.toEmailError = error;
        } else if (label === "bcc_emails") {
            let error = this.BCCEmailError;
            if (value === "Backspace")
                error = error === 0 ? 0 : error - 1;
            else
                error = error + 1;
            this.BCCEmailError = error;
        } else if (label === "cc_emails") {
            let error = this.CCEmailError;
            if (value === "Backspace")
                error = error === 0 ? 0 : error - 1;
            else
                error = error + 1;
            this.CCEmailError = error;
        }
    }
    updateState = (e, props, label, value) => {
        label != "to_emails" && e.preventDefault();

        let currentEntityEmailDetails = { ...this.state.currentEntityEmailDetails }
        switch (label) {

            case "subject":
                currentEntityEmailDetails.subject = value;
                this.setState({
                    currentEntityEmailDetails: currentEntityEmailDetails
                })
                props.setFieldValue('subject', value, true);
                break

            case "mailTo":
                currentEntityEmailDetails.billingEmail = value;
                this.setState({
                    currentEntityEmailDetails: currentEntityEmailDetails
                })
                props.setFieldValue('mailTo', value, true);
                break

            case "to_emails":
                currentEntityEmailDetails.billingEmail = value;
                this.setState({
                    currentEntityEmailDetails: currentEntityEmailDetails
                })
                props.setFieldValue('to_emails', value, true);
                break

            default: break
        }
        this.props.updateChange(currentEntityEmailDetails);

    };
    DisplayFilesComponent = (props, Files) => {
        return <div className=" react-multi-email  ">
            <div className="data-labels" style={{ opacity: 1, display: "contents", flexWrap: "inherit" }}>
                {Files.map((data, index) => {
                    return <div data-tag="true">
                        <div data-tag-item="true">{data.name}</div>
                        <span data-tag-handle="true"
                            onClick={() => {
                                let newFiles = []
                                Files.forEach((data, i) => {
                                    if (index !== i)
                                        newFiles.push(data);
                                })
                                if (newFiles.length == 0) {
                                    //same file not uploading issue
                                    props.setFieldValue('attachmentFile', newFiles, true);
                                    var input = document.getElementById('fileInput');

                                    input.onclick = function () {
                                        this.value = null;
                                    };

                                    input.onchange = function () {
                                        console.log(this.value);
                                    };
                                }
                                this.setState({ attachmentFile: newFiles })
                            }}
                        >×</span>
                    </div>
                })}
            </div>
            <input type="text" value="" style={{ opacity: 1 }} />
        </div>
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EmailPopUpModal);