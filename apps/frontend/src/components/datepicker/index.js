import React from 'react'
import {
  // Input,
  ButtonDropdown,
  // Button,
  // DropdownItem,
  // DropdownMenu,
  DropdownToggle
} from 'reactstrap'
import moment from 'moment'

import DateRangePicker from 'react-bootstrap-daterangepicker'

import 'bootstrap-daterangepicker/daterangepicker.css'

class DateRangePicker2 extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      startDate: moment(),
      endDate: moment()
    }

    this.handleEvent = this.handleEvent.bind(this)
  }

  componentDidMount() {
    Object.keys(this.props.ranges).map((key, index) => {
      if(index === 0) {
        this.setState({
          startDate: this.props.ranges[`${key}`][0],
          endDate: this.props.ranges[`${key}`][1]
        })
      }
      return key
    })
  }

  handleEvent (event, picker) {
    event.preventDefault()
    this.setState({
      startDate: picker.startDate,
      endDate: picker.endDate
    })
  }

  render() {
    let nick_key = null

    Object.keys(this.props.ranges).map((key) => {
      if(this.state.startDate.format('YYYY-MM-DD') === this.props.ranges[`${key}`][0].format('YYYY-MM-DD') && 
        this.state.endDate.format('YYYY-MM-DD') === this.props.ranges[`${key}`][1].format('YYYY-MM-DD')){
        nick_key = key
        return true
      }
      return key
    })

    if(this.state.startDate !== null && nick_key === null) {
      nick_key = this.state.startDate.format('ll') + ' - ' + this.state.endDate.format('ll')
    }
    return (
      <DateRangePicker 
        startDate={this.state.startDate} 
        endDate={this.state.endDate}
        opens={this.props.opens || 'right'}
        ranges={this.props.ranges} onEvent={(e, picker) => this.handleEvent(e, picker)}>
        <ButtonDropdown className="date-select" toggle={() => {}}>
          <DropdownToggle caret>
            {nick_key}
          </DropdownToggle>
        </ButtonDropdown>
      </DateRangePicker>
    );
  }
}

export default DateRangePicker2