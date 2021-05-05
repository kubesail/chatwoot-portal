import React from "react";
import PropTypes from "prop-types";
import "./ProgressCircle.css";

export default function ProgressCircle({
  percent,
  thumbnail,
  uiState,
  className,
}) {
  const r = 90;
  const c = Math.PI * r * 2;

  if (percent < 0) {
    percent = 0;
  }
  if (percent > 100) {
    percent = 100;
  }

  const strokeDashoffset = ((100 - percent) / 100) * c;

  return (
    <div className={`ProgressCircle-container ${uiState} ${className}`}>
      <div
        className="ProgressCircle-percent"
        style={{ backgroundImage: `url(${thumbnail})` }}
      >
        {percent}%
      </div>
      <svg width="200" height="200" viewport="0 0 100 100">
        <circle
          className="ProgressCircle-circle"
          r={r}
          cx="100"
          cy="100"
          fill="transparent"
          strokeDasharray={c}
          strokeDashoffset="0"
        />
        <circle
          className="ProgressCircle-circle ProgressCircle-indicator"
          r={r}
          cx="100"
          cy="100"
          fill="transparent"
          strokeDasharray={c}
          strokeDashoffset="0"
          style={{ strokeDashoffset }}
        />
      </svg>
    </div>
  );
}

ProgressCircle.propTypes = {
  percent: PropTypes.number,
  thumbnail: PropTypes.string,
  uiState: PropTypes.string,
};
