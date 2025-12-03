import React from 'react';
import { connect } from 'react-redux';
import { Currency } from 'components';
import {
    Row,
    Col,
} from 'reactstrap';
const mapStateToProps = (state) => {
    return {
        isRegisteredVat: state.common.company_details.isRegisteredVat,
    };
};
class TotalCalculation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        const { initValue, currency_symbol, strings, discountEnabled, isRegisteredVat, vatDisabled } = this.props;
        return (
            <>
                <div className="">
                    {initValue.totalExciseAmount > 0 ?
                        <div className="total-item p-2">
                            <Row>
                                <Col lg={6}>
                                    <h5 className="mb-0 text-right">
                                        {strings.TotalExcise}
                                    </h5>
                                </Col>
                                <Col lg={6} className="text-right">
                                    <label className="mb-0">
                                        <Currency
                                            value={initValue.totalExciseAmount}
                                            currencySymbol={currency_symbol}
                                        />
                                    </label>
                                </Col>
                            </Row>
                        </div> : ''}
                    {discountEnabled == true ?
                        <div className="total-item p-2">
                            <Row>
                                <Col lg={6}>
                                    <h5 className="mb-0 text-right">
                                        {strings.Discount}
                                    </h5>
                                </Col>
                                <Col lg={6} className="text-right">
                                    <label className="mb-0">
                                        <Currency
                                            value={initValue.discount}
                                            currencySymbol={currency_symbol}
                                        />
                                    </label>
                                </Col>
                            </Row>
                        </div> : ''}
                    <div className="total-item p-2">
                        <Row>
                            <Col lg={6}>
                                <h5 className="mb-0 text-right">
                                    {strings.TotalNet}
                                </h5>
                            </Col>
                            <Col lg={6} className="text-right">
                                <label className="mb-0">
                                    <Currency
                                        value={initValue.totalNet}
                                        currencySymbol={currency_symbol}
                                    />
                                </label>
                            </Col>
                        </Row>
                    </div>
                    {isRegisteredVat && !vatDisabled &&
                        <div className="total-item p-2">
                            <Row>
                                <Col lg={6}>
                                    <h5 className="mb-0 text-right">
                                        {strings.TotalVat}
                                    </h5>
                                </Col>
                                <Col lg={6} className="text-right">
                                    <label className="mb-0">
                                        <Currency
                                            value={initValue.totalVatAmount}
                                            currencySymbol={currency_symbol}
                                        />
                                    </label>
                                </Col>
                            </Row>
                        </div>}
                    <div className="total-item p-2">
                        <Row>
                            <Col lg={6}>
                                <h5 className="mb-0 text-right">
                                    {strings.Total}
                                </h5>
                            </Col>
                            <Col lg={6} className="text-right">
                                <label className="mb-0">
                                    <Currency
                                        value={initValue.totalAmount}
                                        currencySymbol={currency_symbol}
                                    />
                                </label>
                            </Col>
                        </Row>
                    </div>
                </div>
            </>
        )
    }
}

export default connect(mapStateToProps)(TotalCalculation);
