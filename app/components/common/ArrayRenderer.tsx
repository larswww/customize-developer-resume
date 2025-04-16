import { useState, useEffect } from "react";

interface ArrayRendererProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey: (item: T, index: number) => string | number;
  itemClassName?: string;
  onItemRemoved?: (removedItem: T) => void;
}

export function ArrayRenderer<T>({ 
  items: initialItems, 
  renderItem, 
  getKey,
  itemClassName = "",
  onItemRemoved
}: ArrayRendererProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Update internal items when props change
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);
  
  const handleRemove = (index: number) => {
    const removedItem = items[index];
    setItems(items.filter((_, i) => i !== index));
    
    if (onItemRemoved) {
      onItemRemoved(removedItem);
    }
  };

  return (
    <>
      {items.map((item, index) => (
        <span 
          key={getKey(item, index)}
          className={hoveredIndex === index ? `relative ${itemClassName}` : ""}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {renderItem(item, index)}
          
          {hoveredIndex === index && (
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none"
              aria-label="Remove item"
            >
              ×
            </button>
          )}
        </span>
      ))}
    </>
  );
} 