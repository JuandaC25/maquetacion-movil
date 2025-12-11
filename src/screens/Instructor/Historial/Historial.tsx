import React, { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    ActivityIndicator,
    Alert,
    Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderWithDrawer from '../Header/Header';
import { styles } from '../../../styles/Instructor/Historial/Historial';

import { solicitudesService, ticketsService, subcategoriasService } from '../../../services/Api';


const formatFecha = (fechaString: string): string => {
    if (!fechaString || fechaString === 'N/A') return 'N/A';
    try {
        const datePart = fechaString.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day); 
        return dateObj.toLocaleDateString('es-ES', { 
            year: 'numeric', month: 'numeric', day: 'numeric' 
        });
    } catch (e) {
        console.error("Error al formatear la fecha:", e);
        return 'Fecha Inválida';
    }
}

const getStatusDetails = (estadoValor: string): { text: string; color: string; emoji: string } => {
    const estadoTexto = estadoValor?.toString().toLowerCase().trim() || '';

    if (estadoTexto.includes('pendiente')) {
        return { text: 'Pendiente', color: '#ffc107', emoji: '⚠️' };
    }
    if (estadoTexto.includes('aprobado')) {
        return { text: 'Aprobado', color: '#198754', emoji: '✅' };
    }
    if (estadoTexto.includes('rechazado')) {
        return { text: 'Rechazado', color: '#dc3545', emoji: '❌' };
    }
    if (estadoTexto.includes('en uso')) {
        return { text: 'En uso', color: '#0d6efd', emoji: '⚙️' };
    }
    if (estadoTexto.includes('finalizado')) {
        return { text: 'Finalizado', color: '#6c757d', emoji: '🏁' };
    }
    if (estadoTexto.includes('cancelado')) {
        return { text: 'Cancelado', color: '#6c757d', emoji: '🚫' };
    }

    return { text: 'Desconocido', color: '#f8f9fa', emoji: '❓' }; 
};

