import { memo, useCallback, useEffect, useState } from "react";
import { PlusIcon, TrashIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";

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
	onItemAdded,
}: ArrayRendererProps<T>) {
	const [items, setItems] = useState<T[]>(initialItems);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [buttonHover, setButtonHover] = useState(false);

	useEffect(() => {
		setItems(initialItems);
	}, [initialItems]);

	const handleRemove = useCallback(
		(index: number) => {
			const removedItem = items[index];
			setItems(items.filter((_, i) => i !== index));

			if (onItemRemoved) {
				onItemRemoved(removedItem);
			}
		},
		[items, onItemRemoved],
	);

	const handleAdd = useCallback(
		(index: number) => {
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
		},
		[items, onItemAdded],
	);

	const handleMouseEnter = useCallback((index: number) => {
		setHoveredIndex(index);
	}, []);

	const handleMouseLeave = useCallback(() => {
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
					<div className={itemClassName}>{renderItem(item, index)}</div>

					{hoveredIndex === index && (
						<div
							className="absolute -top-2 -right-2 flex space-x-2 z-10"
							onMouseEnter={handleButtonMouseEnter}
							onMouseLeave={handleButtonMouseLeave}
						>
							<Button
								type="button"
								onClick={() => handleAdd(index)}
								size="sm"
								variant="default"
								className="rounded-full !p-1"
								aria-label="Add item"
							>
								<PlusIcon size="xs" />
							</Button>
							<Button
								type="button"
								onClick={() => handleRemove(index)}
								size="sm"
								variant="destructive"
								className="rounded-full !p-1"
								aria-label="Remove item"
							>
								<TrashIcon size="xs" className="!mr-0" />
							</Button>
						</div>
					)}
				</div>
			))}
		</>
	);
}

export const ArrayRenderer = memo(
	ArrayRendererBase,
) as typeof ArrayRendererBase;
