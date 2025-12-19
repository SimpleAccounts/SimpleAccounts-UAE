import React from 'react';
import { Alert } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

import './style.scss';

const MessageWithNavigation = ({ type, title, content, link }) => {
  const navigate = useNavigate();

  return (
    <div className="message-component">
      <Alert color={type} fade={false}>
        {title && <h5 className="alert-heading">{title}</h5>}
        <p
          style={{
            marginBottom: link ? '10px' : '0',
            color: type === 'danger' ? '#721c24' : type === 'success' ? '#155724' : 'inherit',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
        >
          {content}
        </p>
        {link && (
          <a
            href={link}
            onClick={e => {
              e.preventDefault();
              navigate(link);
            }}
            style={{
              color: type === 'danger' ? '#721c24' : '#155724',
              textDecoration: 'underline',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Send Again
          </a>
        )}
      </Alert>
    </div>
  );
};

class Message extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { type, title, content, link } = this.props;

    // If link is provided, use the navigation-enabled version
    if (link) {
      return <MessageWithNavigation {...this.props} />;
    }

    return (
      <div className="message-component">
        <Alert color={type} fade={false}>
          {title && <h5 className="alert-heading">{title}</h5>}
          <p
            style={{
              marginBottom: '0',
              color: type === 'danger' ? '#721c24' : type === 'success' ? '#155724' : 'inherit',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            {content}
          </p>
        </Alert>
      </div>
    );
  }
}

export default Message;
