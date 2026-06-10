import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  hint?: string;
}

export function FormField({ label, required, error, children, hint }: FormFieldProps) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", fontFamily: "'Nunito', sans-serif", marginBottom: "5px" }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: "2px" }}>*</span>}
      </label>
      {children}
      {hint && !error && <p style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "'Nunito', sans-serif", marginTop: "4px" }}>{hint}</p>}
      {error && <p style={{ fontSize: "11px", color: "#EF4444", fontFamily: "'Nunito', sans-serif", marginTop: "4px" }}>{error}</p>}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #D1D5DB",
  borderRadius: "8px",
  fontSize: "14px",
  fontFamily: "'Nunito', sans-serif",
  color: "#1F2937",
  outline: "none",
  boxSizing: "border-box" as const,
  backgroundColor: "#FFFFFF",
};

export function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input style={inputStyle} {...props} />;
}

export function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} {...props} />;
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select style={inputStyle} {...props}>
      {children}
    </select>
  );
}
