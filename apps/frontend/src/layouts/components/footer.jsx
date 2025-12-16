import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import logo from 'assets/images/brand/logo.png';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: window['localStorage'].getItem('language') || 'en',
    };
  }

  handleLanguageChange = (value) => {
    localStorage.setItem('language', value);
    this.setState({ language: value });
    window.location.reload(false);
  };

  render() {
    const { language } = this.state;

    return (
      <footer className="border-t bg-background">
        <div className="container flex h-14 items-center justify-between px-4">
          <img src={logo} alt="SimpleAccounts Logo" className="h-8 w-auto" />
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Change Language:</span>
            <Select value={language} onValueChange={this.handleLanguageChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="it">French</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </footer>
    );
  }
}

Footer.propTypes = propTypes;
Footer.defaultProps = defaultProps;

export default Footer;

