import type { Floor } from "../types/store";
import { useI18n } from "../i18n";

type FloorSelectorProps = {
  floors: Floor[];
  selectedFloor: Floor;
  onSelect: (floor: Floor) => void;
};

export default function FloorSelector({ floors, selectedFloor, onSelect }: FloorSelectorProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2" aria-label={t("floorSelect")}>
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
            aria-label={`${floor} ${t("floorMap")}`}
            aria-pressed={isSelected}
          >
            {floor}
          </button>
        );
      })}
    </div>
  );
}
