import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import customerService from "../services/customerService";
import Alert from "../components/ui/Alert";

export const CustomerForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Si existe un ID, estamos editando
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        documentType: "",
        documentNumber: "",
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
    });

    const [loading, setLoading] = useState(false);
    const [loadingCustomer, setLoadingCustomer] = useState(false);

   
    // CARGAR CLIENTE PARA EDITAR

    useEffect(() => {
        const loadCustomer = async () => {
            if (!isEditing) {
                return;
            }

            try {
                setLoadingCustomer(true);

                const customer =
                    await customerService.getCustomerById(id);

                setFormData({
                    documentType: customer.documentType || "",
                    documentNumber: customer.documentNumber || "",
                    fullName: customer.fullName || "",
                    phone: customer.phone || "",
                    email: customer.email || "",
                    address: customer.address || "",
                    city: customer.city || "",
                });

            } catch (err) {
                console.error(err);

                const message =
                    err.response?.data?.message ||
                    "No fue posible cargar la información del cliente.";

                await Alert.error({
                    title: "Error al cargar",
                    text: message,
                });

                navigate("/clientes");

            } finally {
                setLoadingCustomer(false);
            }
        };

        loadCustomer();
    }, [id, isEditing, navigate]);


    // MANEJAR CAMBIOS EN LOS CAMPOS

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    // GUARDAR / ACTUALIZAR CLIENTE

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación tipo de documento
        if (!formData.documentType) {
            await Alert.warning({
                title: "Campo obligatorio",
                text: "Debes seleccionar el tipo de documento.",
            });

            return;
        }

        // Validación número de documento
        if (!formData.documentNumber.trim()) {
            await Alert.warning({
                title: "Campo obligatorio",
                text: "Debes ingresar el número de documento.",
            });

            return;
        }

        // Validación nombre
        if (!formData.fullName.trim()) {
            await Alert.warning({
                title: "Campo obligatorio",
                text: "Debes ingresar el nombre completo.",
            });

            return;
        }

        try {
            setLoading(true);


            // EDITAR

            if (isEditing) {

                await customerService.updateCustomer(
                    id,
                    formData
                );

                await Alert.success({
                    title: "Cliente actualizado",
                    text: "La información del cliente fue actualizada correctamente.",
                });

            }


            // CREAR

            else {

                await customerService.createCustomer(
                    formData
                );

                await Alert.success({
                    title: "Cliente creado",
                    text: "El cliente fue registrado correctamente.",
                });
            }

            // Regresar a la lista
            navigate("/clientes");

        } catch (err) {
            console.error(err);

            const message =
                err.response?.data?.message ||
                "No fue posible guardar el cliente.";

            await Alert.error({
                title: "Error al guardar",
                text: message,
            });

        } finally {
            setLoading(false);
        }
    };


    // CANCELAR

    const handleCancel = async () => {

        const result = await Alert.question({
            title: "¿Cancelar operación?",
            text: "Los datos ingresados no se guardarán.",
            confirmText: "Sí, cancelar",
            cancelText: "Continuar editando",
        });

        if (result.isConfirmed) {
            navigate("/clientes");
        }
    };


    // CARGANDO CLIENTE

    if (loadingCustomer) {
        return (
            <div className="p-8">

                <div className="flex justify-center items-center py-20">

                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>

                    <span className="ml-3 text-gray-600 font-medium">
                        Cargando información del cliente...
                    </span>

                </div>

            </div>
        );
    }


    // FORMULARIO

    return (
        <div className="p-8">

            {/* CABECERA */}

            <div className="mb-8">

                <h1 className="text-3xl font-bold text-gray-800">
                    {isEditing
                        ? "Editar cliente"
                        : "Nuevo cliente"}
                </h1>

                <p className="text-gray-500 mt-1">
                    {isEditing
                        ? "Actualiza la información del cliente"
                        : "Registra la información del cliente"}
                </p>

            </div>

            {/* FORMULARIO */}

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-lg shadow-sm border border-gray-200"
            >

                {/* INFORMACIÓN DE IDENTIFICACIÓN */}

                <div className="p-6 border-b border-gray-200">

                    <h2 className="text-lg font-semibold text-gray-800 mb-5">
                        Información de identificación
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Tipo de documento */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de documento *
                            </label>

                            <select
                                name="documentType"
                                value={formData.documentType}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >

                                <option value="">
                                    Seleccionar tipo
                                </option>

                                <option value="CC">
                                    Cédula de Ciudadanía
                                </option>

                                <option value="CE">
                                    Cédula de Extranjería
                                </option>

                                <option value="NIT">
                                    NIT
                                </option>

                                <option value="PAS">
                                    Pasaporte
                                </option>

                            </select>

                        </div>

                        {/* Número de documento */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de documento *
                            </label>

                            <input
                                type="text"
                                name="documentNumber"
                                value={formData.documentNumber}
                                onChange={handleChange}
                                placeholder="Ej. 1234567890"
                                disabled={loading}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />

                        </div>

                        {/* Nombre */}

                        <div className="md:col-span-2">

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre *
                            </label>

                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Nombre del cliente"
                                disabled={loading}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />

                        </div>

                    </div>

                </div>

                {/* INFORMACIÓN DE CONTACTO */}

                <div className="p-6 border-b border-gray-200">

                    <h2 className="text-lg font-semibold text-gray-800 mb-5">
                        Información de contacto
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Teléfono */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Teléfono
                            </label>

                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Ej. 3001234567"
                                disabled={loading}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />

                        </div>

                        {/* Correo */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Correo electrónico
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="cliente@correo.com"
                                disabled={loading}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />

                        </div>

                        {/* Dirección */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dirección
                            </label>

                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Ej. Calle 10 # 20-30"
                                disabled={loading}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />

                        </div>

                        {/* Ciudad */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ciudad
                            </label>

                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Ej. Medellín"
                                disabled={loading}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />

                        </div>

                    </div>

                </div>

                {/* BOTONES */}

                <div className="flex justify-end gap-3 p-6">

                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading
                            ? "Guardando..."
                            : isEditing
                                ? "Actualizar cliente"
                                : "Guardar cliente"}
                    </button>

                </div>

            </form>

        </div>
    );
};