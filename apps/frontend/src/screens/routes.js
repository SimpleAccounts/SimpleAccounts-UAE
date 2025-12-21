// Export screen module objects (not lazy-loaded) for use in routes
// This file imports the actual module objects so we can access .screen properties

import LogIn from './log_in/index.js';
import Register from './register/index.js';
import ResetPassword from './reset_password/index.js';
import NewPassword from './new_password/index.js';

export {
  LogIn,
  Register,
  ResetPassword,
  NewPassword,
};

