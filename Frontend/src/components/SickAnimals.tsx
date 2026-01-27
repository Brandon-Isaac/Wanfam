import api from '../utils/Api';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const SickAnimals = () => {
    const { showToast } = useToast();
    const [sickAnimals, setSickAnimals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHealthModal, setShowHealthModal] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<{ id: string; name: string } | null>(null);
    const [deleting, setDeleting] = useState(false);
    const { farmId } = useParams();
    const navigate = useNavigate();

    const fetchSickAnimals = async () => {
        try {
            const response = await api.get(`/livestock/${farmId}/sick-animals`);
            setSickAnimals(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch sick animals:', error);
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
            setLoading(false);
        }
    };

    const updateHealthStatus = async (animalId: string, newStatus: string) => {
        try {
            await api.put(`/livestock/${animalId}/health-status`, { healthStatus: newStatus });
            fetchSickAnimals();
            showToast('Health status updated successfully', 'success');
        } catch (error) {
            console.error('Failed to update health status:', error);
            showToast('Failed to update health status. Please try again.', 'error');
        }
    };

    const handleDeleteAnimal = async () => {
        if (!showDeleteModal) return;
        
        setDeleting(true);
        try {
            await api.delete(`/livestock/${farmId}/animals/${showDeleteModal.id}`);
            showToast(`${showDeleteModal.name} has been deleted from the system`, 'success');
            setShowDeleteModal(null);
            fetchSickAnimals();
        } catch (error) {
            console.error('Failed to delete animal:', error);
            showToast('Failed to delete animal. Please try again.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        fetchSickAnimals();
    }, [farmId]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Sick Animals</h2>
            {loading ? (
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading sick animals...</p>
                </div>
            ) : error ? (
                <div className="text-center">
                    <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                    <p className="text-gray-600">{error}</p>
                </div>
            ) : sickAnimals.length === 0 ? (
                <div className="text-center">
                    <i className="fas fa-check-circle text-green-500 text-4xl mb-4"></i>
                    <p className="text-gray-600">No sick animals at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sickAnimals.map((animal) => (
                        <div key={animal._id} className={`bg-white p-6 rounded-lg shadow-md ${animal.healthStatus.toLowerCase() === 'deceased' ? 'border-2 border-red-500' : ''}`}>
                            <div className="text-5xl mb-4 text-center flex flex-row justify-between items-center">
                                   <h3 className="text-xl font-semibold mb-2">{animal.name.toUpperCase()}</h3>
                                      <i className={`fas ${animal.healthStatus.toLowerCase() === 'deceased' ? 'fa-skull text-red-600' : 'fa-syringe'} ${animal.healthStatus.toLowerCase() === 'sick' ? 'text-red-500' : 'text-blue-500'}`}></i>
                            </div>
                            <p>Species: {animal.species.toUpperCase()}</p>
                            <p className={`${animal.healthStatus.toLowerCase() === 'deceased' ? 'text-red-600 font-bold' : ''}`}>
                                Health Status: {animal.healthStatus.toUpperCase()}
                            </p>
                            
                            <div className="mt-4 flex flex-col gap-2">
                                {animal.healthStatus.toLowerCase() === 'deceased' && (
                                    <p className="text-sm text-gray-600 italic">This animal is deceased and should be removed from the system.</p>
                                )}
                                
                                <div className="flex justify-around items-center gap-2">
                                    {animal.healthStatus.toLowerCase() === 'sick' && (
                                        <button 
                                            onClick={() =>navigate(`/farms/${farmId}/livestock/${animal._id}/treatment/schedule`)}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                                           Update Treatment
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setShowHealthModal(animal._id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                       Update Health Status
                                    </button>
                                </div>
                                
                                {animal.healthStatus.toLowerCase() === 'deceased' && (
                                    <button 
                                        onClick={() => setShowDeleteModal({ id: animal._id, name: animal.name })}
                                        className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                                        <i className="fas fa-trash"></i>
                                        Delete from System
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                   
                </div>
            )}
            {showHealthModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-xl font-semibold mb-4">Update Health Status</h3>
                        <select
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                            onChange={(e) => {
                                if (showHealthModal) {
                                    updateHealthStatus(showHealthModal, e.target.value);
                                    setShowHealthModal(null);
                                }
                            }}
                            defaultValue=""
                        >
                            <option value="" disabled>Select new health status</option>
                            <option value="healthy">Healthy</option>
                            <option value="sick">Sick</option>
                            <option value="quarantined">Quarantined</option>
                            <option value="deceased">Deceased</option>
                        </select>
                        <div className="flex justify-end">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 mr-2"
                                onClick={() => setShowHealthModal(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <div className="text-center mb-4">
                            <i className="fas fa-exclamation-triangle text-red-500 text-5xl mb-3"></i>
                            <h3 className="text-xl font-semibold">Confirm Deletion</h3>
                        </div>
                        <p className="text-gray-700 mb-6 text-center">
                            Are you sure you want to permanently delete <strong>{showDeleteModal.name}</strong> from the system? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                                onClick={() => setShowDeleteModal(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                                onClick={handleDeleteAnimal}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-trash"></i>
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <button 
            onClick={() => navigate(`/farms/${farmId}/dashboard`)}
            className="mt-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Back To Dashboard
            </button>
        </div>
    );
};

export default SickAnimals;