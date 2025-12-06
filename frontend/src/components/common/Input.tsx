import { InputHTMLAttributes, forwardRef } from 'react';
import classNames from 'classnames';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-semibold text-text mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={classNames(
            'w-full px-4 py-3 bg-background-light border-2 rounded-lg text-text placeholder:text-text-muted focus:outline-none transition-colors',
            error
              ? 'border-primary focus:border-primary'
              : 'border-secondary/50 focus:border-primary',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-primary flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

