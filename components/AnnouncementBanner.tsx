'use client';

import { useState, useEffect } from 'react';
import { X, CircleAlert as AlertCircle, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Info } from 'lucide-react';

interface AnnouncementBannerProps {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  dismissible?: boolean;
  autoClose?: number;
  onDismiss?: () => void;
}

export function AnnouncementBanner({
  id,
  title,
  message,
  type = 'info',
  dismissible = true,
  autoClose,
  onDismiss,
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(`announcement-${id}`);
    if (dismissed) {
      setIsVisible(false);
    }
  }, [id]);

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible]);

  const handleDismiss = () => {
    localStorage.setItem(`announcement-${id}`, 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const typeConfig = {
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      icon: Info,
      color: 'text-blue-400',
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      icon: AlertTriangle,
      color: 'text-amber-400',
    },
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      icon: CheckCircle,
      color: 'text-emerald-400',
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: AlertCircle,
      color: 'text-red-400',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.border} border-l-4 p-4 rounded-lg flex items-start gap-4`}
      dir="rtl"
    >
      <Icon className={`h-6 w-6 flex-shrink-0 mt-0.5 ${config.color}`} />
      <div className="flex-1">
        <h3 className={`font-bold mb-1 ${config.color}`}>{title}</h3>
        <p className="text-gray-300 text-sm">{message}</p>
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-300 transition-colors flex-shrink-0 mt-0.5"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
