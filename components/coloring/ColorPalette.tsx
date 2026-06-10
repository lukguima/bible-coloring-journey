interface ColorPaletteProps {
  colors: string[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export default function ColorPalette({ colors, selectedColor, onSelectColor }: ColorPaletteProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "12px 0" }}>
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onSelectColor(color)}
          title={color}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: color,
            border: selectedColor === color ? "3px solid #263B5E" : "2px solid #EFE4D0",
            cursor: "pointer",
            transition: "transform 0.15s ease",
            transform: selectedColor === color ? "scale(1.2)" : "scale(1)",
            boxShadow: selectedColor === color ? "0 0 0 2px #FFFFFF, 0 0 0 4px #263B5E" : "none",
          }}
        />
      ))}
    </div>
  );
}
