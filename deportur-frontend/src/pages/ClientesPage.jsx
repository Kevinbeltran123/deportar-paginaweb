import { ListaClientesV2 } from '../components/clientes/ListaClientesV2';

/**
 * Página principal de gestión de clientes
 */
export const ClientesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <ListaClientesV2 />
    </div>
  );
};
