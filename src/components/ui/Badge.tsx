import React from 'react';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  MessageSquare,
  ArrowUpRight,
} from 'lucide-react';
import { OutreachStatus, VerificationStatus } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'verified'
    | 'pattern_matched'
    | 'unverified'
    | 'demo'
    | 'status_not_contacted'
    | 'status_contacted'
    | 'status_replied'
    | 'status_follow_up'
    | 'outline';
  icon?: boolean;
}

export function Badge({
  className,
  variant = 'default',
  icon = false,
  children,
  ...props
}: BadgeProps) {
  const base =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide transition-colors select-none';

  const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-white/5 text-[#8892aa] border border-white/8',
    outline: 'bg-transparent text-[#505870] border border-white/8',
    demo: 'bg-blue-500/12 text-blue-300 border border-blue-500/20',
    verified: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
    pattern_matched: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
    unverified: 'bg-white/4 text-[#505870] border border-white/7',
    status_not_contacted: 'bg-white/4 text-[#505870] border border-white/7',
    status_contacted: 'bg-blue-500/12 text-blue-400 border border-blue-500/20',
    status_replied: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
    status_follow_up: 'bg-amber-400/10 text-amber-400 border border-amber-400/20',
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {icon && variant === 'verified' && (
        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
      )}
      {icon && variant === 'pattern_matched' && (
        <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
      )}
      {icon && variant === 'unverified' && (
        <HelpCircle className="w-3 h-3 text-[#505870] shrink-0" />
      )}
      {icon && variant === 'status_not_contacted' && (
        <Clock className="w-3 h-3 shrink-0" />
      )}
      {icon && variant === 'status_contacted' && (
        <ArrowUpRight className="w-3 h-3 shrink-0" />
      )}
      {icon && variant === 'status_replied' && (
        <MessageSquare className="w-3 h-3 shrink-0" />
      )}
      {icon && variant === 'status_follow_up' && (
        <AlertCircle className="w-3 h-3 shrink-0" />
      )}
      {children}
    </span>
  );
}

export function VerificationBadge({
  status,
  confidence,
}: {
  status: VerificationStatus;
  confidence?: number;
}) {
  if (status === 'verified') {
    return (
      <Badge variant="verified" icon>
        Verified{confidence ? ` · ${confidence}%` : ''}
      </Badge>
    );
  }
  if (status === 'pattern_matched') {
    return (
      <Badge variant="pattern_matched" icon>
        Matched{confidence ? ` · ${confidence}%` : ''}
      </Badge>
    );
  }
  return (
    <Badge variant="unverified" icon>
      Unverified
    </Badge>
  );
}

export function OutreachStatusBadge({ status }: { status: OutreachStatus }) {
  const config: Record<OutreachStatus, { label: string; variant: BadgeProps['variant'] }> = {
    not_contacted: { label: 'Not Contacted', variant: 'status_not_contacted' },
    contacted: { label: 'Contacted', variant: 'status_contacted' },
    replied: { label: 'Replied', variant: 'status_replied' },
    follow_up: { label: 'Follow-up', variant: 'status_follow_up' },
  };
  const current = config[status] ?? config.not_contacted;
  return (
    <Badge variant={current.variant} icon>
      {current.label}
    </Badge>
  );
}
