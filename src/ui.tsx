import React, { useEffect, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BookOpen, Calculator, Download, FolderKanban, Grid3x3, LayoutTemplate, WifiOff } from 'lucide-react';
import type { Lang, TabId } from './core';
import { tFor } from './core';

/* ==========================================================================
   Knit Workshop — Modern Monochrome Studio Primitives
   ========================================================================== */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* --------------------------------------------------------------------------
   Online & PWA Install Hooks
   -------------------------------------------------------------------------- */

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

/* --------------------------------------------------------------------------
   Typed Studio UI Primitives (CVA + Tailwind Merge)
   -------------------------------------------------------------------------- */

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-kw-sm border font-medium whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'border-transparent bg-accent text-accent-fg shadow-kw-sm hover:bg-accent-hover',
        secondary: 'border-line bg-surface-subtle/85 text-ink hover:bg-surface-hover hover:border-line-strong',
        danger: 'border-danger-line bg-danger-bg/50 text-danger hover:bg-danger-bg',
        icon: 'border-transparent bg-transparent text-ink-secondary hover:text-ink hover:bg-surface-hover',
        ghost: 'border-transparent bg-transparent text-ink-muted hover:text-ink hover:bg-surface-hover',
      },
      size: {
        sm: 'min-h-[32px] px-2.5 py-1 text-xs',
        md: 'min-h-[36px] px-3.5 py-1.5 text-[13px]',
        lg: 'min-h-[52px] px-6 py-3 text-[15px] rounded-kw-md font-semibold',
        icon: 'min-h-[34px] min-w-[34px] p-0',
        iconSm: 'min-h-[30px] min-w-[30px] p-0',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button: React.FC<ButtonProps> = ({ variant, size, className, type = 'button', ...props }) => (
  <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
);

const toggleButtonVariants = cva(
  'inline-flex items-center justify-center cursor-pointer whitespace-nowrap disabled:opacity-35 disabled:cursor-not-allowed active:scale-[0.98]',
  {
    variants: {
      layout: {
        tile: 'flex-col gap-1 rounded-kw-sm border border-transparent bg-transparent px-1.5 py-2 min-h-[46px] text-[11px] font-medium text-ink-secondary hover:text-ink hover:bg-surface-hover',
        inline: 'gap-1.5 rounded-kw-sm border border-line bg-surface-subtle/85 px-2.5 py-1.5 min-h-[34px] text-xs font-medium text-ink-secondary hover:text-ink hover:bg-surface-hover',
        panel: 'min-h-[34px] min-w-[34px] rounded-kw-sm border border-line bg-surface-subtle/85 px-2.5 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink hover:bg-surface-hover',
        row: 'w-full justify-start gap-2 rounded-kw-sm border border-transparent bg-surface-subtle/60 px-2.5 py-1.5 min-h-[36px] text-left text-[13px] font-medium text-ink hover:bg-surface-hover',
        seg: 'px-2.5 py-1 min-h-[28px] rounded-[4px] text-xs font-medium text-ink-muted hover:text-ink',
      },
      tone: {
        accent: '',
        symmetry: '',
        success: '',
        neutral: '',
      },
      pressed: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        tone: 'accent',
        pressed: true,
        layout: 'tile',
        className: 'bg-accent text-accent-fg font-semibold hover:bg-accent-hover hover:text-accent-fg shadow-kw-sm',
      },
      {
        tone: 'accent',
        pressed: true,
        layout: 'row',
        className: 'bg-accent text-accent-fg font-semibold hover:bg-accent-hover hover:text-accent-fg shadow-kw-sm',
      },
      {
        tone: 'accent',
        pressed: true,
        layout: 'panel',
        className: 'border-accent-line bg-accent-soft text-ink font-semibold',
      },
      {
        tone: 'accent',
        pressed: true,
        layout: 'inline',
        className: 'border-transparent bg-accent text-accent-fg font-semibold hover:bg-accent-hover hover:text-accent-fg shadow-kw-sm',
      },
      {
        tone: 'symmetry',
        pressed: true,
        className: 'border-accent-line bg-accent text-accent-fg font-semibold hover:bg-accent-hover hover:text-accent-fg',
      },
      {
        tone: 'success',
        pressed: true,
        className: 'border-accent-line bg-accent text-accent-fg font-semibold',
      },
      {
        tone: 'neutral',
        pressed: true,
        layout: 'seg',
        className: 'bg-surface dark:bg-surface-hover text-ink font-semibold shadow-kw-sm',
      },
    ],
    defaultVariants: {
      layout: 'inline',
      tone: 'accent',
      pressed: false,
    },
  }
);

