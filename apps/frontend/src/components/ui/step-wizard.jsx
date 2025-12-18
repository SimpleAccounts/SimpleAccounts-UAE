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
            <li key={step.id} className="relative flex-1">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-4 left-1/2 w-full h-0.5 transition-colors duration-300',
                    isCompleted ? 'bg-primary' : 'bg-muted'
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
                  'relative flex flex-col items-center group',
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                )}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${stepNumber}: ${step.title}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
              >
                {/* Circle */}
                <span
                  className={cn(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : isCurrent
                        ? 'bg-background border-primary text-primary'
                        : 'bg-background border-muted text-muted-foreground',
                    isClickable &&
                      !isCompleted &&
                      'group-hover:border-primary/70 group-hover:text-primary/70'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 animate-scale-in" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-medium">{stepNumber}</span>
                  )}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center transition-colors duration-200 hidden sm:block',
                    isCurrent
                      ? 'text-primary'
                      : isCompleted
                        ? 'text-foreground'
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
          'px-6 py-2 rounded-md font-medium transition-all duration-200',
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
          'disabled:opacity-50 disabled:cursor-not-allowed',
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
            'px-6 py-2 rounded-md font-medium transition-all duration-200',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'hover:scale-[1.02] active:scale-[0.98]'
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
            'px-6 py-2 rounded-md font-medium transition-all duration-200',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'hover:scale-[1.02] active:scale-[0.98]'
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
