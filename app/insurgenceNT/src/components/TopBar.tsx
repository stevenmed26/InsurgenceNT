import React from "react";

export function TopBar(props: {
  runName: string;
  onRunNameChange: (v: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}) {
  return (
    <div className="topbar">
      <div className="topbar__inner">
        <input
          className="input runName"
          value={props.runName}
          onChange={(e) => props.onRunNameChange(e.target.value)}
          placeholder="Run name"
        />
        <div className="searchWrapper">
          <svg
            className="searchIcon"
            viewBox="0 0 24 24"
          >
            <path d="M10.5 3a7.5 7.5 0 015.916 12.13l4.227 4.227-1.414 1.414-4.227-4.227A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" />
          </svg>
          <input
            className="input searchInput"
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder="Search locations..."
          />
        </div>

        <button className="button" onClick={props.onExport}>
          Export
        </button>

        <label className="fileButton">
          Import
          <input
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) props.onImport(f);
              e.currentTarget.value = "";
            }}
          />
        </label>

        <button className="button" onClick={props.onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
