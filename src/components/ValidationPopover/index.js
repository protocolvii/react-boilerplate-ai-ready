import React, { cloneElement, useId, useRef, useState } from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { CircleAlert } from 'lucide-react';
import { Popover, PopoverAnchor, PopoverContent } from '../ui/popover';
import { FieldError } from '../ui/field';
import { cn } from '../../utils/cn';
import styles from './styles.css';

// children 是单个可聚焦控件；attempt 每次提交递增，用于 Escape 后再次提交时重新提示。
export default function ValidationPopover({ children, message, attempt = 0, errorId: providedId, className }) {
  const generatedId = useId();
  const errorId = providedId || `${generatedId}-error`;
  const anchor = useRef(null);
  const [focused, setFocused] = useState(false);
  const [dismissedAt, setDismissedAt] = useState(null);
  const open = !!message && focused && dismissedAt !== attempt;
  const description = [...new Set([children.props['aria-describedby'], message && errorId].filter(Boolean).flatMap(value => value.split(' ')))].join(' ') || undefined;
  return (
    <Popover
      open={open}
      onOpenChange={next => {
        if (!next) setDismissedAt(attempt);
      }}
    >
      <PopoverAnchor asChild>
        <div
          ref={anchor}
          className={cn('min-w-0', className)}
          onFocusCapture={event => {
            if (anchor.current?.contains(event.target)) {
              setFocused(true);
              setDismissedAt(null);
            }
          }}
          onBlurCapture={() => setFocused(false)}
          onPointerDownCapture={() => setDismissedAt(null)}
        >
          {cloneElement(children, { 'aria-invalid': !!message, 'aria-describedby': description })}
          {message && (
            <span id={errorId} className="sr-only">
              {message}
            </span>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        aria-label="校验提示"
        side="top"
        align="end"
        sideOffset={4}
        collisionPadding={12}
        className={cn(styles.feedback, 'pointer-events-none w-max max-w-[min(20rem,calc(100vw-1.5rem))] border-destructive/20 px-3 py-2 shadow-md')}
        onOpenAutoFocus={event => event.preventDefault()}
        onCloseAutoFocus={event => event.preventDefault()}
        onInteractOutside={event => {
          if (anchor.current?.contains(event.target)) event.preventDefault();
        }}
      >
        <FieldError className="flex items-start gap-2 text-xs leading-5">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </FieldError>
        <PopoverPrimitive.Arrow className="fill-popover" width={10} height={5} />
      </PopoverContent>
    </Popover>
  );
}
