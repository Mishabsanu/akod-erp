export function Card({ children }: any) {
  return (
    <div className="border rounded-xl shadow p-4 bg-white">{children}</div>
  );
}

export function CardHeader({ children }: any) {
  return <div className="mb-2">{children}</div>;
}

export function CardTitle({ children }: any) {
  return <h2 className="font-semibold text-lg">{children}</h2>;
}

export function CardContent({ children }: any) {
  return <div>{children}</div>;
}
