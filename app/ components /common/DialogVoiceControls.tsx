'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';

// --- Type Definitions ---
type HTMLElementWithValue = HTMLElement & { value?: string; checked?: boolean; isContentEditable: boolean };

const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, [role="button"], [role="checkbox"], [role="combobox"], [contenteditable="true"], [data-radix-collection-item]';

const PUNCTUATION_SHORTCUTS = [
  { phrase: 'question mark', value: '?' },
  { phrase: 'exclamation mark', value: '!' },
  { phrase: 'exclamation', value: '!' },
  { phrase: 'full stop', value: '.' },
  { phrase: 'period', value: '.' },
  { phrase: 'comma', value: ',' },
];

// --- Helper Functions ---
const isVisible = (element?: HTMLElement | null): boolean => {
  if (!element) return false;
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
};

const isEditable = (element?: HTMLElement | null): boolean => {
  if (!element) return false;
  const tag = element.tagName?.toLowerCase();
  return tag === 'input' || tag === 'textarea' || element.isContentEditable;
};

const getInteractiveAncestor = (element?: HTMLElement | null): HTMLElement | null => {
  return element?.closest?.(INTERACTIVE_SELECTOR) as HTMLElement | null || null;
};

const setNativeValue = (element: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  descriptor?.set?.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
};

const getFieldValue = (element?: HTMLElementWithValue | null): string => {
  if (!element) return '';
  return element.isContentEditable ? element.textContent || '' : element.value || '';
};

const setFieldValue = (element?: HTMLElementWithValue | null, value: string) => {
  if (!element) return;
  if (element.isContentEditable) {
    element.textContent = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }
  setNativeValue(element as HTMLInputElement, value);
};

const formatSpeechText = (text: string): string => {
  const withPunctuation = PUNCTUATION_SHORTCUTS.reduce((value, shortcut) => (
    value.replace(new RegExp(`\\b${shortcut.phrase}\\b`, 'gi'), shortcut.value)
  ), text);

  return withPunctuation
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/([,.!?])(?![\s,.!?]|$)/g, '$1 ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .replace(/(^|[.!?]\s+|\n)([a-z])/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`)
    .trim();
};

const getElementLabel = (container: HTMLElement, element?: HTMLElement | null): string => {
  if (!element) return '';

  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  const placeholder = element.getAttribute('placeholder');
  if (placeholder) return placeholder;

  const name = element.getAttribute('name');
  if (name) return name;

  const htmlFor = element.getAttribute('id');
  if (htmlFor) {
    const label = container.querySelector(`label[for="${htmlFor}"]`);
    if (label?.textContent) return label.textContent.trim();
  }

  const parentLabel = element.closest('label');
  if (parentLabel?.textContent) return parentLabel.textContent.trim();

  if (element.textContent?.trim()) return element.textContent.trim();
  return '';
};

// --- Component ---
interface Props {
  containerRef?: React.RefObject<HTMLElement | null>;
}

