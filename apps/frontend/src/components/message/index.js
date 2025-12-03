import React from 'react'
import { Alert } from 'reactstrap'

import './style.scss'

class Message extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
    }

  }

  render() {

    const {
      type,
      title,
      content,
      link
    } = this.props

    return (
      <div className="message-component">
        <Alert color={type}>
          <h5 className="alert-heading">{ title }</h5>
          <p>
            { content }
          </p>
          {link && <a href={link}>Send Again</a> }
        </Alert>
      </div>
    )
  }
}

export default Message


