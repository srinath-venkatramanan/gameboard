// src/components/ui/Card.jsx
export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl shadow-md p-4 bg-white hover:shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
