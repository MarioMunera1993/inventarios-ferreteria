import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import saleService from "../services/saleService";
import Alert from "../components/ui/Alert";

const SalesHistoryPage = () => {
    const navigate = useNavigate();

    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const [activeDateFilter, setActiveDateFilter] = useState("");

    // Cargar ventas
    const loadSales = async () => {
        try {
            setLoading(true);

            const data = await saleService.getSales();
            setSales(data);
        } catch (err) {
            console.error(err);

            const message =
                err.response?.data?.message ||
                "No fue posible cargar el historial de ventas.";

            await Alert.error({
                title: "Error",
                text: message,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSales();
    }, []);

    // Formatear fecha
    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString("es-CO", {
            dateStyle: "short",
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

    // Estado de venta
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

    // Convertir fecha a fecha local
    const parseLocalDate = (dateString) => {
        if (!dateString) return null;

        const [year, month, day] = dateString.split("-").map(Number);

        return new Date(year, month - 1, day);
    };

    // Verificar rango de fechas
    const isSaleInDateRange = (sale) => {
        if (!dateFrom && !dateTo) {
            return true;
        }

        const saleDate = new Date(sale.createdAt);

        if (dateFrom) {
            const fromDate = parseLocalDate(dateFrom);

            fromDate.setHours(0, 0, 0, 0);

            if (saleDate < fromDate) {
                return false;
            }
        }

        if (dateTo) {
            const toDate = parseLocalDate(dateTo);

            toDate.setHours(23, 59, 59, 999);

            if (saleDate > toDate) {
                return false;
            }
        }

        return true;
    };

    // Fecha para input
    const formatInputDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    // Rango personalizado
    const setDateRange = (from, to) => {
        setDateFrom(formatInputDate(from));
        setDateTo(formatInputDate(to));
    };

    // Hoy
    const handleToday = () => {
        const today = new Date();

        setDateRange(today, today);
        setActiveDateFilter("today");
    };

    // Ayer
    const handleYesterday = () => {
        const yesterday = new Date();

        yesterday.setDate(yesterday.getDate() - 1);

        setDateRange(yesterday, yesterday);
        setActiveDateFilter("yesterday");
    };

    // Esta semana
    const handleThisWeek = () => {
        const today = new Date();

        const day = today.getDay();
        const difference = day === 0 ? 6 : day - 1;

        const start = new Date(today);

        start.setDate(today.getDate() - difference);

        setDateRange(start, today);
        setActiveDateFilter("week");
    };

    // Este mes
    const handleThisMonth = () => {
        const today = new Date();

        const start = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

        setDateRange(start, today);
        setActiveDateFilter("month");
    };

    // Limpiar filtros
    const clearFilters = () => {
        setSearchTerm("");
        setPaymentFilter("ALL");
        setStatusFilter("ALL");
        setDateFrom("");
        setDateTo("");
        setActiveDateFilter("");
    };

    // Filtrar ventas
    const filteredSales = sales.filter((sale) => {
        const payment = getPaymentMethod(sale.paymentMethod);
        const status = getStatus(sale.status);

        const search = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !search ||
            String(sale.id).includes(search) ||
            sale.customerName?.toLowerCase().includes(search) ||
            sale.customerDocumentNumber
                ?.toLowerCase()
                .includes(search) ||
            payment.name.toLowerCase().includes(search) ||
            status.name.toLowerCase().includes(search) ||
            sale.details?.some(
                (detail) =>
                    detail.productName
                        ?.toLowerCase()
                        .includes(search) ||
                    detail.productCode
                        ?.toLowerCase()
                        .includes(search)
            );

        const matchesPayment =
            paymentFilter === "ALL" ||
            sale.paymentMethod === paymentFilter;

        const matchesStatus =
            statusFilter === "ALL" ||
            sale.status === statusFilter;

        const matchesDate = isSaleInDateRange(sale);

        return (
            matchesSearch &&
            matchesPayment &&
            matchesStatus &&
            matchesDate
        );
    });

    // Solo ventas completadas
    const completedSales = filteredSales.filter(
        (sale) => sale.status === "COMPLETED"
    );

    // Cantidad de ventas
    const totalSales = completedSales.length;

    // Total vendido
    const totalSold = completedSales.reduce(
        (total, sale) =>
            total + Number(sale.total || 0),
        0
    );

    // Totales por método de pago
    const paymentTotals = completedSales.reduce(
        (totals, sale) => {
            const amount = Number(sale.total || 0);

            if (sale.paymentMethod === "CASH") {
                totals.CASH += amount;
            }

            if (sale.paymentMethod === "CARD") {
                totals.CARD += amount;
            }

            if (sale.paymentMethod === "TRANSFER") {
                totals.TRANSFER += amount;
            }

            return totals;
        },
        {
            CASH: 0,
            CARD: 0,
            TRANSFER: 0,
        }
    );

    return (
        <div className="p-6 space-y-6">

            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Historial de ventas
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Consulta y analiza las ventas realizadas.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/ventas")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                    + Nueva venta
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Buscar
                        </label>

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            placeholder="ID, cliente, documento, producto o código..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Método de pago
                        </label>

                        <select
                            value={paymentFilter}
                            onChange={(e) =>
                                setPaymentFilter(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">
                                💰 Todos
                            </option>

                            <option value="CASH">
                                💵 Efectivo
                            </option>

                            <option value="CARD">
                                💳 Tarjeta
                            </option>

                            <option value="TRANSFER">
                                🔄 Transferencia
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estado
                        </label>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">
                                Todos
                            </option>

                            <option value="COMPLETED">
                                Completadas
                            </option>

                            <option value="PENDING">
                                Pendientes
                            </option>

                            <option value="CANCELLED">
                                Canceladas
                            </option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Desde
                            </label>

                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    setActiveDateFilter("");
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hasta
                            </label>

                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    setActiveDateFilter("");
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                    </div>

                </div>

                {/* Filtros rápidos */}
                <div className="flex flex-wrap gap-2 mt-4">

                    <button
                        type="button"
                        onClick={handleToday}
                        className={`px-3 py-1.5 text-sm rounded-lg transition font-medium ${activeDateFilter === "today"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                    >
                        Hoy
                    </button>

                    <button
                        type="button"
                        onClick={handleYesterday}
                        className={`px-3 py-1.5 text-sm rounded-lg transition font-medium ${activeDateFilter === "yesterday"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                    >
                        Ayer
                    </button>

                    <button
                        type="button"
                        onClick={handleThisWeek}
                        className={`px-3 py-1.5 text-sm rounded-lg transition font-medium ${activeDateFilter === "week"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                    >
                        Esta semana
                    </button>

                    <button
                        type="button"
                        onClick={handleThisMonth}
                        className={`px-3 py-1.5 text-sm rounded-lg transition font-medium ${activeDateFilter === "month"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                    >
                        Este mes
                    </button>

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg transition"
                    >
                        Limpiar filtros
                    </button>

                </div>
            </div>

            {/* Resumen */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    Resumen del período
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Ventas realizadas */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Ventas realizadas
                                </p>

                                <p className="text-2xl font-bold text-gray-800 mt-1">
                                    {totalSales}
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                    Ventas completadas
                                </p>
                            </div>

                            <div className="text-2xl">
                                🧾
                            </div>
                        </div>
                    </div>

                    {/* Total vendido */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total vendido
                                </p>

                                <p className="text-2xl font-bold text-green-600 mt-1">
                                    {formatCurrency(totalSold)}
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                    Ventas completadas
                                </p>
                            </div>

                            <div className="text-2xl">
                                💰
                            </div>
                        </div>
                    </div>

                    {/* Métodos de pago */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">

                        <p className="text-sm text-gray-500 mb-3">
                            Dinero recibido
                        </p>

                        <div className="flex items-center justify-between gap-3">

                            <div className="text-center">
                                <span className="text-lg">💵</span>
                                <p className="text-xs text-gray-500 mt-1">
                                    Efectivo
                                </p>
                                <p className="text-xs font-semibold text-gray-700">
                                    {formatCurrency(paymentTotals.CASH)}
                                </p>
                            </div>

                            <div className="text-center">
                                <span className="text-lg">💳</span>
                                <p className="text-xs text-gray-500 mt-1">
                                    Tarjeta
                                </p>
                                <p className="text-xs font-semibold text-gray-700">
                                    {formatCurrency(paymentTotals.CARD)}
                                </p>
                            </div>

                            <div className="text-center">
                                <span className="text-lg">🔄</span>
                                <p className="text-xs text-gray-500 mt-1">
                                    Transferencia
                                </p>
                                <p className="text-xs font-semibold text-gray-700">
                                    {formatCurrency(paymentTotals.TRANSFER)}
                                </p>
                            </div>

                        </div>
                    </div>

                </div>

            </div>

            {/* Historial */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">

                <div className="p-5 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Ventas
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        {filteredSales.length} resultado(s) encontrado(s).
                    </p>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-500">
                        Cargando ventas...
                    </div>
                ) : filteredSales.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No se encontraron ventas con los filtros seleccionados.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-left text-gray-500">

                                    <th className="px-5 py-3 font-medium">
                                        Venta
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Fecha
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Cliente
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Método de pago
                                    </th>

                                    <th className="px-5 py-3 font-medium text-right">
                                        Total
                                    </th>

                                    <th className="px-5 py-3 font-medium">
                                        Estado
                                    </th>

                                    <th className="px-5 py-3 font-medium text-right">
                                        Acción
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {filteredSales.map((sale) => {
                                    const payment = getPaymentMethod(
                                        sale.paymentMethod
                                    );

                                    const status = getStatus(
                                        sale.status
                                    );

                                    return (
                                        <tr
                                            key={sale.id}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >

                                            <td className="px-5 py-4 font-semibold text-gray-800">
                                                #{String(sale.id).padStart(6, "0")}
                                            </td>

                                            <td className="px-5 py-4 text-gray-600">
                                                {formatDate(sale.createdAt)}
                                            </td>

                                            <td className="px-5 py-4">

                                                {sale.customerName ? (
                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {sale.customerName}
                                                        </p>

                                                        {sale.customerDocumentNumber && (
                                                            <p className="text-xs text-gray-500">
                                                                {sale.customerDocumentNumber}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">
                                                        Consumidor final
                                                    </span>
                                                )}

                                            </td>

                                            <td className="px-5 py-4">

                                                <div className="flex items-center gap-2">

                                                    <span>
                                                        {payment.icon}
                                                    </span>

                                                    <span className="text-gray-700">
                                                        {payment.name}
                                                    </span>

                                                </div>

                                            </td>

                                            <td className="px-5 py-4 text-right font-semibold text-gray-800">
                                                {formatCurrency(sale.total)}
                                            </td>

                                            <td className="px-5 py-4">

                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />

                                                    {status.name}
                                                </span>

                                            </td>

                                            <td className="px-5 py-4 text-right">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/ventas/${sale.id}`
                                                        )
                                                    }
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Ver detalle
                                                </button>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>
                    </div>
                )}

            </div>

        </div>
    );
};

export default SalesHistoryPage;