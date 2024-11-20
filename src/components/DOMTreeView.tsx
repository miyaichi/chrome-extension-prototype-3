// DOMTreeView.tsx
import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { ElementInfo } from '../types/domSelection';
import './DOMTreeView.css';
import { Tooltip } from './Tooltip';
import { formatElementTag } from './utils/htmlTagFormatter';

interface Props {
  elementInfo: ElementInfo;
  onSelect?: (node: ElementInfo) => void;
}

export const DOMTreeView = ({ elementInfo, onSelect }: Props) => {
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

  const toggleNode = (path: string) => {
    setExpandedNodes((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const renderNode = (node: ElementInfo, parentPath = '') => {
    const currentPath = parentPath ? `${parentPath}-${node.path.join('.')}` : node.path.join('.');
    const isExpanded = expandedNodes.includes(currentPath);
    const hasChildren = node.children.length > 0;

    return (
      <div key={currentPath} className="tree-node">
        <div className="tree-node-content">
          {hasChildren ? (
            <div className="tree-chevron" onClick={() => toggleNode(currentPath)}>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
    <div className="tree-container">{elementInfo.children.map((child) => renderNode(child))}</div>
  );
};
