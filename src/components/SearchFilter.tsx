import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import './SearchFilter.css';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <motion.div 
      className="search-filter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Rechercher des téléphones et accessoires..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">Toutes les catégories</option>
            <option value="phone">📱 Téléphones</option>
            <option value="accessory">🎧 Accessoires</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchFilter;
