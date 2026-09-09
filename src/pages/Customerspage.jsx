import { useState } from "react";
import { Link } from "react-router-dom";
import { useCustomers } from "../hooks/useCustomers";
import customerService from "../services/customerService";
import Alert from "../components/ui/Alert";

export const CustomersPage = () => {
    const { customers, loading, error, refreshCustomers } = useCustomers();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Filtrar clientes
    const filteredCustomers =
        customers?.filter((customer) => {
            const term = searchTerm.toLowerCase();

            const documentNumber = (
                customer.documentNumber || ""
            ).toLowerCase();

            const fullName = (
                customer.fullName || ""
            ).toLowerCase();

            return (
                documentNumber.includes(term) ||
                fullName.includes(term)
            );
        }) || [];

    const handleDeleteClick = async (customer) => {
        const result = await Alert.question({
            title: "¿Eliminar cliente?",
            text: `¿Estás seguro de eliminar a ${customer.fullName}?`,
            confirmText: "Sí, eliminar",
            cancelText: "Cancelar",
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            await customerService.deleteCustomer(customer.id);

            await Alert.success({
                title: "Cliente eliminado",
                text: "El cliente fue eliminado correctamente.",
            });

            await refreshCustomers();

        } catch (err) {
            console.error(err);

            const message =
                err.response?.data ||
                "No fue posible eliminar el cliente.";

            await Alert.error({
                title: "Cliente no eliminado",
                text: message,
            });
        }
    };

    return (
        <div className="relative">

            <div className="p-8">

                {/* Cabecera */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Lista Clientes
                        </h1>

                        <p className="text-gray-500">
                            Gestión de tus clientes
                        </p>
                    </div>

                    <Link
                        to="/clientes/nuevo"
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <span>➕</span>
                        Nuevo Cliente
                    </Link>

                </div>

                {/* Barra de búsqueda */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">

                    <div className="relative">

                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Buscar por documento o nombre"
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />

                    </div>

                </div>

                {/* Cargando */}
                {loading && (
                    <div className="flex justify-center items-center py-16">

                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>

                        <span className="ml-3 text-gray-600 font-medium">
                            Cargando clientes...
                        </span>

                    </div>
                )}

                {/* Error */}
                {error && (
                    <div
                        className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm mb-6"
                        role="alert"
                    >
                        <p className="font-bold">
                            Error de conexión
                        </p>

                        <p>{error}</p>
                    </div>
                )}

                {/* Tabla */}
                {!loading && !error && (
                    <>
                        {filteredCustomers.length === 0 ? (

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">

                                <p className="text-gray-500 text-lg">
                                    No se encontraron clientes que coincidan con la búsqueda.
                                </p>

                            </div>

                        ) : (

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">

                                <table className="w-full text-left border-collapse min-w-max">

                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">

                                            <th className="p-4 font-medium">
                                                Tipo Doc.
                                            </th>

                                            <th className="p-4 font-medium">
                                                N.º Documento
                                            </th>

                                            <th className="p-4 font-medium">
                                                Nombre
                                            </th>

                                            <th className="p-4 font-medium">
                                                Teléfono
                                            </th>

                                            <th className="p-4 font-medium">
                                                Email
                                            </th>

                                            <th className="p-4 font-medium">
                                                Ciudad
                                            </th>

                                            <th className="p-4 font-medium text-center">
                                                Acciones
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200">

                                        {filteredCustomers.map((customer) => (

                                            <tr
                                                key={customer.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >

                                                <td className="p-4 text-sm text-gray-600">
                                                    {customer.documentType}
                                                </td>

                                                <td className="p-4 text-sm text-gray-900 font-medium">
                                                    {customer.documentNumber}
                                                </td>

                                                <td className="p-4 text-sm text-gray-900">
                                                    {customer.fullName}
                                                </td>

                                                <td className="p-4 text-sm text-gray-600">
                                                    {customer.phone || "N/A"}
                                                </td>

                                                <td className="p-4 text-sm text-gray-600">
                                                    {customer.email || "N/A"}
                                                </td>

                                                <td className="p-4 text-sm text-gray-600">
                                                    {customer.city || "N/A"}
                                                </td>

                                                {/* Acciones */}
                                                <td className="p-4 text-sm">

                                                    <div className="flex items-center justify-center gap-3">

                                                        {/* Ver */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedCustomer(customer)
                                                            }
                                                            className="text-green-600 hover:text-green-800 font-medium"
                                                        >
                                                            Ver
                                                        </button>

                                                        {/* Editar */}
                                                        <Link
                                                            to={`/clientes/editar/${customer.id}`}
                                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                                        >
                                                            Editar
                                                        </Link>

                                                        {/* Eliminar */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteClick(customer)}
                                                            className="text-red-600 hover:text-red-800 font-medium"
                                                        >
                                                            Eliminar
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}
                    </>
                )}

            </div>

            {/* MODAL DE INFORMACIÓN DEL CLIENTE */}

            {selectedCustomer && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setSelectedCustomer(null)}
                >

                    <div
                        className="bg-white rounded-xl shadow-xl w-full max-w-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Encabezado */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">

                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Información del cliente
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Detalle completo del cliente
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedCustomer(null)
                                }
                                className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
                            >
                                ×
                            </button>

                        </div>

                        {/* Información */}
                        <div className="p-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                {/* Tipo */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                        Tipo Doc.
                                    </p>

                                    <p className="mt-1 text-gray-800 font-medium">
                                        {selectedCustomer.documentType || "N/A"}
                                    </p>
                                </div>

                                {/* Documento */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                        N.º Documento
                                    </p>

                                    <p className="mt-1 text-gray-800 font-medium">
                                        {selectedCustomer.documentNumber || "N/A"}
                                    </p>
                                </div>

                                {/* Nombre */}
                                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                        Nombre
                                    </p>

                                    <p className="mt-1 text-gray-800 font-medium">
                                        {selectedCustomer.fullName || "N/A"}
                                    </p>
                                </div>

                                {/* Teléfono */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                        Teléfono
                                    </p>

                                    <p className="mt-1 text-gray-700">
                                        {selectedCustomer.phone || "N/A"}
                                    </p>
                                </div>

                                {/* Email */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                        Correo electrónico
                                    </p>

                                    <p className="mt-1 text-gray-700 break-words">
                                        {selectedCustomer.email || "N/A"}
                                    </p>
                                </div>

                                {/* Dirección */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                        Dirección
                                    </p>

                                    <p className="mt-1 text-gray-700">
                                        {selectedCustomer.address || "N/A"}
                                    </p>
                                </div>

                                {/* Ciudad */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                        Ciudad
                                    </p>

                                    <p className="mt-1 text-gray-700">
                                        {selectedCustomer.city || "N/A"}
                                    </p>
                                </div>

                            </div>

                        </div>

                        {/* Pie */}
                        <div className="flex justify-end px-6 py-4 border-t border-gray-200">

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedCustomer(null)
                                }
                                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Cerrar
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};