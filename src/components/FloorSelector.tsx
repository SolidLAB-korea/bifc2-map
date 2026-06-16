import type { Floor } from "../types/store";

type FloorSelectorProps = {
  floors: Floor[];
  selectedFloor: Floor;
  onSelect: (floor: Floor) => void;
};

export default function FloorSelector({ floors, selectedFloor, onSelect }: FloorSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2" aria-label="층 선택">
      {floors.map((floor) => {
        const isSelected = floor === selectedFloor;
        return (
          <button
            key={floor}
            type="button"
            onClick={() => onSelect(floor)}
            className={`min-h-8 rounded-md border text-xs font-black sm:min-h-12 sm:rounded-lg sm:text-base ${
              isSelected ? "border-accent bg-accent text-white" : "border-slate-200 bg-white text-primary"
            }`}
            aria-label={`${floor} 지도 보기`}
            aria-pressed={isSelected}
          >
            {floor}
          </button>
        );
      })}
    </div>
  );
}