interface PaginationMovilProps {
    currentPage: number;
    totalPages: number;
    paginate: (pageNumber: number) => void;
}
const PaginationMovil = ({ currentPage, totalPages, paginate }: PaginationMovilProps) => {
    if (totalPages <= 1) return null;
    
    return (
        <View style={styles.paginationContainer}>
            <TouchableOpacity 
                onPress={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
            >
                <Text style={styles.paginationText}>{'<'}</Text>
            </TouchableOpacity>
            <View style={styles.pageIndicator}>
                <Text style={styles.paginationText}>Página {currentPage} de {totalPages}</Text>
            </View>
            <TouchableOpacity 
                onPress={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={[styles.paginationButton, currentPage === totalPages && styles.disabledButton]}
            >
                <Text style={styles.paginationText}>{'>'}</Text>
            </TouchableOpacity>
        </View>
    );
};


interface Solicitud {
    id_soli: number;
    est_soli: string;
    nom_usu?: string;
    nom_espa?: string;
    nombre_espacio?: string;
    cantid?: number;
    ambient?: string;
    fecha_ini?: string;
    fecha_fn?: string;
    id_usu?: number;
    id_subcategoria?: number;
    id_subcatego?: number;
    id_subcate?: number;
    id_subcat?: number;
    id_subcateg?: number;
}
interface Ticket {
    id_tickets: number;
    id_est_tick: number;
    nom_elem?: string;
    id_eleme?: number;
    nom_problm?: string;
    ambient?: string;
    fecha_in?: string;
    Obser?: string;
    id_usuario?: number;
}
interface SubcategoriaOption {
    id: string;
    nombre: string;
}

const extractData = (response: any) => {
    if (response?.data && Array.isArray(response.data)) {
        return response.data;
    }
    if (Array.isArray(response)) {
        return response;
    }
    if (response?.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
    }
    return [];
};


//Componente Principal

export default function HistorialPedidosMovil({ navigation }: any) {
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [subcategorias, setSubcategorias] = useState<Record<string, string>>({}); 
    const [subcategoriaOptions, setSubcategoriaOptions] = useState<SubcategoriaOption[]>([]);
    const [selectedSubcategoriaId, setSelectedSubcategoriaId] = useState<string | null>(null);
    const [tipoSolicitudFilter, setTipoSolicitudFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [solicitudesPerPage] = useState(5);
    const [activeTab, setActiveTab] = useState('solicitudes'); 

    const cargarSubcategorias = async () => {
        try {
            const resp = await subcategoriasService.getAll();
            const data = extractData(resp);
            
            if (Array.isArray(data)) {
                const subMap: Record<string, string> = data.reduce((acc: Record<string, string>, sub: any) => {
                    const id = sub.id || sub.id_subcateg;
                    if (id !== undefined) acc[String(id)] = sub.nom_subcateg;
                    return acc;
                }, {});
                setSubcategorias(subMap);
                setSubcategoriaOptions(data.map((sub: any) => ({
                    id: String(sub.id || sub.id_subcateg),
                    nombre: sub.nom_subcateg
                })));
            }
        } catch (err) {
            console.error("Fallo al obtener subcategorías:", err);
        }
    };

    const cancelarSolicitudesVencidas = async (solicitudes: Solicitud[]) => {
        const now = new Date();
        for (const sol of solicitudes) {
            if (sol.est_soli?.toLowerCase().includes('pendiente') && sol.fecha_fn) {
                const fechaFin = new Date(sol.fecha_fn);
                if (fechaFin <= now) {
                    try {
                        await solicitudesService.update(sol.id_soli, { id_est_soli: 4 });
                        sol.est_soli = 'Cancelado';
                    } catch (err) {
                        console.error('Error cancelando solicitud vencida:', err);
                    }
                }
            }
        }
    };

    const cargarSolicitudes = async () => {
        try {
            setIsLoading(true);
            const usuarioStr = await AsyncStorage.getItem('usuario');
            console.log("📱 [SOLI] Usuario en Storage:", usuarioStr); 

            if (!usuarioStr) {
                console.warn("⚠️ [SOLI] No hay usuario en sesión. No se cargarán las solicitudes.");
                setError("Error: Usuario no logueado. Inicia sesión.");
                setIsLoading(false);
                return;
            }

            const usuario = JSON.parse(usuarioStr);
            console.log("👤 [SOLI] Usuario ID a filtrar:", usuario.id);
            
            const resp = await solicitudesService.getAll();
            const data = extractData(resp);
            
            console.log("📦 [SOLI] Datos obtenidos (Array?):", Array.isArray(data), "Cantidad:", data?.length);
            
            const solicitudesDelUsuario = Array.isArray(data) 
                ? data.filter((sol: Solicitud) => {
                    return String(sol.id_usu) === String(usuario.id); 
                })
                : [];
            // Cancelar automáticamente solicitudes vencidas
            await cancelarSolicitudesVencidas(solicitudesDelUsuario);
            
            console.log("✅ [SOLI] Solicitudes filtradas para este usuario:", solicitudesDelUsuario.length);
            setSolicitudes(solicitudesDelUsuario);
            setError(null);
        } catch (err: any) {
            console.error("❌ [SOLI] Fallo al obtener solicitudes:", err);
            setError(err.message || "Error al cargar el historial de pedidos.");
        } finally {
            setIsLoading(false);
        }
    };

    const cargarTickets = async () => {
        try {
            setIsLoading(true);
            const usuarioStr = await AsyncStorage.getItem('usuario');
            console.log("📱 [TICKETS] Usuario en Storage:", usuarioStr); 

            if (!usuarioStr) {
                console.warn("⚠️ [TICKETS] No hay usuario en sesión. No se cargarán los tickets.");
                setError("Error: Usuario no logueado. Inicia sesión.");
                setIsLoading(false);
                return;
            }
            const usuario = JSON.parse(usuarioStr);
            console.log("👤 [TICKETS] Usuario ID a filtrar:", usuario.id);

            const resp = await ticketsService.getAll();
            const data = extractData(resp);
            
            console.log("📦 [TICKETS] Datos obtenidos (Array?):", Array.isArray(data), "Cantidad:", data?.length);

            const ticketsDelUsuario = Array.isArray(data) 
                ? data.filter((ticket: Ticket) => String(ticket.id_usuario) === String(usuario.id))
                : [];
            
            console.log("✅ [TICKETS] Tickets filtrados para este usuario:", ticketsDelUsuario.length);
            
            setTickets(ticketsDelUsuario);
            setError(null);
        } catch (err: any) {
            console.error("❌ [TICKETS] Fallo al obtener tickets:", err);
            setError(err.message || "Error al cargar los tickets reportados.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        cargarSubcategorias();
    }, []); 

    useEffect(() => {
        setCurrentPage(1); 
        setSelectedSubcategoriaId(null); 
        setTipoSolicitudFilter('all'); 
        if (activeTab === 'solicitudes') {
            cargarSolicitudes();
        } else {
            cargarTickets();
        }
    }, [activeTab]);

    // Actualizar subcategoriaOptions cada vez que cambien las solicitudes o subcategorias
    useEffect(() => {
        if (activeTab !== 'solicitudes') return;
        const subcatIdsSet = new Set<string>();
        solicitudes.forEach(sol => {
            const subcatId = sol.id_subcategoria ?? sol.id_subcatego ?? sol.id_subcate ?? sol.id_subcat ?? sol.id_subcateg;
            if (subcatId !== null && subcatId !== undefined) {
                subcatIdsSet.add(String(subcatId));
            }
        });
        const filteredOptions = Array.from(subcatIdsSet).map(id => ({
            id,
            nombre: subcategorias[id] || 'N/A'
        }));
        setSubcategoriaOptions(filteredOptions);
    }, [solicitudes, subcategorias, activeTab]);
    
    const filteredSolicitudes = useMemo(() => {
        if (activeTab !== 'solicitudes') {
            return solicitudes;
        }

        let filtered = [...solicitudes];

        if (tipoSolicitudFilter === 'elementos') {
            filtered = filtered.filter(sol => {
                const subcatId = sol.id_subcategoria ?? sol.id_subcatego ?? sol.id_subcate ?? sol.id_subcat ?? sol.id_subcateg;
                return subcatId !== null && subcatId !== undefined;
            });
        } else if (tipoSolicitudFilter === 'espacios') {
            filtered = filtered.filter(sol => {
                const subcatId = sol.id_subcategoria ?? sol.id_subcatego ?? sol.id_subcate ?? sol.id_subcat ?? sol.id_subcateg;
                return subcatId === null || subcatId === undefined;
            });
        }

        if (selectedSubcategoriaId && tipoSolicitudFilter !== 'espacios') {
            const filterId = String(selectedSubcategoriaId);
            filtered = filtered.filter(sol => {
                const solSubcatId = String(
                    sol.id_subcategoria ??
                    sol.id_subcatego ??
                    sol.id_subcate ??
                    sol.id_subcat ??
                    sol.id_subcateg ??
                    'NULL'
                );
                return solSubcatId === filterId;
            });
        }

        return filtered;
    }, [solicitudes, selectedSubcategoriaId, tipoSolicitudFilter, activeTab]);
    
    const currentItems = activeTab === 'solicitudes' ? filteredSolicitudes : tickets;

    const indexOfLastItem = currentPage * solicitudesPerPage;
    const indexOfFirstItem = indexOfLastItem - solicitudesPerPage;
    const currentViewItems: (Solicitud | Ticket)[] = currentItems.slice(indexOfFirstItem, indexOfLastItem);
    const handleCancelStatus = async (id_solicitud: number) => {
        const ESTADO_CANCELADO = 'Cancelado';
        Alert.alert(
            "Cancelar solicitud",
            "¿Desea cancelar la solicitud?",
            [
                { text: "No", style: "cancel" },
                { 
                    text: "Sí", 
                    onPress: async () => {
                        try {
                            await solicitudesService.update(id_solicitud, { id_est_soli: 4 }); 
                            setSolicitudes((prevSolicitudes: Solicitud[]) =>
                                prevSolicitudes.map((sol: Solicitud) => {
                                    if (sol.id_soli === id_solicitud) {
                                        return { ...sol, est_soli: ESTADO_CANCELADO };
                                    }
                                    return sol;
                                })
                            );
                        } catch (err) {
                            console.error("Error al cancelar la solicitud:", err);
                            const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
                            Alert.alert("Error", `Error al cancelar la solicitud ${id_solicitud}: ${errorMsg}`);
                        }
                    }
                }
            ]
        );
    };
    
    const totalPages = Math.ceil(currentItems.length / solicitudesPerPage);
    const paginate = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleFilterChange = (id: string) => {
        setSelectedSubcategoriaId(id === 'all' ? null : id);
        setCurrentPage(1); 
    };

    const handleTipoFilterChange = (tipo: string) => {
        setTipoSolicitudFilter(tipo);
        setSelectedSubcategoriaId(null); 
        setCurrentPage(1);
    };

    const renderSolicitudItem = (sol: Solicitud) => {
        const status = getStatusDetails(sol.est_soli); 
        const subcatId = sol.id_subcategoria ?? sol.id_subcatego ?? sol.id_subcate ?? sol.id_subcat ?? sol.id_subcateg ?? null;
        const subcategoriaKey = subcatId !== null && subcatId !== undefined ? String(subcatId) : '';
        const subcategoriaNombre = subcategoriaKey !== '' ? (subcategorias[subcategoriaKey] || 'N/A') : 'N/A';
        const esEspacio = subcatId === null || subcatId === undefined;
        const nombreEspacio = sol.nom_espa || sol.nombre_espacio || 'N/A';
        const puedeCancelar = sol.est_soli?.toLowerCase().includes('pendiente');

        return (
            <View style={styles.card} key={sol.id_soli}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardEmoji}>{esEspacio ? '🏢' : '📦'}</Text>
                    <View style={[styles.badge, { backgroundColor: status.color }]}>
                        <Text style={styles.badgeText}>{status.emoji} {status.text}</Text>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.cardText}><Text style={styles.cardLabel}>Usuario:</Text> {sol.nom_usu || 'N/A'}</Text>
                    {esEspacio ? (
                        <Text style={styles.cardText}><Text style={styles.cardLabel}>Espacio:</Text> {nombreEspacio}</Text>
                    ) : (
                        <>
                            <Text style={styles.cardText}><Text style={styles.cardLabel}>Elemento:</Text> {subcategoriaNombre}</Text>
                            <Text style={styles.cardText}><Text style={styles.cardLabel}>Cantidad:</Text> {sol.cantid || 1}</Text>
                        </>
                    )}
                    <Text style={styles.cardText}><Text style={styles.cardLabel}>Ambiente:</Text> {sol.ambient || 'N/A'}</Text>
                    <Text style={styles.cardText}><Text style={styles.cardLabel}>Inicio:</Text> {formatFecha(sol.fecha_ini || 'N/A')} | <Text style={styles.cardLabel}>Fin:</Text> {formatFecha(sol.fecha_fn || 'N/A')}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.cancelButton, !puedeCancelar && styles.disabledButton]}
                    onPress={() => handleCancelStatus(sol.id_soli)}
                    disabled={!puedeCancelar}
                >
                    <Text style={styles.cancelButtonText}>❌ Cancelar solicitud</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderTicketItem = (ticket: Ticket) => {
        const statusTicket = ticket.id_est_tick === 2 ? 
            { text: 'Activo', color: '#dc3545', emoji: '🚨' } : 
            { text: 'Resuelto', color: '#198754', emoji: '👍' };

        return (
            <View style={styles.card} key={ticket.id_tickets}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardEmoji}>🔧</Text>
                    <View style={[styles.badge, { backgroundColor: statusTicket.color }]}>
                        <Text style={styles.badgeText}>{statusTicket.emoji} {statusTicket.text}</Text>
                    </View>
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.cardText}><Text style={styles.cardLabel}>ID Ticket:</Text> {ticket.id_tickets || 'N/A'}</Text>
                    <Text style={styles.cardText}><Text style={styles.cardLabel}>Equipo:</Text> {ticket.nom_elem || `ID ${ticket.id_eleme}`}</Text>
                    <Text style={styles.cardText}><Text style={styles.cardLabel}>Problema:</Text> {ticket.nom_problm || 'N/A'}</Text>
                    <Text style={styles.cardText}><Text style={styles.cardLabel}>Ambiente:</Text> {ticket.ambient || 'N/A'}</Text>
                    <Text style={styles.cardText}><Text style={styles.cardLabel}>Fecha:</Text> {formatFecha(ticket.fecha_in || 'N/A')}</Text>
                    {ticket.Obser && (
                        <Text style={[styles.cardText, styles.observationText]}>
                            <Text style={styles.cardLabel}>Observaciones:</Text> {ticket.Obser}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    const renderHistorialContent = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color="#007bff" style={styles.loading} />;
        }
        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>🚨 Error de Carga</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <Text style={styles.errorTip}>Verifica que hayas iniciado sesión y que la API esté funcionando.</Text>
                </View>
            );
        }
        if (currentItems.length === 0) {
            return (
                <Text style={styles.emptyText}>
                    {activeTab === 'solicitudes' 
                        ? 'No hay solicitudes que coincidan con el filtro seleccionado.' 
                        : 'No has reportado ningún equipo aún.'}
                </Text>
            );
        }
        if (currentViewItems.length === 0 && currentItems.length > 0) {
            return <Text style={styles.emptyText}>No hay {activeTab === 'solicitudes' ? 'solicitudes' : 'tickets'} en esta página.</Text>;
        }

        return (
            <View style={styles.stackContainer}>
                {currentViewItems.map((item) => {
                    if (activeTab === 'solicitudes') {
                        return renderSolicitudItem(item as Solicitud);
                    } else {
                        return renderTicketItem(item as Ticket);
                    }
                })}
            </View>
        );
    };
    return (
        <SafeAreaView style={styles.container}> 
            {/* 4. Implementación del Header */}
            <HeaderWithDrawer navigation={navigation} title="Historial" />
            
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'solicitudes' && styles.activeTab]}
                    onPress={() => setActiveTab('solicitudes')}
                >
                    <Text style={[styles.tabText, activeTab === 'solicitudes' && styles.activeTabText]}>📝 Mis Solicitudes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'tickets' && styles.activeTab]}
                    onPress={() => setActiveTab('tickets')}
                >
                    <Text style={[styles.tabText, activeTab === 'tickets' && styles.activeTabText]}>🔧 Equipos Reportados</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
                {activeTab === 'solicitudes' && (
                    <View style={styles.filterContainer}>
                        <Text style={styles.filterLabel}>Tipo de Solicitud:</Text>
                        <View style={styles.filterButtons}>
                            {['all', 'elementos', 'espacios'].map(tipo => (
                                <TouchableOpacity
                                    key={tipo}
                                    style={[styles.filterTypeButton, tipoSolicitudFilter === tipo && styles.activeFilterTypeButton]}
                                    onPress={() => handleTipoFilterChange(tipo)}
                                >
                                    <Text style={styles.filterButtonText}>
                                        {tipo === 'all' ? 'Todas' : tipo === 'elementos' ? '📦 Elementos' : '🏢 Espacios'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {tipoSolicitudFilter !== 'espacios' && (
                            <>
                                <Text style={styles.filterLabel}>Subcategoría:</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        Alert.alert(
                                            "Filtrar Subcategoría",
                                            "Selecciona una opción:",
                                            [
                                                { text: "Todas", onPress: () => handleFilterChange('all') },
                                                ...subcategoriaOptions.map(sub => ({
                                                    text: sub.nombre,
                                                    onPress: () => handleFilterChange(sub.id)
                                                }))
                                            ]
                                        );
                                    }}
                                    style={styles.dropdownPicker}
                                >
                                    <Text style={styles.dropdownPickerText}>
                                        🏷️ Subcategoría: {subcategoriaOptions.find(opt => opt.id === selectedSubcategoriaId)?.nombre || 'Todas las subcategorías'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
                
                {renderHistorialContent()}

                <PaginationMovil 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    paginate={paginate} 
                />
            </ScrollView>

            <View style={styles.footerContainer}>
                <Text style={styles.footerText}>© Historial de Pedidos</Text>
            </View>
        </SafeAreaView>
    ); 
}
