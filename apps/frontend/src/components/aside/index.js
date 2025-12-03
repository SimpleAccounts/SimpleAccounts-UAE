import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './style.scss'

const propTypes = {
  children: PropTypes.node,
}

const defaultProps = {}

class Aside extends Component {

  render() {

    // const { children} = this.props

    return (
      <React.Fragment>
      </React.Fragment>
    );
  }
}

Aside.propTypes = propTypes
Aside.defaultProps = defaultProps

export default Aside
