import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface SubNavItem {
  label: string;
  icon?: string;
  path: string;
}

interface SubNavProps {
  items: SubNavItem[];
  basePath?: string;
}

const SubNav: React.FC<SubNavProps> = ({ items, basePath }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="subnav">
      {items.map((item) => {
        const fullPath = basePath ? `${basePath}${item.path}` : item.path;
        const isActive = location.pathname === fullPath;
        return (
          <div
            key={item.path}
            className={`subnav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(fullPath)}
          >
            {item.icon && <span className="subnav-icon">{item.icon}</span>}
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default SubNav;