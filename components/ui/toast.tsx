'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'pointer-events-none fixed inset-x-0 top-0 z-[100] flex max-h-screen flex-col gap-3 p-4 sm:inset-x-auto sm:bottom-0 sm:right-0 sm:top-auto sm:w-full sm:max-w-[420px] sm:flex-col',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  'group pointer-events-auto relative grid w-full grid-cols-[1fr_auto] items-start gap-3 overflow-hidden rounded-2xl border p-4 pr-10 shadow-2xl backdrop-blur-xl transition-all duration-300 before:absolute before:inset-y-0 before:left-0 before:w-1 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-4 data-[state=open]:sm:slide-in-from-bottom-4',
  {
    variants: {
      variant: {
        default: 'border-white/10 bg-slate-950/88 text-slate-50 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.9)] before:bg-sky-400/80',
        destructive:
          'destructive group border-red-500/25 bg-slate-950/92 text-red-50 shadow-[0_18px_48px_-24px_rgba(127,29,29,0.9)] before:bg-red-400/85',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-slate-100 ring-offset-background transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-400/20 group-[.destructive]:bg-red-500/10 group-[.destructive]:text-red-100 group-[.destructive]:hover:bg-red-500/20 group-[.destructive]:focus:ring-red-400/60',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-3 top-3 rounded-lg p-1 text-slate-400 opacity-70 transition-all hover:bg-white/5 hover:text-slate-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-sky-400/60 group-hover:opacity-100 group-[.destructive]:text-red-200 group-[.destructive]:hover:bg-red-500/10 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400/60',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold leading-5 tracking-tight', className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm leading-5 text-slate-300', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
