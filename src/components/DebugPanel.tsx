interface DebugPanelProps {
  debugValue: number | null;
  onDebugValueChange: (value: number | null) => void;
  debugLateNight: boolean | null;
  onDebugLateNightChange: (value: boolean | null) => void;
  visitButtons?: number[];
}

const DEFAULT_VISIT_BUTTONS = [1, 3, 6, 10];

export function DebugPanel({
  debugValue,
  onDebugValueChange,
  debugLateNight,
  onDebugLateNightChange,
  visitButtons = DEFAULT_VISIT_BUTTONS,
}: DebugPanelProps) {
  return (
    <div className="debug-panel">
      <div className="debug-title">Debug Controls</div>

      <div className="debug-row">
        <span>Visits:</span>
        {visitButtons.map((value) => (
          <button
            key={value}
            className={debugValue === value ? 'active' : ''}
            onClick={() => onDebugValueChange(debugValue === value ? null : value)}
          >
            {value}
          </button>
        ))}
        <button
          className={debugValue === null ? 'active' : ''}
          onClick={() => onDebugValueChange(null)}
        >
          REAL
        </button>
      </div>

      <div className="debug-row">
        <span>Late Night:</span>
        <button
          className={debugLateNight === true ? 'active' : ''}
          onClick={() => onDebugLateNightChange(debugLateNight === true ? null : true)}
        >
          ON
        </button>
        <button
          className={debugLateNight === false ? 'active' : ''}
          onClick={() => onDebugLateNightChange(debugLateNight === false ? null : false)}
        >
          OFF
        </button>
        <button
          className={debugLateNight === null ? 'active' : ''}
          onClick={() => onDebugLateNightChange(null)}
        >
          AUTO
        </button>
      </div>
    </div>
  );
}