export interface ToggleButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed'>,
    VariantProps<typeof toggleButtonVariants> {
  pressed: boolean;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  layout,
  tone,
  pressed,
  className,
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    aria-pressed={pressed}
    className={cn(toggleButtonVariants({ layout, tone, pressed }), className)}
    {...props}
  />
);

export const SegmentedControl: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn('inline-flex p-0.5 gap-0.5 rounded-kw-sm bg-surface-subtle border border-line', className)}
    {...props}
  />
);

export const Card: React.FC<React.HTMLAttributes<HTMLElement>> = ({ className, ...props }) => (
  <section
    className={cn('rounded-kw-lg border border-line bg-surface p-6 shadow-kw-sm', className)}
    {...props}
  />
);

export const Panel: React.FC<React.HTMLAttributes<HTMLElement>> = ({ className, ...props }) => (
  <section
    className={cn('rounded-kw-md border border-line bg-surface p-3.5', className)}
    {...props}
  />
);

export const CollapsiblePanel: React.FC<{
  title: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ title, defaultOpen = false, className, children }) => (
  <details
    open={defaultOpen}
    className={cn('rounded-kw-md border border-line bg-surface p-3.5', className)}
  >
    <summary className="font-display text-sm font-semibold text-ink cursor-pointer select-none min-h-[38px] flex items-center">
      {title}
    </summary>
    {children}
  </details>
);

export const SectionTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h2
    className={cn('font-display text-lg font-semibold tracking-tight text-ink border-b border-line pb-2.5', className)}
    {...props}
  />
);

export const FieldLabel: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className, ...props }) => (
  <span className={cn('block text-xs font-medium text-ink-secondary mb-1.5', className)} {...props} />
);

const controlBase =
  'w-full rounded-kw-sm border border-line bg-surface-subtle/80 text-ink focus:bg-surface focus:border-accent-line transition-colors';

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { compact?: boolean }> = ({
  compact,
  className,
  ...props
}) => (
  <input
    className={cn(controlBase, compact ? 'px-2.5 py-1.5 text-[13px] min-h-[34px]' : 'px-3 py-2 text-sm min-h-[40px]', className)}
    {...props}
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { compact?: boolean }> = ({
  compact,
  className,
  ...props
}) => (
  <select
    className={cn(controlBase, compact ? 'px-2.5 py-1.5 text-[13px] min-h-[34px]' : 'px-3 py-2 text-sm min-h-[40px]', className)}
    {...props}
  />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
  <textarea className={cn(controlBase, 'px-3 py-2 text-sm', className)} {...props} />
);

export const TableWrap: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn('overflow-x-auto rounded-kw-md border border-line bg-surface', className)} {...props}>
    {children}
  </div>
);

export const Alert: React.FC<React.HTMLAttributes<HTMLDivElement> & { tone?: 'warning' | 'danger' }> = ({
  tone = 'warning',
  className,
  ...props
}) => (
  <div
    className={cn(
      'rounded-kw-md border px-3.5 py-2.5 text-[13px] font-medium leading-relaxed',
      tone === 'danger'
        ? 'border-danger-line bg-danger-bg text-danger'
        : 'border-warning-line bg-[#FFFBEB] text-[#18181B] dark:bg-warning-bg dark:text-[#FEF3C7]',
      className
    )}
    {...props}
  />
);

export const Modal: React.FC<{
  open: boolean;
  onClose?: () => void;
  maxWidthClass?: string;
  children: React.ReactNode;
}> = ({ open, onClose, maxWidthClass = 'max-w-2xl', children }) => {
  if (!open) return null;
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      className="fixed inset-0 z-[var(--kw-z-modal)] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'w-full rounded-kw-lg border border-line-strong bg-surface shadow-kw-lg overflow-hidden flex flex-col',
          maxWidthClass
        )}
      >
        {children}
      </div>
    </div>
  );
};

