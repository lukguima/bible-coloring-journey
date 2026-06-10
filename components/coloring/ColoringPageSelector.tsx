interface ColoringPage {
  id: string;
  title: string;
  emoji: string;
  description: string;
}

interface ColoringPageSelectorProps {
  pages: ColoringPage[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function ColoringPageSelector({ pages, selectedId, onSelect }: ColoringPageSelectorProps) {
  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
      {pages.map((page) => (
        <button
          key={page.id}
          onClick={() => onSelect(page.id)}
          style={{
            flex: "1",
            minWidth: "100px",
            padding: "16px 12px",
            backgroundColor: selectedId === page.id ? "#263B5E" : "#FFFFFF",
            color: selectedId === page.id ? "#FFFFFF" : "#263B5E",
            border: `2px solid ${selectedId === page.id ? "#263B5E" : "#EFE4D0"}`,
            borderRadius: "16px",
            cursor: "pointer",
            transition: "all 0.15s ease",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "28px", marginBottom: "4px" }}>{page.emoji}</div>
          <div style={{ fontSize: "12px", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>{page.title}</div>
        </button>
      ))}
    </div>
  );
}
