import { useRef, useState } from 'react';

interface Props {
  onExport: () => void;
  /** returns true on success, false if the file was invalid */
  onImport: (text: string) => boolean;
  onReset: () => void;
}

/** Export / Import / Reset controls. Reset is behind an inline confirm. */
export default function DataControls({ onExport, onImport, onReset }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-importing the same file
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = onImport(String(reader.result ?? ''));
      setMsg(ok ? 'Cultivation restored.' : 'Invalid backup file.');
      setTimeout(() => setMsg(null), 3000);
    };
    reader.onerror = () => {
      setMsg('Could not read file.');
      setTimeout(() => setMsg(null), 3000);
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={onExport}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:border-jade-500 hover:text-jade-300"
      >
        Export
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:border-jade-500 hover:text-jade-300"
      >
        Import
      </button>

      {confirming ? (
        <span className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Wipe all progress?</span>
          <button
            type="button"
            onClick={() => {
              onReset();
              setConfirming(false);
            }}
            className="rounded-md bg-red-500/90 px-2.5 py-1 font-medium text-white transition hover:bg-red-500"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-md border border-white/10 px-2.5 py-1 text-slate-300"
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400/80 transition hover:bg-red-500/10 hover:text-red-400"
        >
          Reset
        </button>
      )}

      {msg && <span className="text-xs text-jade-300">{msg}</span>}
    </div>
  );
}
