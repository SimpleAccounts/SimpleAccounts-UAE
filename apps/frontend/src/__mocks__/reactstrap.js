// Mock reactstrap components for testing

export const Row = ({ children, ...props }) => (
  <div className="row" {...props}>
    {children}
  </div>
);
export const Col = ({ children, ...props }) => (
  <div className="col" {...props}>
    {children}
  </div>
);
export const FormGroup = ({ children, ...props }) => (
  <div className="form-group" {...props}>
    {children}
  </div>
);
export const Label = ({ children, htmlFor, ...props }) => (
  <label htmlFor={htmlFor} {...props}>
    {children}
  </label>
);
export const UncontrolledTooltip = () => null;
export const Input = ({ ...props }) => <input {...props} />;
export const Button = ({ children, ...props }) => <button {...props}>{children}</button>;
export const ButtonGroup = ({ children, ...props }) => (
  <div className="btn-group" {...props}>
    {children}
  </div>
);
export const Card = ({ children, ...props }) => (
  <div className="card" {...props}>
    {children}
  </div>
);
export const CardBody = ({ children, ...props }) => (
  <div className="card-body" {...props}>
    {children}
  </div>
);
export const CardHeader = ({ children, ...props }) => (
  <div className="card-header" {...props}>
    {children}
  </div>
);
export default {};
