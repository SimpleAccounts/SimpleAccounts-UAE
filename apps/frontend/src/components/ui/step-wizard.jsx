import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StepWizard({ steps, currentStep, onStepClick, className }) {
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <ol className="flex items-center justify-between" role="list">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isClickable = stepNumber <= currentStep;

          return (
            <li key={step.id} className="relative flex-1 flex justify-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-5 left-1/2 w-full h-[6px] rounded-full transition-all duration-500 ease-in-out shadow-neu-in dark:shadow-neu-in-dark',
                    isCompleted ? 'bg-primary/20' : 'bg-transparent'
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Step indicator */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(stepNumber)}
                disabled={!isClickable}
                className={cn(
                  'relative flex flex-col items-center group focus:outline-none',
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                )}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${stepNumber}: ${step.title}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
              >
                {/* Circle */}
                <span
                  className={cn(
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300',
                    isCompleted
                      ? 'bg-neu-bg dark:bg-neu-bg-dark text-primary shadow-neu-in dark:shadow-neu-in-dark'
                      : isCurrent
                        ? 'bg-primary text-primary-foreground shadow-neu-out dark:shadow-neu-out-dark scale-110'
                        : 'bg-neu-bg dark:bg-neu-bg-dark text-muted-foreground shadow-neu-out dark:shadow-neu-out-dark',
                    isClickable && !isCompleted && 'group-hover:translate-y-[-1px]'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 animate-scale-in stroke-[3]" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-bold">{stepNumber}</span>
                  )}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    'mt-3 text-xs font-bold uppercase tracking-wider text-center transition-colors duration-200 hidden sm:block',
                    isCurrent
                      ? 'text-primary'
                      : isCompleted
                        ? 'text-foreground/80'
                        : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function StepContent({ children, isActive, className }) {
  if (!isActive) return null;

  return (
    <div className={cn('animate-fade-in', className)} role="tabpanel">
      {children}
    </div>
  );
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
  canProceed = true,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  submitLabel = 'Submit',
  className,
}) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className={cn('flex justify-between gap-4 pt-6', className)}>
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep}
        className={cn(
          'px-6 py-2 rounded-xl font-bold transition-all duration-200',
          'bg-neu-bg dark:bg-neu-bg-dark text-foreground border-none shadow-neu-out dark:shadow-neu-out-dark hover:shadow-neu-in dark:hover:shadow-neu-in-dark',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        )}
        aria-label={`Go to previous step`}
      >
        {previousLabel}
      </button>

      {isLastStep ? (
        <button
          type="submit"
          onClick={onSubmit}
          disabled={!canProceed || isSubmitting}
          className={cn(
            'px-6 py-2 rounded-xl font-bold transition-all duration-200',
            'bg-primary text-primary-foreground shadow-neu-out dark:shadow-neu-out-dark hover:translate-y-[-1px] active:shadow-neu-in dark:active:shadow-neu-in-dark',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          aria-label="Submit registration"
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            'px-6 py-2 rounded-xl font-bold transition-all duration-200',
            'bg-primary text-primary-foreground shadow-neu-out dark:shadow-neu-out-dark hover:translate-y-[-1px] active:shadow-neu-in dark:active:shadow-neu-in-dark',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          aria-label={`Go to next step`}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}

export default StepWizard;
