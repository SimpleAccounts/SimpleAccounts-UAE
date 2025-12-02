import React from 'react';
import {
    FormGroup,
    UncontrolledTooltip,
    Label,
} from 'reactstrap';

function RadioButton(props) {
    const { selected, label, onChange, radio1, radio1Tooltip, radio2Tooltip, radio2 } = props;
    return (
        <>
            <FormGroup className="mb-3">
                {label &&
                    <Label htmlFor="active">
                        <span className="text-danger">* </span>
                        {label} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </Label>
                }
                <FormGroup check inline>
                    <div className="custom-radio custom-control mr-4">
                        <input
                            className="custom-control-input"
                            type="radio"
                            id="inline-radio1"
                            name="radio"
                            checked={selected}
                            value={true}
                            onChange={(e) => {
                                if (e.target.value === 'true') {
                                    onChange(true)
                                }
                            }}
                        />
                        <label className="custom-control-label" htmlFor="inline-radio1"                            >
                            {radio1}
                            {radio1Tooltip &&
                                <>
                                    <i
                                        id="inline-radio1"
                                        className="fa fa-question-circle ml-1"
                                    ></i>
                                    <UncontrolledTooltip
                                        placement="right"
                                        target="inline-radio1"
                                    >
                                        {radio1Tooltip}
                                    </UncontrolledTooltip>
                                </>
                            }
                        </label>
                    </div>
                </FormGroup>
                <FormGroup check inline>
                    <div className="custom-radio custom-control">
                        <input
                            className="custom-control-input"
                            type="radio"
                            id="inline-radio2"
                            name="radio"
                            value={false}
                            checked={!selected}
                            onChange={(e) => {
                                if (e.target.value === 'false') {
                                    onChange(false);
                                }
                            }}
                        />
                        <label className="custom-control-label" htmlFor="inline-radio2"                            >
                            {radio2}
                            {radio2Tooltip &&
                                <>
                                    <i
                                        id="inline-radio2"
                                        className="fa fa-question-circle ml-1"
                                    ></i>
                                    <UncontrolledTooltip
                                        placement="right"
                                        target="inline-radio2"
                                    >
                                        {radio2Tooltip}
                                    </UncontrolledTooltip>
                                </>
                            }
                        </label>
                    </div>
                </FormGroup>

            </FormGroup>
        </>
    )
}

export default RadioButton;
