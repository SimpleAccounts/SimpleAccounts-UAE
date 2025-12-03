import React from 'react'
import {connect} from 'react-redux'
import {
  Card,
  CardBody,
  Col,
  Row,
} from "reactstrap"

import './style.scss'

const mapStateToProps = (state) => {
  return ({
  })
}
const mapDispatchToProps = (dispatch) => {
  return ({
  })
}

class Faq extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
    }

  }

  render() {
    return (
      <div className="faq-screen">
        <div className="animated fadeIn">
          <Row className="mt-4">
            <Col md="3">
              <Card>
                <CardBody>
                  <input type="search" className="form-control" placeholder="Search question ..."></input>
                  <ul className="question-list">
                    <li>
                      <button className="btn">1. How to create bank account?</button>
                    </li>
                    <li>
                      <button className="btn">2. How to create bank account?</button>
                    </li>
                    <li>
                      <button className="btn">3. How to create bank account?</button>
                    </li>
                    <li>
                      <button className="btn">4. How to create bank account?</button>
                    </li>
                  </ul>
                </CardBody>
              </Card>
            </Col>
            <Col xs="12" md="9">
              <div className="search-content">
                <Card>
                  <CardBody>
                    <h3 className="mb-3">Question title</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque in dictum non consectetur a erat nam. Metus aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices. Viverra mauris in aliquam sem fringilla ut morbi tincidunt. Quis eleifend quam adipiscing vitae proin. Metus aliquam eleifend mi in nulla posuere sollicitudin aliquam. Placerat orci nulla pellentesque dignissim. Adipiscing commodo elit at imperdiet dui accumsan sit amet. Risus ultricies tristique nulla aliquet enim tortor at. Et tortor at risus viverra.
                      Nunc sed velit dignissim sodales ut eu sem integer. <br/><br/>Nunc pulvinar sapien et ligula ullamcorper malesuada proin. Amet consectetur adipiscing elit ut aliquam purus sit amet. Sit amet nisl purus in mollis. Sodales ut eu sem integer vitae justo eget magna. Tellus orci ac auctor augue mauris augue neque gravida. Sagittis purus sit amet volutpat consequat mauris. Mauris a diam maecenas sed enim ut sem viverra. Eu non diam phasellus vestibulum lorem sed risus ultricies. Mattis ullamcorper velit sed ullamcorper morbi tincidunt. In cursus turpis massa tincidunt dui ut ornare lectus. Viverra nibh cras pulvinar mattis nunc sed blandit. Sed odio morbi quis commodo odio aenean sed. Ultricies mi quis hendrerit dolor. Sit amet massa vitae tortor condimentum lacinia. Eu mi bibendum neque egestas. Sit amet cursus sit amet dictum sit. Ultricies mi quis hendrerit dolor magna eget est lorem ipsum. Arcu non sodales neque sodales. </p>
                  </CardBody>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Faq)