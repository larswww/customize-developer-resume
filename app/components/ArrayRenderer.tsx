import { useState, useEffect, memo, useCallback } from "react";

interface ArrayRendererProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey: (item: T, index: number) => string | number;
  itemClassName?: string;
  onItemRemoved?: (removedItem: T) => void;
  onItemAdded?: (newItem: T) => void;
}

function ArrayRendererBase<T>({ 
  items: initialItems, 
  renderItem, 
  getKey,
  itemClassName = "",
  onItemRemoved,
  onItemAdded
}: ArrayRendererProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [buttonHover, setButtonHover] = useState(false);
  
  // Update internal items when props change
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);
  
  const handleRemove = useCallback((index: number) => {
    const removedItem = items[index];
    setItems(items.filter((_, i) => i !== index));
    
    if (onItemRemoved) {
      onItemRemoved(removedItem);
    }
  }, [items, onItemRemoved]);

  const handleAdd = useCallback((index: number) => {
    if (items.length > 0) {
      const itemToCopy = items[index];
      const newItem = structuredClone(itemToCopy);
      
      const newItems = [...items];
      newItems.splice(index + 1, 0, newItem);
      setItems(newItems);
      
      if (onItemAdded) {
        onItemAdded(newItem);
      }
    }
  }, [items, onItemAdded]);

  const handleMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index);
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (!buttonHover) {
      setHoveredIndex(null);
    }
  }, [buttonHover]);

  const handleButtonMouseEnter = useCallback(() => {
    setButtonHover(true);
  }, []);

  const handleButtonMouseLeave = useCallback(() => {
    setButtonHover(false);
    setHoveredIndex(null);
  }, []);

  return (
    <>
      {items.map((item, index) => (
        <div 
          key={getKey(item, index)}
          className="relative"
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
        >
          <div className={itemClassName}>
            {renderItem(item, index)}
          </div>
          
          {hoveredIndex === index && (
            <div 
              className="absolute -top-2 -right-2 flex space-x-2 z-10"
              onMouseEnter={handleButtonMouseEnter}
              onMouseLeave={handleButtonMouseLeave}
            >
              <button
                type="button"
                onClick={() => handleAdd(index)}
                className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-green-600 focus:outline-none"
                aria-label="Add item"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none"
                aria-label="Remove item"
              >
                ×
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export const ArrayRenderer = memo(ArrayRendererBase) as typeof ArrayRendererBase; 