import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

import './style.scss';

const MessageWithNavigation = ({ type, title, content, link }) => {
  const navigate = useNavigate();

  // Map reactstrap color types to shadcn variants
  const variantMap = {
    success: 'success',
    danger: 'destructive',
    warning: 'warning',
    info: 'default', // or another appropriate variant
    default: 'default'
  };

  const variant = variantMap[type] || 'default';

  return (
    <div className="message-component">
      <Alert variant={variant}>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>
          <p
            style={{
              marginBottom: link ? '10px' : '0',
              // color: type === 'danger' ? '#721c24' : type === 'success' ? '#155724' : 'inherit', // colors handled by shadcn variant
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
                // color: type === 'danger' ? '#721c24' : '#155724',
                textDecoration: 'underline',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Send Again
            </a>
          )}
        </AlertDescription>
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

    // Map reactstrap color types to shadcn variants
    const variantMap = {
        success: 'success',
        danger: 'destructive',
        warning: 'warning',
        info: 'default',
        default: 'default'
    };
    
    const variant = variantMap[type] || 'default';

    return (
      <div className="message-component">
        <Alert variant={variant}>
          {title && <AlertTitle>{title}</AlertTitle>}
          <AlertDescription>
            <p
              style={{
                marginBottom: '0',
                // color: type === 'danger' ? '#721c24' : type === 'success' ? '#155724' : 'inherit',
                fontSize: '14px',
                lineHeight: '1.5',
              }}
            >
              {content}
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}

export default Message;
