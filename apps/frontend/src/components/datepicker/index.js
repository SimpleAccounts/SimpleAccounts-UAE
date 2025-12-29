import React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import dayjs from '@/utils/date';

import DateRangePicker from 'react-bootstrap-daterangepicker';

import 'bootstrap-daterangepicker/daterangepicker.css';

class DateRangePicker2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: dayjs(),
      endDate: dayjs(),
    };

    this.handleEvent = this.handleEvent.bind(this);
  }

  componentDidMount() {
    Object.keys(this.props.ranges).map((key, index) => {
      if (index === 0) {
        this.setState({
          startDate: this.props.ranges[`${key}`][0],
          endDate: this.props.ranges[`${key}`][1],
        });
      }
      return key;
    });
  }

  handleEvent(event, picker) {
    event.preventDefault();
    this.setState({
      startDate: picker.startDate,
      endDate: picker.endDate,
    });
  }

  render() {
    let nick_key = null;

    Object.keys(this.props.ranges).map(key => {
      if (
        this.state.startDate.format('YYYY-MM-DD') ===
          this.props.ranges[`${key}`][0].format('YYYY-MM-DD') &&
        this.state.endDate.format('YYYY-MM-DD') ===
          this.props.ranges[`${key}`][1].format('YYYY-MM-DD')
      ) {
        nick_key = key;
        return true;
      }
      return key;
    });

    if (this.state.startDate !== null && nick_key === null) {
      nick_key = this.state.startDate.format('ll') + ' - ' + this.state.endDate.format('ll');
    }
    return (
      <DateRangePicker
        startDate={this.state.startDate}
        endDate={this.state.endDate}
        opens={this.props.opens || 'right'}
        ranges={this.props.ranges}
        onEvent={(e, picker) => this.handleEvent(e, picker)}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="date-select">
              {nick_key}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* Range selection handled by DateRangePicker wrapping this */}
          </DropdownMenuContent>
        </DropdownMenu>
      </DateRangePicker>
    );
  }
}

export default DateRangePicker2;
