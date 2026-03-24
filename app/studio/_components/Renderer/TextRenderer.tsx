'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { useStudioStore } from '~/studio/_lib/store';
import type { StudioNode } from '~/studio/_lib/types';
import { ensureStudioFontLoaded } from '~/studio/_lib/utils/fonts';

interface TextRendererProps {
  node: StudioNode;
  children?: React.ReactNode;
}

export const TextRenderer = React.memo(function TextRenderer({
  node,
}: TextRendererProps) {
  const isFocused = useStudioStore((s) => s.focusedId === node.id);
  const setFocused = useStudioStore((s) => s.setFocused);
  const updateNode = useStudioStore((s) => s.updateNode);
  const pushHistory = useStudioStore((s) => s.pushHistory);
  const ref = useRef<HTMLDivElement>(null);
  const textProps = node.textProps;

  useEffect(() => {
    if (isFocused && ref.current) {
      ref.current.focus();
      // Select all text on focus
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isFocused]);

  useEffect(() => {
    if (textProps?.fontFamily) {
      ensureStudioFontLoaded(textProps.fontFamily);
    }
  }, [textProps?.fontFamily]);

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setFocused(node.id);
    },
    [node.id, setFocused]
  );

  const handleBlur = useCallback(() => {
    if (ref.current && textProps) {
      const newContent = ref.current.innerText;
      if (newContent !== textProps.content) {
        pushHistory();
        updateNode(node.id, {
          textProps: { ...textProps, content: newContent },
        });
      }
    }
    setFocused(null);
  }, [node.id, textProps, updateNode, setFocused, pushHistory]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFocused(null);
        ref.current?.blur();
      }
      // Prevent canvas shortcuts while editing text
      e.stopPropagation();
    },
    [setFocused]
  );

  if (!textProps) return null;

  const style: React.CSSProperties = {
    fontSize: textProps.fontSize,
    fontFamily: textProps.fontFamily,
    fontWeight: textProps.fontWeight,
    lineHeight: textProps.lineHeight,
    letterSpacing: textProps.letterSpacing,
    textAlign: textProps.textAlign,
    color: textProps.color,
    textDecoration: textProps.textDecoration !== 'none' ? textProps.textDecoration : undefined,
    textShadow: textProps.textShadow,
    outline: 'none',
    minWidth: 20,
    cursor: isFocused ? 'text' : 'default',
  };

  if (textProps.gradient) {
    style.background = textProps.gradient;
    style.WebkitBackgroundClip = 'text';
    style.WebkitTextFillColor = 'transparent';
    style.backgroundClip = 'text';
  }

  // Size from transform
  if (typeof node.transform.size.width === 'number') {
    style.width = node.transform.size.width;
  }

  return (
    <div
      ref={ref}
      contentEditable={isFocused}
      suppressContentEditableWarning
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      onKeyDown={isFocused ? handleKeyDown : undefined}
      style={style}
      data-text-id={node.id}
    >
      {textProps.content}
    </div>
  );
});
