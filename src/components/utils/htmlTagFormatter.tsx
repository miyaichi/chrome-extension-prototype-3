// src/components/utils/htmlTagFormatter.ts
import React from 'react';

// Syntax highlighting styles
const defaultStyles = `
.syntax-tag {
  color: #2563eb;
}

.syntax-attr {
  color: #059669;
}

.syntax-value {
  color: #db2777;
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.syntax-punctuation {
  color: #4b5563;
}
`;

// Inject the default styles into the document head
const injectStyles = () => {
  if (typeof window === 'undefined') return;

  const styleId = 'html-tag-formatter-styles';
  if (document.getElementById(styleId)) return;

  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = defaultStyles;
  document.head.appendChild(styleElement);
};

export interface HTMLTagFormatterOptions {
  showFullContent?: boolean;
  maxLength?: number;
  classNames?: {
    tag?: string;
    attr?: string;
    value?: string;
    punctuation?: string;
  };
}

const DEFAULT_CLASSES = {
  tag: 'syntax-tag',
  attr: 'syntax-attr',
  value: 'syntax-value',
  punctuation: 'syntax-punctuation',
} as const;

export const truncateAttributeValue = (value: string, maxLength: number = 25) => {
  if (value.length <= maxLength) return value;
  return `${value.substring(0, maxLength)}...`;
};

export const formatElementTag = (
  startTag: string,
  options: HTMLTagFormatterOptions = {}
): React.ReactNode => {
  injectStyles();

  const { showFullContent = false, maxLength = 25, classNames = DEFAULT_CLASSES } = options;

  const tagMatch = startTag.match(/^<(\w+)([\s\S]*?)(\/?>)$/);
  if (!tagMatch) return startTag;

  const [, tagName, attributesStr, closing] = tagMatch;
  const { tag, attr, value, punctuation } = {
    ...DEFAULT_CLASSES,
    ...classNames,
  };

  const attributeParts: React.ReactNode[] = [];
  let match;
  const attrRegex = /\s+([^\s="]+)(?:(=")((?:\\"|[^"])*)")?/g;

  while ((match = attrRegex.exec(attributesStr)) !== null) {
    const [fullMatch, attrName, equals = '', attrValue = ''] = match;

    attributeParts.push(
      <React.Fragment key={attributeParts.length}>
        <span className={punctuation}> </span>
        <span className={attr}>{attrName}</span>
        {equals && (
          <>
            <span className={punctuation}>="</span>
            <span className={value} title={attrValue}>
              {showFullContent ? attrValue : truncateAttributeValue(attrValue, maxLength)}
            </span>
            <span className={punctuation}>"</span>
          </>
        )}
      </React.Fragment>
    );
  }

  return (
    <>
      <span className={punctuation}>&lt;</span>
      <span className={tag}>{tagName}</span>
      {attributeParts}
      <span className={punctuation}>{closing}</span>
    </>
  );
};
