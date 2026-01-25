import React from 'react';
import { colors } from '../../styles/colors';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
}) => {
  return (
    <div style={styles.container}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={styles.slider}
        className="price-slider"
      />
      <style>{`
        .price-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: ${colors.border};
          outline: none;
        }
        .price-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${colors.white};
          border: 2px solid ${colors.primary};
          cursor: pointer;
        }
        .price-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${colors.white};
          border: 2px solid ${colors.primary};
          cursor: pointer;
        }
        .price-slider::-webkit-slider-runnable-track {
          height: 6px;
          background: linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} ${((value - min) / (max - min)) * 100}%, ${colors.border} ${((value - min) / (max - min)) * 100}%, ${colors.border} 100%);
          border-radius: 3px;
        }
        .price-slider::-moz-range-track {
          height: 6px;
          background: ${colors.border};
          border-radius: 3px;
        }
        .price-slider::-moz-range-progress {
          height: 6px;
          background: ${colors.primary};
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
  },
  slider: {
    width: '100%',
  },
};
