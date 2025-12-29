import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const checkPasswordStrength = password => {
  const checks = {
    minLength: password.length >= 8,
    maxLength: password.length <= 255,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[#?!@$%^&*-]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  return { checks, score };
};

const getStrengthLabel = score => {
  if (score <= 2) return { label: 'Weak', color: 'bg-destructive' };
  if (score <= 4) return { label: 'Fair', color: 'bg-yellow-500' };
  if (score <= 5) return { label: 'Good', color: 'bg-blue-500' };
  return { label: 'Strong', color: 'bg-green-500' };
};

export function PasswordStrengthMeter({ password, showChecklist = true, className }) {
  const { checks, score } = checkPasswordStrength(password || '');
  const { label, color } = getStrengthLabel(score);
  const percentage = (score / 6) * 100;

  if (!password) return null;

  const requirements = [
    { key: 'minLength', label: 'At least 8 characters', met: checks.minLength },
    { key: 'maxLength', label: 'Maximum 255 characters', met: checks.maxLength },
    { key: 'hasUppercase', label: 'One uppercase letter', met: checks.hasUppercase },
    { key: 'hasLowercase', label: 'One lowercase letter', met: checks.hasLowercase },
    { key: 'hasNumber', label: 'One number', met: checks.hasNumber },
    { key: 'hasSpecial', label: 'One special character (#?!@$%^&*-)', met: checks.hasSpecial },
  ];

  return (
    <div className={cn('space-y-3 animate-fade-in', className)}>
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span
            className={cn('font-medium transition-colors duration-300', {
              'text-destructive': score <= 2,
              'text-yellow-600 dark:text-yellow-400': score > 2 && score <= 4,
              'text-blue-600 dark:text-blue-400': score > 4 && score <= 5,
              'text-green-600 dark:text-green-400': score > 5,
            })}
          >
            {label}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-500 ease-out rounded-full', color)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      {showChecklist && (
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs"
          role="list"
          aria-label="Password requirements"
        >
          {requirements.map(req => (
            <li
              key={req.key}
              className={cn(
                'flex items-center gap-1.5 transition-colors duration-200',
                req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
              )}
            >
              {req.met ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              ) : (
                <X className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              )}
              <span className={req.met ? '' : 'opacity-70'}>{req.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PasswordStrengthMeter;
