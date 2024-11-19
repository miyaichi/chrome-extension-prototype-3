import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { ElementInfo } from "../types/domSelection";
import "./DOMTreeView.css";
import { Tooltip } from "./Tooltip";

interface Props {
  elementInfo: ElementInfo;
  onSelect?: (node: ElementInfo) => void;
}

const truncateAttributeValue = (value: string, maxLength: number = 25) => {
  if (value.length <= maxLength) return value;
  return `${value.substring(0, maxLength)}...`;
};

const formatElementTag = (
  startTag: string,
  showFullContent: boolean = false,
) => {
  const tagMatch = startTag.match(/^<(\w+)([\s\S]*?)(\/?>)$/);
  if (!tagMatch) return startTag;

  const [, tagName, attributesStr, closing] = tagMatch;

  const attributeParts: React.ReactNode[] = [];
  let match;
  const attrRegex = /\s+([^\s="]+)(?:(=")((?:\\"|[^"])*)")?/g;

  while ((match = attrRegex.exec(attributesStr)) !== null) {
    const [fullMatch, attrName, equals = "", attrValue = ""] = match;

    attributeParts.push(
      <React.Fragment key={attributeParts.length}>
        <span className="syntax-punctuation"> </span>
        <span className="syntax-attr">{attrName}</span>
        {equals && (
          <>
            <span className="syntax-punctuation">="</span>
            <span className="syntax-value" title={attrValue}>
              {showFullContent ? attrValue : truncateAttributeValue(attrValue)}
            </span>
            <span className="syntax-punctuation">"</span>
          </>
        )}
      </React.Fragment>,
    );
  }

  return (
    <>
      <span className="syntax-punctuation">&lt;</span>
      <span className="syntax-tag">{tagName}</span>
      {attributeParts}
      <span className="syntax-punctuation">{closing}</span>
    </>
  );
};

export const DOMTreeView = ({ elementInfo, onSelect }: Props) => {
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

  const toggleNode = (path: string) => {
    setExpandedNodes((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  };

  const renderNode = (node: ElementInfo, parentPath = "") => {
    const currentPath = parentPath
      ? `${parentPath}-${node.path.join(".")}`
      : node.path.join(".");
    const isExpanded = expandedNodes.includes(currentPath);
    const hasChildren = node.children.length > 0;

    return (
      <div key={currentPath} className="tree-node">
        <div className="tree-node-content">
          {hasChildren ? (
            <div
              className="tree-chevron"
              onClick={() => toggleNode(currentPath)}
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </div>
          ) : (
            <div className="tree-chevron-placeholder" />
          )}
          <div className="tree-tag-container">
            <Tooltip content={node.startTag}>
              <span className="tree-tag" onClick={() => onSelect?.(node)}>
                {formatElementTag(node.startTag)}
              </span>
            </Tooltip>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="tree-children">
            {node.children.map((child) => renderNode(child, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tree-container">
      {elementInfo.children.map((child) => renderNode(child))}
    </div>
  );
};
