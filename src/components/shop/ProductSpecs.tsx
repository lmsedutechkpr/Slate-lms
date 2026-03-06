interface ProductSpecsProps {
  specs: Record<string, string> | null | undefined;
}

export function ProductSpecs({ specs }: ProductSpecsProps) {
  if (!specs || Object.keys(specs).length === 0) return null;

  const formatKey = (key: string) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="mb-8">
      <h2 className="text-gray-900 font-bold text-xl mb-4">Specifications</h2>
      <div className="w-full border border-gray-200 rounded-xl overflow-hidden">
        {Object.entries(specs).map(([key, value], i, arr) => (
          <div
            key={key}
            className={`flex ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <div className="w-1/3 bg-gray-50 px-4 py-3 text-gray-600 text-sm font-medium">
              {formatKey(key)}
            </div>
            <div className="flex-1 bg-white px-4 py-3 text-gray-900 text-sm">
              {String(value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
