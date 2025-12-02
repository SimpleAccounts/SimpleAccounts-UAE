import React from 'react';
import { connect } from 'react-redux';
import {
    Row,
    Col,
    FormGroup,
    Input,
    Label,
} from 'reactstrap';
const mapStateToProps = (state) => {
    return {
        basecurrencyName: state.common.companyCurrency.currencyName,
    };
};
class CurrencyExchangeRate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        const { strings, currencyName, exchangeRate, basecurrencyName, onChange } = this.props;
        if (exchangeRate && exchangeRate !== 1) {
            return (
                <>
                    <Row>
                        <Col>
                            <Label >
                                {strings.CurrencyExchangeRate}
                            </Label>
                        </Col>
                    </Row>
                    <Row >
                        <Col md={1}>
                            <Input
                                disabled
                                id="1"
                                name="1"
                                value={1}
                            />
                        </Col>
                        <Col md={2}>
                            <FormGroup className="mb-3">
                                <div>
                                    <Input
                                        disabled
                                        className="form-control"
                                        id="curreancyname"
                                        name="curreancyname"
                                        value={currencyName}
                                    />
                                </div>
                            </FormGroup>
                        </Col>
                        <FormGroup className="mt-2"><label><b>=</b></label>	</FormGroup>
                        <Col lg={2}>
                            <FormGroup className="mb-3">
                                <div>
                                    <Input
                                        type="number"
                                        className="form-control"
                                        id="exchangeRate"
                                        name="exchangeRate"
                                        value={exchangeRate}
                                        onChange={(option) => {
                                            const value = parseFloat(option.target.value);
                                            onChange(value,);
                                        }}
                                    />
                                </div>
                            </FormGroup>
                        </Col>
                        <Col lg={2}>
                            <Input
                                type="text"
                                min="0"
                                disabled
                                id="currencyName"
                                name="currencyName"
                                value={basecurrencyName}
                            />
                        </Col>
                    </Row>
                    <hr />
                </>
            )
        }
        return (<></>);
    }
}

export default connect(mapStateToProps)(CurrencyExchangeRate);
