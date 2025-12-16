import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, authApi, cryptoService } from 'utils';
import { AUTH } from 'constants/types';

// ============ Async Thunks ============

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'get',
        url: '/rest/user/current',
      };
      const res = await authApi(data);
      if (res.status === 200) {
        cryptoService.encryptService('userId', res.data.userId);
        return res.data;
      }
      return rejectWithValue('Auth Failed');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const logIn = createAsyncThunk('auth/logIn', async (obj, { rejectWithValue }) => {
  try {
    const data = {
      method: 'post',
      url: '/auth/token',
      data: obj,
    };
    const res = await api(data);
    window['localStorage'].setItem('accessToken', res.data.token);
    window['localStorage'].setItem('language', 'en');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const register = createAsyncThunk('auth/register', async (obj, { rejectWithValue }) => {
  try {
    const data = {
      method: 'post',
      url: '/rest/company/register',
      data: obj,
      // Content-Type will be automatically set by axios interceptor for FormData
    };
    const res = await api(data);
    return res.data;
  } catch (err) {
    // Handle CORS errors and network errors
    if (!err || !err.data) {
      return rejectWithValue({
        message: 'Network error or CORS issue. Please check backend logs.',
      });
    }
    return rejectWithValue(err.data || err.message);
  }
});

export const registerStrapiUser = createAsyncThunk(
  'auth/registerStrapiUser',
  async ({ obj, companyobj }, { rejectWithValue }) => {
    try {
      const data = {
        method: 'post',
        url: 'https://strapi-api.ae.simpleaccounts.io/api/auth/local/register',
        data: obj,
      };
      const res = await api(data);
      // Update company object with user id
      const key = 'id';
      const companyObjectKey = new RegExp(`"${key}"\\s*:\\s*"[^"]*"`);
      const companyJsonStr = JSON.stringify(companyobj).replace(
        companyObjectKey,
        `"${key}": "${res.data.user.id}"`
      );
      // Register company (this is a side effect, not part of the thunk)
      registerStrapiCompany(res.data.jwt, companyJsonStr);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Note: registerStrapiCompany is not a thunk, it's a regular async function
export const registerStrapiCompany = async (apiToken, companyObj) => {
  try {
    const data = {
      method: 'post',
      url: 'https://strapi-api.ae.simpleaccounts.io/api/companies',
      data: companyObj,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    };
    return await api(data);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// Internal thunk for getTimeZoneList (used in extraReducers if needed)
const getTimeZoneListThunk = createAsyncThunk(
  'auth/getTimeZoneList',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'get',
        url: '/rest/company/getTimeZoneList',
      };
      const res = await api(data);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue('Failed to get timezone list');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Wrapper for getTimeZoneList to maintain backward compatibility
// Old thunk returned the full response object (res), components expect response.data
export const getTimeZoneList = () => {
  return dispatch => {
    return dispatch(getTimeZoneListThunk()).then(action => {
      // Transform RTK action to old response format
      // Components expect response.data, so return { data: action.payload, status: 200 }
      if (action.type === 'auth/getTimeZoneList/fulfilled') {
        return { data: action.payload, status: 200 };
      }
      throw new Error('Failed to get timezone list');
    });
  };
};

// Internal thunk for getSimpleAccountsreleasenumber (used in extraReducers if needed)
const getSimpleAccountsreleasenumberThunk = createAsyncThunk(
  'auth/getSimpleAccountsreleasenumber',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'get',
        url: '/rest/company/getSimpleAccountsreleasenumber',
      };
      const res = await api(data);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue('Failed to get release number');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Wrapper for getSimpleAccountsreleasenumber to maintain backward compatibility
// Old thunk returned res.data directly, components expect that format
export const getSimpleAccountsreleasenumber = () => {
  return dispatch => {
    return dispatch(getSimpleAccountsreleasenumberThunk()).then(action => {
      // Transform RTK action to old response format
      // Components expect res.data directly (which has simpleAccountsRelease property)
      if (action.type === 'auth/getSimpleAccountsreleasenumber/fulfilled') {
        return action.payload; // This is res.data
      }
      throw new Error('Failed to get release number');
    });
  };
};

// Internal thunk for getCompanyCount (must be declared before createSlice)
const getCompanyCountThunk = createAsyncThunk(
  'auth/getCompanyCount',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'get',
        url: '/rest/company/getCompanyCount',
      };
      const res = await api(data);
      if (res.status === 200) {
        return { data: res.data, status: res.status };
      }
      return { data: 0, status: res.status };
    } catch (err) {
      return { data: 0, status: err.response?.status || 500 };
    }
  }
);

// ============ Slice ============

const initialState = {
  is_authed: true,
  profile: [],
  ccount: '',
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signedIn: state => {
      state.is_authed = true;
    },
    signedOut: state => {
      state.is_authed = false;
    },
    setUserProfile: (state, action) => {
      state.profile = action.payload;
    },
    setCompanyCount: (state, action) => {
      state.ccount = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // checkAuthStatus
      .addCase(checkAuthStatus.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.is_authed = true;
        state.profile = action.payload;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // logIn
      .addCase(logIn.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logIn.fulfilled, state => {
        state.loading = false;
        state.is_authed = true;
      })
      .addCase(logIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // register
      .addCase(register.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, state => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // getCompanyCount
      .addCase(getCompanyCountThunk.fulfilled, (state, action) => {
        // action.payload is { data: ..., status: ... }
        state.ccount = action.payload?.data || action.payload;
      })
      // Backward compatibility with old action types
      .addCase(AUTH.SIGNED_IN, state => {
        state.is_authed = true;
      })
      .addCase(AUTH.SIGNED_OUT, state => {
        state.is_authed = false;
      })
      .addCase(AUTH.USER_PROFILE, (state, action) => {
        state.profile = action.payload?.data || action.payload;
      })
      .addCase(AUTH.COMPANYCOUNT, (state, action) => {
        state.ccount = action.payload?.data || action.payload;
      });
  },
});

// Wrapper for getCompanyCount to maintain backward compatibility
// Old thunks returned the response directly (res object with res.data and res.status)
// This wrapper makes it behave exactly like the old thunk
export const getCompanyCount = () => {
  return dispatch => {
    const data = {
      method: 'get',
      url: '/rest/company/getCompanyCount',
    };
    return api(data)
      .then(res => {
        if (res.status === 200) {
          // Return the full response object to match old behavior exactly
          // Also dispatch the thunk to update state
          dispatch(getCompanyCountThunk());
          return res;
        }
        // Non-200 status: return response with data: 0 to allow registration
        const response = { ...res, data: 0, status: res.status };
        dispatch(getCompanyCountThunk.fulfilled({ payload: { data: 0, status: res.status } }));
        return response;
      })
      .catch(err => {
        // On error (e.g., 500 with no body, network error):
        // - Register screen: .then() won't execute, stays on register (good)
        // - Login screen: .catch() executes, sets companyCount to 0, shows register button (good)
        // But we want to be more robust: return a response object instead of throwing
        // This ensures both screens work correctly
        const response = {
          data: 0,
          status: err && err.status ? err.status : 500,
        };
        // Update state
        dispatch(getCompanyCountThunk.fulfilled({ payload: response }));
        // Return response instead of throwing - this allows register screen to work
        // Login screen's .catch() won't execute, but .then() will with data: 0
        return response;
      });
  };
};

export const logOut = () => dispatch => {
  window['localStorage'].clear();
  dispatch(authSlice.actions.signedOut());
};

export const { signedIn, signedOut, setUserProfile, setCompanyCount, clearError } =
  authSlice.actions;
export default authSlice.reducer;
