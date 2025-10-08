/**
 * Componente Table reutilizable con diseño responsive
 */
export const Table = ({ columns, data, actions, emptyMessage = 'No hay datos disponibles', onRowClick, selectedRow }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto px-4">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, index) => {
            // Detectar correctamente la selección basándose en el ID correcto
            let isSelected = false;
            if (selectedRow) {
              if (row.idTipo) {
                isSelected = selectedRow.idTipo === row.idTipo;
              } else if (row.idCliente) {
                isSelected = selectedRow.idCliente === row.idCliente;
              } else if (row.idEquipo) {
                isSelected = selectedRow.idEquipo === row.idEquipo;
              }
            }

            const isEven = index % 2 === 0;

            return (
              <tr
                key={row.id || index}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${
                  isSelected
                    ? 'bg-blue-200 border-l-4 border-blue-600'
                    : isEven
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : 'bg-white hover:bg-gray-50'
                } ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-gray-900">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    {actions(row)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
