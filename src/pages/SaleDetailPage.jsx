import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import saleService from "../services/saleService";
import Alert from "../components/ui/Alert";

const SaleDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cargar venta
    const loadSale = async () => {
        try {
            setLoading(true);

            const data = await saleService.getSaleById(id);

            setSale(data);
        } catch (err) {
            console.error(err);

            const message =
                err.response?.data?.message ||
                err.response?.data ||
                "No fue posible cargar el detalle de la venta.";

            await Alert.error({
                title: "Error",
                text: message,
            });

            navigate("/ventas/historial");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSale();
    }, [id]);

    // Formatear fecha
    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString("es-CO", {
            dateStyle: "long",
            timeStyle: "short",
        });
    };

    // Formatear moneda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(value || 0);
    };

    // Método de pago
    const getPaymentMethod = (method) => {
        switch (method) {
            case "CASH":
                return {
                    name: "Efectivo",
                    icon: "💵",
                };

            case "CARD":
                return {
                    name: "Tarjeta",
                    icon: "💳",
                };

            case "TRANSFER":
                return {
                    name: "Transferencia",
                    icon: "🔄",
                };

            default:
                return {
                    name: method || "-",
                    icon: "💰",
                };
        }
    };

    // Estado
    const getStatus = (status) => {
        switch (status) {
            case "COMPLETED":
                return {
                    name: "Completada",
                    className:
                        "bg-green-100 text-green-700 border border-green-200",
                };

            case "PENDING":
                return {
                    name: "Pendiente",
                    className:
                        "bg-yellow-100 text-yellow-700 border border-yellow-200",
                };

            case "CANCELLED":
                return {
                    name: "Cancelada",
                    className:
                        "bg-red-100 text-red-700 border border-red-200",
                };

            default:
                return {
                    name: status || "-",
                    className:
                        "bg-gray-100 text-gray-700 border border-gray-200",
                };
        }
    };

    // Imprimir
    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
                    Cargando factura...
                </div>
            </div>
        );
    }

    if (!sale) {
        return null;
    }

    const payment = getPaymentMethod(sale.paymentMethod);
    const status = getStatus(sale.status);

    const subtotal = sale.details?.reduce(
        (total, detail) =>
            total + Number(detail.subtotal || 0),
        0
    );

    const printStyles = `
        @media print {
            body * {
                visibility: hidden;
            }

            #invoice,
            #invoice * {
                visibility: visible;
            }

            #invoice {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                max-width: none;
                margin: 0;
                box-shadow: none !important;
                border: none !important;
            }

            @page {
                margin: 15mm;
            }
        }
    `;

    return (
        <div className="p-6 print-container">

            <style>{printStyles}</style>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 print:hidden">

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Detalle de venta
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Consulta la información y productos de la venta.
                    </p>
                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={() => navigate("/ventas/historial")}
                        className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition"
                    >
                        Volver
                    </button>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                    >
                        🖨️ Imprimir factura
                    </button>

                </div>

            </div>

            {/* Factura */}
            <div
                id="invoice"
                className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-0"
            >

                {/* Encabezado */}
                <div className="p-6 border-b border-gray-200">

                    <div className="flex flex-col sm:flex-row sm:justify-between gap-6">

                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                FERRETERÍA
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Sistema de gestión de inventario
                            </p>

                            <p className="text-sm text-gray-500">
                                Factura de venta
                            </p>
                        </div>

                        <div className="sm:text-right">

                            <p className="text-sm text-gray-500">
                                Factura
                            </p>

                            <p className="text-2xl font-bold text-gray-800">
                                #{String(sale.id).padStart(6, "0")}
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                                {formatDate(sale.createdAt)}
                            </p>

                        </div>

                    </div>

                </div>

                {/* Información */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-gray-200">

                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">
                            Cliente
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                            {sale.customerName || "Consumidor final"}
                        </p>

                        {sale.customerDocumentNumber && (
                            <p className="text-sm text-gray-500">
                                Documento: {sale.customerDocumentNumber}
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">
                            Método de pago
                        </p>

                        <div className="flex items-center gap-2 mt-1">
                            <span>{payment.icon}</span>

                            <span className="font-semibold text-gray-800">
                                {payment.name}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">
                            Estado
                        </p>

                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${status.className}`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />

                            {status.name}
                        </span>
                    </div>

                </div>

                {/* Productos */}
                <div className="p-6">

                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Productos
                    </h3>

                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead>
                                <tr className="border-b border-gray-200 text-left text-gray-500">

                                    <th className="pb-3 font-medium">
                                        Producto
                                    </th>

                                    <th className="pb-3 font-medium">
                                        Código
                                    </th>

                                    <th className="pb-3 font-medium text-center">
                                        Cant.
                                    </th>

                                    <th className="pb-3 font-medium text-right">
                                        Precio unitario
                                    </th>

                                    <th className="pb-3 font-medium text-right">
                                        Subtotal
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {sale.details?.map((detail, index) => (
                                    <tr
                                        key={`${detail.productId}-${index}`}
                                        className="border-b border-gray-100"
                                    >

                                        <td className="py-4 font-medium text-gray-800">
                                            {detail.productName}
                                        </td>

                                        <td className="py-4 text-gray-500">
                                            {detail.productCode}
                                        </td>

                                        <td className="py-4 text-center text-gray-700">
                                            {detail.quantity}
                                        </td>

                                        <td className="py-4 text-right text-gray-700">
                                            {formatCurrency(detail.unitPrice)}
                                        </td>

                                        <td className="py-4 text-right font-medium text-gray-800">
                                            {formatCurrency(detail.subtotal)}
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

                {/* Totales */}
                <div className="px-6 pb-6">

                    <div className="ml-auto max-w-sm border-t border-gray-200 pt-4 space-y-3">

                        <div className="flex justify-between text-sm text-gray-600">

                            <span>
                                Subtotal
                            </span>

                            <span>
                                {formatCurrency(subtotal)}
                            </span>

                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">

                            <span className="text-lg font-bold text-gray-800">
                                Total
                            </span>

                            <span className="text-2xl font-bold text-green-600">
                                {formatCurrency(sale.total)}
                            </span>

                        </div>

                    </div>

                </div>

                {/* Pie */}
                <div className="px-6 py-5 border-t border-gray-200 text-center">

                    <p className="text-sm text-gray-600">
                        Gracias por su compra
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                        Documento generado por el sistema de inventario
                    </p>

                </div>

            </div>

        </div>
    );
};

export default SaleDetailPage;