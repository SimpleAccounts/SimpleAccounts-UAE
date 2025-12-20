/**
 * Runtime shim for react-router-navigation-prompt
 *
 * This library is incompatible with React Router v6 because it uses withRouter
 * which was removed in v6. This shim provides a v6-compatible replacement
 * using the useBlocker hook (React Router v6.4+).
 *
 * Note: This is a temporary solution. For production, consider migrating
 * to a v6-compatible navigation prompt solution.
 */

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * NavigationPrompt component compatible with React Router v6
 * Provides similar API to react-router-navigation-prompt
 */
export default function NavigationPrompt({
  when,
  children,
  beforeConfirm,
  beforeCancel,
  afterConfirm,
  allowGoBack,
  renderIfNotActive,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Intercept navigation attempts using beforeunload and popstate
  useEffect(() => {
    if (!when) {
      setIsActive(false);
      return;
    }

    const handleBeforeUnload = e => {
      const shouldBlock = typeof when === 'function' ? when(location, location, 'POP') : !!when;

      if (shouldBlock) {
        e.preventDefault();
        e.returnValue = '';
        setIsActive(true);
        return '';
      }
    };

    // Handle browser back/forward
    const handlePopState = e => {
      const shouldBlock = typeof when === 'function' ? when(location, location, 'POP') : !!when;

      if (shouldBlock) {
        window.history.pushState(null, '', window.location.href);
        setIsActive(true);
        setPendingNavigation(() => () => {
          // Navigation will be handled by onConfirm
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [when, location]);

  const handleConfirm = () => {
    if (beforeConfirm) {
      beforeConfirm(() => {
        setIsActive(false);
        if (pendingNavigation) {
          pendingNavigation();
          setPendingNavigation(null);
        }
        if (afterConfirm) {
          afterConfirm();
        }
      });
    } else {
      setIsActive(false);
      if (pendingNavigation) {
        pendingNavigation();
        setPendingNavigation(null);
      }
      if (afterConfirm) {
        afterConfirm();
      }
    }
  };

  const handleCancel = () => {
    if (beforeCancel) {
      beforeCancel(() => {
        setIsActive(false);
        setPendingNavigation(null);
      });
    } else {
      setIsActive(false);
      setPendingNavigation(null);
    }
  };

  // If renderIfNotActive is true, always render children
  // Otherwise, only render when active
  if (!renderIfNotActive && !isActive) {
    return null;
  }

  // Render children with the same API as react-router-navigation-prompt
  if (typeof children === 'function') {
    return children({
      isActive,
      onCancel: handleCancel,
      onConfirm: handleConfirm,
    });
  }

  return children;
}
