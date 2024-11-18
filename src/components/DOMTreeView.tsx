import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { ElementInfo, ElementTreeNode } from "../types/domSelection";
import "./DOMTreeView.css";
import { Tooltip } from "./Tooltip";

interface Props {
  elementInfo: ElementInfo;
  onSelect?: (node: ElementTreeNode) => void;
}

const DOMTreeView = ({ elementInfo, onSelect }: Props) => {
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const MAX_TAG_LENGTH = 20;

  const toggleNode = (path: string) => {
    setExpandedNodes((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  };

  const truncateStartTag = (tag: string) => {
    return tag.length > MAX_TAG_LENGTH
      ? `${tag.slice(0, MAX_TAG_LENGTH)}...`
      : tag;
  };

  const renderNode = (node: ElementTreeNode, parentPath = "") => {
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
          <Tooltip content={node.startTag}>
            <span className="tree-tag" onClick={() => onSelect?.(node)}>
              {truncateStartTag(node.startTag)}
            </span>
          </Tooltip>
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
    <div className="tree-container">{renderNode(elementInfo.children)}</div>
  );
};

export default DOMTreeView;
