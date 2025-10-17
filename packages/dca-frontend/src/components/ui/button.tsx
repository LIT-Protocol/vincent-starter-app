import React from 'react';

const baseStyles =
  'font-medium tracking-wide transition-all duration-200 border rounded-lg flex items-center justify-center gap-2 outline-none focus:outline-none focus-visible:ring-0';

const variantStyles = {
  primary: 'text-white hover:opacity-90',
  'primary-outline': 'bg-transparent hover:opacity-80',
  secondary: 'text-white dark:text-black hover:opacity-80',
  'secondary-outline': 'bg-transparent hover:opacity-80',
  destructive: 'text-white hover:opacity-90',
  'destructive-outline': 'bg-transparent hover:opacity-80',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
  outline: 'bg-transparent hover:opacity-80',
};

const sizeStyles = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-6 py-3',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The visual style variant of the button */
  variant?:
    | 'primary'
    | 'primary-outline'
    | 'secondary'
    | 'secondary-outline'
    | 'destructive'
    | 'destructive-outline'
    | 'ghost'
    | 'outline';
  /** The size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** The content to display inside the button */
  children?: React.ReactNode;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: '#FF4205',
        borderColor: '#FF4205',
      };
    case 'primary-outline':
      return {
        color: '#FF4205',
        borderColor: '#FF4205',
      };
    case 'secondary':
      return {
        backgroundColor: 'var(--footer-text-color, #121212)',
        borderColor: 'var(--footer-text-color, #121212)',
      };
    case 'outline':
      return {
        color: 'var(--footer-text-color, #121212)',
        borderColor: 'var(--footer-text-color, #121212)',
      };
    case 'secondary-outline':
      return {
        color: 'var(--footer-text-color, #121212)',
        borderColor: 'var(--footer-text-color, #121212)',
      };
    case 'destructive':
      return {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
      };
    case 'destructive-outline':
      return {
        color: '#ef4444',
        borderColor: '#ef4444',
      };
    case 'ghost':
      return {
        borderColor: 'transparent',
      };
    default:
      return {};
  }
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`;

  const buttonStyle = {
    fontFamily: 'Poppins, system-ui, sans-serif',
    outline: 'none',
    ...getVariantStyles(variant),
    ...style,
  };

  return (
    <button className={combinedClassName} disabled={disabled} style={buttonStyle} {...props}>
      {children}
    </button>
  );
};