/* --------------------------------------------------------------------------
   App Shell Components (TopBar, PWAInstallButton, OfflineIndicator)
   -------------------------------------------------------------------------- */

const TAB_ITEMS: Array<{ id: TabId; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'draw', icon: Grid3x3 },
  { id: 'calc', icon: Calculator },
  { id: 'tpl', icon: LayoutTemplate },
  { id: 'proj', icon: FolderKanban },
  { id: 'ref', icon: BookOpen },
];

export const TopBar: React.FC<{
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenLibrary: () => void;
  lang: Lang;
}> = ({ activeTab, onSelectTab, onOpenLibrary, lang }) => {
  const t = tFor(lang);

  return (
    <>
      <header className="sticky top-0 z-[var(--kw-z-header)] border-b border-line bg-surface/95 backdrop-blur-md">
        <div className="flex h-12 w-full items-center justify-between gap-8 px-4 sm:px-5">
          <a
            href="#designer"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('draw');
            }}
            className="font-display text-[15px] font-bold tracking-tight text-ink whitespace-nowrap shrink-0"
          >
            {t.brand}
          </a>

          <nav aria-label="Primary" className="hidden md:flex h-full items-stretch gap-6">
            {TAB_ITEMS.map(({ id }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectTab(id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative inline-flex items-center h-full text-[13px] whitespace-nowrap shrink-0 cursor-pointer',
                    active
                      ? 'text-ink font-semibold after:content-[""] after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-ink'
                      : 'text-ink-muted font-medium hover:text-ink'
                  )}
                >
                  {t.tabs[id]}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center shrink-0">
            <Button variant="primary" size="sm" onClick={onOpenLibrary}>
              {t.topbar.library}
            </Button>
          </div>
        </div>
      </header>

      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-[var(--kw-z-header)] border-t border-line bg-surface/95 backdrop-blur-md pb-safe"
      >
        <div className="grid grid-cols-5 h-14">
          {TAB_ITEMS.map(({ id, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectTab(id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] px-1 cursor-pointer',
                  active ? 'text-ink font-semibold' : 'text-ink-muted font-medium'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px] leading-tight whitespace-nowrap truncate max-w-full">
                  {t.tabs[id]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export const PWAInstallButton: React.FC<{ lang: Lang }> = ({ lang }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <Button variant="secondary" size="sm" onClick={install}>
        <Download className="w-3.5 h-3.5 text-ink" />
        {lang === 'hu' ? 'Telepítés' : 'Install'}
      </Button>
    );
  }

  if (isIOS) {
    return (
      <>
        <Button variant="secondary" size="sm" onClick={() => setShowIOSGuide(true)}>
          <Download className="w-3.5 h-3.5 text-ink" />
          {lang === 'hu' ? 'Telepítés' : 'Install'}
        </Button>

        <Modal open={showIOSGuide} onClose={() => setShowIOSGuide(false)} maxWidthClass="max-w-sm p-6">
          <SectionTitle>
            {lang === 'hu' ? 'Telepítés iPhone / iPad készülékre' : 'Install on iPhone / iPad'}
          </SectionTitle>
          <p className="mt-3 text-sm text-ink-muted leading-relaxed">
            {lang === 'hu' ? (
              <>
                1. Koppints a Safari alsó sávjában a <strong>Megosztás</strong> gombra.<br />
                2. Görgess le és válaszd a <strong>Hozzáadás a főképernyőhöz</strong> menüpontot.
              </>
            ) : (
              <>
                1. Tap the <strong>Share</strong> button in Safari toolbar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.
              </>
            )}
          </p>
          <Button variant="primary" onClick={() => setShowIOSGuide(false)} className="mt-5 w-full">
            {lang === 'hu' ? 'Bezárás' : 'Close'}
          </Button>
        </Modal>
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC<{ lang: Lang }> = ({ lang }) => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 md:bottom-4 left-4 z-[var(--kw-z-toast)] flex items-center gap-2 rounded-kw-md border border-line-strong bg-warning text-warning-fg px-3.5 py-2 text-xs font-semibold shadow-kw-md"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>{lang === 'hu' ? 'Offline mód — Helyben tárolt adatok aktívak' : 'Offline Mode — Running locally from cache'}</span>
    </div>
  );
};