export default function DialogVoiceControls({ containerRef }: Props) {
  const [isSupported, setIsSupported] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [targetLabel, setTargetLabel] = React.useState('');

  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  const hoveredRef = React.useRef<HTMLElement | null>(null);
  const fieldHistoryRef = React.useRef<Map<string, string[]>>(new Map());
  const shouldKeepListeningRef = React.useRef(false);
  const restartTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const getContainer = React.useCallback(() => containerRef?.current || document.body, [containerRef]);

  const getFieldHistoryKey = React.useCallback((field?: HTMLElementWithValue | null): string => {
    if (!field) return '';
    return field.name || field.id || field.getAttribute('aria-label') || field.getAttribute('placeholder') || field.tagName;
  }, []);

  const pushFieldHistory = React.useCallback((field?: HTMLElementWithValue | null) => {
    if (!field) return;
    const key = getFieldHistoryKey(field);
    const currentValue = getFieldValue(field);
    const history = fieldHistoryRef.current.get(key) || [];

    if (history[history.length - 1] === currentValue) return;
    fieldHistoryRef.current.set(key, [...history, currentValue].slice(-10));
  }, [getFieldHistoryKey]);

  const clearHoveredHighlight = React.useCallback(() => {
    if (hoveredRef.current) {
      hoveredRef.current.style.outline = '';
      hoveredRef.current.style.outlineOffset = '';
    }
  }, []);

  const setHoveredTarget = React.useCallback((element: HTMLElement | null) => {
    const container = getContainer();
    clearHoveredHighlight();
    hoveredRef.current = element;

    if (hoveredRef.current) {
      hoveredRef.current.style.outline = '2px solid rgba(59, 130, 246, 0.85)';
      hoveredRef.current.style.outlineOffset = '2px';
      setTargetLabel(getElementLabel(container, hoveredRef.current) || 'current control');
    } else {
      setTargetLabel('');
    }
  }, [clearHoveredHighlight, getContainer]);

  const getEditableTarget = React.useCallback((): HTMLElementWithValue | null => {
    const container = getContainer();
    if (isEditable(hoveredRef.current) && container.contains(hoveredRef.current)) return hoveredRef.current;

    const activeElement = document.activeElement as HTMLElementWithValue | null;
    if (activeElement && container.contains(activeElement) && isEditable(activeElement)) return activeElement;

    const fields = Array.from(container.querySelectorAll('input, textarea, [contenteditable="true"]')) as HTMLElementWithValue[];
    return fields.find((field) => !field.disabled && !field.readOnly && isVisible(field)) || null;
  }, [getContainer]);

  const getCurrentTarget = React.useCallback((): HTMLElement | null => {
    const container = getContainer();
    if (hoveredRef.current && container.contains(hoveredRef.current) && isVisible(hoveredRef.current)) return hoveredRef.current;

    const activeElement = document.activeElement as HTMLElement | null;
    if (activeElement && container.contains(activeElement) && isVisible(activeElement)) {
      return getInteractiveAncestor(activeElement) || activeElement;
    }

    return null;
  }, [getContainer]);

  const focusAdjacentField = React.useCallback((direction: 'next' | 'previous') => {
    const container = getContainer();
    const fields = Array.from(
      container.querySelectorAll('input, textarea, select, [contenteditable="true"]')
    ).filter((field) => !field.disabled && !field.readOnly && isVisible(field)) as HTMLElement[];
    if (!fields.length) return;

    const current = getEditableTarget();
    const currentIndex = Math.max(fields.indexOf(current as HTMLElement) ?? 0, 0);
    const nextIndex = direction === 'next'
      ? Math.min(fields.length - 1, currentIndex + 1)
      : Math.max(0, currentIndex - 1);

    const target = fields[nextIndex];
    target?.focus();
    setHoveredTarget(getInteractiveAncestor(target) || target);
  }, [getContainer, getEditableTarget, setHoveredTarget]);

  const focusFieldByText = React.useCallback((targetText: string) => {
    const container = getContainer();
    const normalizedTarget = targetText.toLowerCase().trim();
    const labels = Array.from(container.querySelectorAll('label')).filter(isVisible);
    const matchingLabel = labels.find((label) => label.textContent?.toLowerCase().includes(normalizedTarget));

    if (matchingLabel) {
      const htmlFor = matchingLabel.getAttribute('for');
      const labelledField = htmlFor
        ? container.querySelector(`#${CSS.escape(htmlFor)}`)
        : matchingLabel.parentElement?.querySelector('input, textarea, select, [contenteditable="true"]');

      if (labelledField) {
        (labelledField as HTMLElement).focus();
        setHoveredTarget(getInteractiveAncestor(labelledField as HTMLElement) || labelledField as HTMLElement);
        toast.success(`Focused ${matchingLabel.textContent?.trim()}`);
        return true;
      }
    }

    const fields = Array.from(container.querySelectorAll('input, textarea, select')).filter(isVisible) as HTMLInputElement[];
    const byPlaceholder = fields.find((field) => {
      const placeholder = field.getAttribute('placeholder') || '';
      const name = field.getAttribute('name') || '';
      return placeholder.toLowerCase().includes(normalizedTarget) || name.toLowerCase().includes(normalizedTarget);
    });

    if (byPlaceholder) {
      byPlaceholder.focus();
      setHoveredTarget(byPlaceholder);
      toast.success(`Focused ${targetText}`);
      return true;
    }

    toast.error(`Couldn't find “${targetText}” in this dialog.`);
    return false;
  }, [getContainer, setHoveredTarget]);

  const insertIntoField = React.useCallback((text: string, { replace = false, addNewLine = false } = {}) => {
    const field = getEditableTarget();
    if (!field) {
      toast.error('No text field is selected in this dialog.');
      return;
    }

    pushFieldHistory(field);
    const currentValue = replace ? '' : getFieldValue(field);
    const formattedText = formatSpeechText(text);

    let nextValue = currentValue;
    if (addNewLine) {
      nextValue = formattedText ? `${currentValue}\n${formattedText}` : `${currentValue}\n`;
    } else if (formattedText) {
      const separator = currentValue && !/[\s\n]$/.test(currentValue) ? ' ' : '';
      nextValue = formatSpeechText(`${currentValue}${separator}${formattedText}`);
    } else if (replace) {
      nextValue = '';
    }

    setFieldValue(field, nextValue);
    field.focus();
    setHoveredTarget(field);
  }, [getEditableTarget, pushFieldHistory, setHoveredTarget]);

  const deleteLastWord = React.useCallback(() => {
    const field = getEditableTarget();
    if (!field) {
      toast.error('No text field is selected in this dialog.');
      return;
    }

    pushFieldHistory(field);
    const currentValue = getFieldValue(field);
    const nextValue = currentValue.replace(/\s*\S+\s*$/, '').trimEnd();

    setFieldValue(field, nextValue);
    field.focus();
    setHoveredTarget(field);
    toast.success('Removed last word');
  }, [getEditableTarget, pushFieldHistory, setHoveredTarget]);

  const clearField = React.useCallback(() => {
    const field = getEditableTarget();
    if (!field) {
      toast.error('No text field is selected in this dialog.');
      return;
    }

    pushFieldHistory(field);
    setFieldValue(field, '');
    field.focus();
    setHoveredTarget(field);
    toast.success('Field cleared');
  }, [getEditableTarget, pushFieldHistory, setHoveredTarget]);

  const clickCurrentTarget = React.useCallback(() => {
    const target = getCurrentTarget();
    if (!target) {
      toast.error('Nothing is selected in this dialog.');
      return;
    }

    target.click();
    toast.success(`Clicked ${getElementLabel(getContainer(), target) || 'current control'}`);
  }, [getContainer, getCurrentTarget]);

  const clickTarget = React.useCallback((targetText: string) => {
    const normalizedTarget = targetText.toLowerCase().trim();
    const container = getContainer();
    const candidates = Array.from(container.querySelectorAll('button, a, [role="button"], [data-radix-collection-item]')).filter(isVisible);
    const exactMatch = candidates.find((element) => element.textContent?.toLowerCase().trim() === normalizedTarget);
    const partialMatch = candidates.find((element) => element.textContent?.toLowerCase().includes(normalizedTarget));
    const target = exactMatch || partialMatch;

    if (!target) {
      toast.error(`Couldn't find “${targetText}” in this dialog.`);
      return;
    }

    target.click();
    toast.success(`Clicked ${target.textContent?.trim() || targetText}`);
  }, [getContainer]);

  const openDropdown = React.useCallback(() => {
    const target = getCurrentTarget();
    if (!target) {
      toast.error('No current control selected.');
      return;
    }

    const combobox = target.getAttribute('role') === 'combobox' ? target : target.querySelector('[role="combobox"]');
    if (!combobox) {
      toast.error('Current selection is not a dropdown.');
      return;
    }

    combobox.click();
    toast.success('Dropdown opened');
  }, [getCurrentTarget]);

  const selectOptionByText = React.useCallback((targetText: string) => {
    const normalizedTarget = targetText.toLowerCase().trim();
    const options = Array.from(document.querySelectorAll('[role="option"], [data-radix-collection-item]')).filter(isVisible);
    const exactMatch = options.find((option) => option.textContent?.toLowerCase().trim() === normalizedTarget);
    const partialMatch = options.find((option) => option.textContent?.toLowerCase().includes(normalizedTarget));
    const target = exactMatch || partialMatch;

    if (!target) {
      toast.error(`Couldn't find option “${targetText}”.`);
      return;
    }

    target.click();
    toast.success(`Selected ${target.textContent?.trim() || targetText}`);
  }, []);

  const setCheckboxState = React.useCallback((checked: boolean) => {
    const target = getCurrentTarget();
    if (!target) {
      toast.error('No selected control found in this dialog.');
      return;
    }

    const checkbox = target.matches('button,[role="checkbox"],input[type="checkbox"]')
      ? target
      : target.querySelector('button,[role="checkbox"],input[type="checkbox"]');

    if (!checkbox) {
      toast.error('Current selection is not a checkbox.');
      return;
    }

    const isChecked = checkbox.getAttribute('data-state') === 'checked' || (checkbox as HTMLInputElement).checked === true;
    if (isChecked !== checked) checkbox.click();
    toast.success(checked ? 'Checked' : 'Unchecked');
  }, [getCurrentTarget]);

  const closeDialog = React.useCallback(() => {
    const container = getContainer();
    const closeButton = container.querySelector('[data-dialog-close="true"]');
    if (!closeButton) {
      toast.error('No close button found in this dialog.');
      return false;
    }

    closeButton.click();
    toast.success('Dialog closed');
    return true;
  }, [getContainer]);

  const undoLastChange = React.useCallback(() => {
    const field = getEditableTarget();
    if (!field) {
      toast.error('No text field is selected in this dialog.');
      return;
    }

    const key = getFieldHistoryKey(field);
    const history = fieldHistoryRef.current.get(key) || [];
    if (!history.length) {
      toast.info('Nothing to undo yet.');
      return;
    }

    const previousValue = history[history.length - 1];
    fieldHistoryRef.current.set(key, history.slice(0, -1));
    setFieldValue(field, previousValue);
    field.focus();
    setHoveredTarget(field);
    toast.success('Undid last change');
  }, [getEditableTarget, getFieldHistoryKey, setHoveredTarget]);

  const runPrimaryAction = React.useCallback((keyword: string) => {
    const container = getContainer();
    const buttons = Array.from(container.querySelectorAll('button')).filter(isVisible);
    const actionButton = buttons.find((button) => button.textContent?.toLowerCase().includes(keyword)) || buttons.find((button) => button.type === 'submit');

    if (!actionButton) {
      toast.error(`Couldn't find a ${keyword} action in this dialog.`);
      return;
    }

    actionButton.click();
    toast.success(`${keyword[0].toUpperCase()}${keyword.slice(1)} action triggered`);
  }, [getContainer]);

  const handleCommand = React.useCallback((rawCommand: string) => {
    const command = rawCommand.toLowerCase().trim();

    if (['close dialog', 'close this', 'cancel', 'dismiss', 'exit dialog'].includes(command)) {
      closeDialog();
      return;
    }

    if (['click this', 'press this', 'tap this', 'open this', 'select this'].includes(command)) {
      clickCurrentTarget();
      return;
    }

    if (['next field', 'next'].includes(command)) {
      focusAdjacentField('next');
      return;
    }

    if (['previous field', 'back field', 'previous'].includes(command)) {
      focusAdjacentField('previous');
      return;
    }

    if (['clear this', 'clear field', 'erase this', 'delete this', 'delete that', 'remove this'].includes(command)) {
      clearField();
      return;
    }

    if (['undo', 'undo last', 'undo that', 'revert'].includes(command)) {
      undoLastChange();
      return;
    }

    if (['delete last word', 'remove last word', 'backspace'].includes(command)) {
      deleteLastWord();
      return;
    }

    if (['new line', 'line break', 'next line'].includes(command)) {
      insertIntoField('', { addNewLine: true });
      return;
    }

    const punctuationShortcut = PUNCTUATION_SHORTCUTS.find((shortcut) => shortcut.phrase === command);
    if (punctuationShortcut) {
      insertIntoField(punctuationShortcut.value);
      return;
    }

    if (['check this', 'tick this'].includes(command)) {
      setCheckboxState(true);
      return;
    }

    if (['uncheck this', 'untick this'].includes(command)) {
      setCheckboxState(false);
      return;
    }

    if (['open dropdown', 'show options'].includes(command)) {
      openDropdown();
      return;
    }

    if (['save', 'submit', 'confirm'].includes(command)) {
      runPrimaryAction('save');
      return;
    }

    if (command === 'create') {
      runPrimaryAction('create');
      return;
    }

    if (command === 'update') {
      runPrimaryAction('update');
      return;
    }

    if (command === 'search') {
      runPrimaryAction('search');
      return;
    }

    const focusMatch = rawCommand.match(/^(focus|go to|select field)\s+(.+)$/i);
    if (focusMatch) {
      focusFieldByText(focusMatch[2].trim());
      return;
    }

    const clickMatch = rawCommand.match(/^(click|press|tap|open)\s+(.+)$/i);
    if (clickMatch) {
      clickTarget(clickMatch[2].trim());
      return;
    }

    const chooseMatch = rawCommand.match(/^(choose|select option|pick)\s+(.+)$/i);
    if (chooseMatch) {
      selectOptionByText(chooseMatch[2].trim());
      return;
    }

    const replaceMatch = rawCommand.match(/^(replace with)\s+(.+)$/i);
    if (replaceMatch) {
      insertIntoField(replaceMatch[2].trim(), { replace: true });
      return;
    }

    const typeMatch = rawCommand.match(/^(type|enter|write|add)\s+(.+)$/i);
    if (typeMatch) {
      insertIntoField(typeMatch[2].trim());
      return;
    }

    if (getEditableTarget()) {
      insertIntoField(rawCommand);
      return;
    }

    toast.info(`Heard: “${rawCommand}”. Try click this, undo last, type hello comma world, choose active, save, or create.`);
  }, [clearField, clickCurrentTarget, clickTarget, closeDialog, deleteLastWord, focusAdjacentField, focusFieldByText, getEditableTarget, insertIntoField, openDropdown, runPrimaryAction, selectOptionByText, setCheckboxState, undoLastChange]);

  // --- Speech Recognition Setup ---
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-AU';

    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (!result?.isFinal) continue;
        const transcript = result[0]?.transcript?.trim();
        if (transcript) handleCommand(transcript);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldKeepListeningRef.current = false;
        setIsListening(false);
        toast.error('Microphone access denied for voice commands.');
      }
    };

    recognition.onend = () => {
      if (!shouldKeepListeningRef.current) {
        setIsListening(false);
        return;
      }

      restartTimerRef.current = window.setTimeout(() => {
        try {
          recognition.start();
          setIsListening(true);
        } catch {
          setIsListening(false);
          shouldKeepListeningRef.current = false;
        }
      }, 250);
    };

    recognitionRef.current = recognition;
    setIsSupported(true);

    return () => {
      shouldKeepListeningRef.current = false;
      window.clearTimeout(restartTimerRef.current!);
      recognition.stop?.();
      clearHoveredHighlight();
    };
  }, [clearHoveredHighlight, handleCommand]);

  // --- Mouse/Focus Tracking ---
  React.useEffect(() => {
    const container = getContainer();
    if (!container) return;

    const handleMouseOver = (event: MouseEvent) => {
      const target = getInteractiveAncestor(event.target as HTMLElement);
      if (target && container.contains(target) && isVisible(target)) {
        setHoveredTarget(target);
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = getInteractiveAncestor(event.target as HTMLElement) || event.target as HTMLElement;
      if (target && container.contains(target) && isVisible(target)) {
        setHoveredTarget(target);
      }
    };

    const handleMouseLeave = () => {
      clearHoveredHighlight();
      hoveredRef.current = null;
      setTargetLabel('');
    };

    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('focusin', handleFocusIn);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('focusin', handleFocusIn);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [clearHoveredHighlight, getContainer, setHoveredTarget]);

  // --- Toggle Voice Control ---
  const toggleListening = () => {
    if (!isSupported) return;

    if (isListening) {
      shouldKeepListeningRef.current = false;
      window.clearTimeout(restartTimerRef.current!);
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      shouldKeepListeningRef.current = true;
      recognitionRef.current?.start();
      setIsListening(true);
      toast.info('Voice commands on: speak naturally, pause and continue, say undo last, or use punctuation words like comma, period, question mark, and exclamation.');
    } catch {
      toast.error('Voice commands could not start right now.');
    }
  };

  if (!isSupported) return null;

  return (
    <div className="pointer-events-auto flex min-w-0 max-w-[min(360px,calc(100vw-6rem))] items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
      <Button
        type="button"
        size="icon"
        variant={isListening ? 'destructive' : 'outline'}
        onClick={toggleListening}
        className={isListening ? 'animate-pulse' : ''}
        title={isListening ? 'Stop voice commands' : 'Start voice commands'}
      >
        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      <div className="min-w-0 text-xs text-slate-600">
        <p className="font-medium text-slate-900">Voice dialog control</p>
        <p className="truncate">
          {targetLabel ? `Target: ${targetLabel}` : 'Click or hover a control, then speak'}
        </p>
      </div>
    </div>
  );
}
