import api from "../utils/Api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AnimalView = () => {
const [animal,setAnimal]=useState<any>(null);
const [loading,setLoading]=useState(true);
const [error,setError]=useState<string | null>(null);
const [generatingReport, setGeneratingReport] = useState(false);
const [reportData, setReportData] = useState<any>(null);
const [showReport, setShowReport] = useState(false);
const navigate=useNavigate();
const { farmId, animalId } = useParams();


useEffect(()=>{
    fetchAnimal();
},[]);

const fetchAnimal=async()=>{
    try{
        const response=await api.get(`/livestock/${farmId}/animals/${animalId}`);
        setAnimal(response.data.data);
        setLoading(false);
    }catch(error){
        console.error('Failed to fetch animal:',error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        setLoading(false);
    }
};

const generateReport = async () => {
    setGeneratingReport(true);
    setError(null);
    try {
        const response = await api.get(`/reports/${farmId}/generate-animal-report`);
        if (response.data.success) {
            // Find the current animal in the report
            const currentAnimalReport = response.data.animals.find(
                (a: any) => a.tagId === animal.tagId
            );
            
            if (currentAnimalReport) {
                setReportData(currentAnimalReport);
                setShowReport(true);
            } else {
                setError('Animal not found in report');
            }
        }
    } catch (error: any) {
        console.error('Failed to generate report:', error);
        setError(error.response?.data?.message || 'Failed to generate report');
    } finally {
        setGeneratingReport(false);
    }
};

const closeReport = () => {
    setShowReport(false);
    setReportData(null);
};

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex flex-row justify-between">
                <h2 className="text-2xl font-bold mb-6 text-center">Animal Details</h2>
             <button
              onClick={() => navigate(`/${farmId}/livestock`)}
              className="text-gray-500 hover:text-red-100 transition-colors duration-200"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
            </div>
                {loading ? (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading profile...</p>
                    </div>
                ) : error ? (
                    <div className="text-center">
                        <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                        <p className="text-gray-600">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <strong>Name:</strong> {animal?.name}
                        </div>
                        <div>
                            <strong>Species:</strong> {animal?.species}
                        </div>
                        <div>
                            <strong>Health Status:</strong> {animal?.healthStatus}
                        </div>
                        <div>
                            <strong>Breed:</strong> {animal?.breed}
                        </div>
                        <div>
                            <strong>Gender:</strong> {animal?.gender}
                        </div>
                        <div>
                            <strong>Weight:</strong> {animal?.weight} kg
                        </div>
                        <div>
                            <strong>Age:</strong> {animal?.age} years
                        </div>
                        <div>
                            <strong>Assigned Worker:</strong> {animal?.assignedWorker ? `${animal.assignedWorker.firstName} ${animal.assignedWorker.lastName}` : 'Unassigned'}
                        </div>
                        <hr />
                        <button onClick={()=>navigate(`/${farmId}/livestock/${animalId}/edit`)}
                         className="text-blue-500 hover:text-blue-900 transition-colors duration-200">
                            <i className="fas fa-user-edit"></i> Update Animal
                        </button>
                        <br/>
                        <button onClick={()=>navigate(`/${farmId}/livestock/${animalId}/vaccinate`)}
                         className="text-purple-500 hover:text-purple-900 transition-colors duration-200">
                            <i className="fas fa-plus-circle"></i> Vaccinate
                        </button>
                        <br/>
                        <button 
                            onClick={generateReport}
                            disabled={generatingReport}
                            className="text-green-500 hover:text-green-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i className={`fas ${generatingReport ? 'fa-spinner fa-spin' : 'fa-file-alt'}`}></i> 
                            {generatingReport ? ' Generating...' : ' Generate Full Report'}
                        </button>
                     
                    </div>
                
                )}

                {/* Report Modal */}
                {showReport && reportData && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                            {/* Header */}
                            <div className="bg-green-600 text-white p-4 flex justify-between items-center">
                                <h3 className="text-xl font-bold">
                                    <i className="fas fa-file-medical mr-2"></i>
                                    Comprehensive Animal Report
                                </h3>
                                <button
                                    onClick={closeReport}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <i className="fas fa-times text-2xl"></i>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                                {/* Basic Information */}
                                <section className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                        <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                                        Basic Information
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><strong>Tag ID:</strong> {reportData.tagId}</div>
                                        <div><strong>Name:</strong> {reportData.name}</div>
                                        <div><strong>Species:</strong> {reportData.species}</div>
                                        <div><strong>Breed:</strong> {reportData.breed}</div>
                                        <div><strong>Gender:</strong> {reportData.gender}</div>
                                        <div><strong>Age:</strong> {reportData.age || 'N/A'} years</div>
                                        <div><strong>Current Weight:</strong> {reportData.currentWeight || 'N/A'} kg</div>
                                        <div><strong>Health Status:</strong> 
                                            <span className={`ml-2 px-2 py-1 rounded text-sm ${
                                                reportData.healthStatus === 'healthy' ? 'bg-green-100 text-green-800' :
                                                reportData.healthStatus === 'sick' ? 'bg-red-100 text-red-800' :
                                                reportData.healthStatus === 'treatment' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {reportData.healthStatus}
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                {/* Birth & Purchase Info */}
                                <section className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                        <i className="fas fa-calendar-alt text-purple-500 mr-2"></i>
                                        Birth & Purchase Information
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><strong>Date of Birth:</strong> {reportData.dateOfBirth ? new Date(reportData.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                                        <div><strong>Date of Purchase:</strong> {reportData.dateOfPurchase ? new Date(reportData.dateOfPurchase).toLocaleDateString() : 'N/A'}</div>
                                        <div><strong>Purchase Price:</strong> {reportData.purchasePrice ? `$${reportData.purchasePrice}` : 'N/A'}</div>
                                    </div>
                                </section>

                                {/* Assigned Worker */}
                                {reportData.assignedWorker && (
                                    <section className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                            <i className="fas fa-user text-indigo-500 mr-2"></i>
                                            Assigned Worker
                                        </h4>
                                        <div className="bg-gray-50 p-4 rounded">
                                            <div><strong>Name:</strong> {reportData.assignedWorker.name}</div>
                                            <div><strong>Email:</strong> {reportData.assignedWorker.email}</div>
                                            <div><strong>Phone:</strong> {reportData.assignedWorker.phone}</div>
                                        </div>
                                    </section>
                                )}

                                {/* Health Records */}
                                <section className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                        <i className="fas fa-heartbeat text-red-500 mr-2"></i>
                                        Health Records ({reportData.healthRecords.total})
                                    </h4>
                                    {reportData.healthRecords.total > 0 ? (
                                        <div className="space-y-3">
                                            {reportData.healthRecords.records.map((record: any, index: number) => (
                                                <div key={index} className="bg-red-50 p-4 rounded border border-red-200">
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div><strong>Type:</strong> {record.recordType}</div>
                                                        <div><strong>Outcome:</strong> {record.outcome}</div>
                                                        <div className="col-span-2"><strong>Description:</strong> {record.description}</div>
                                                        <div><strong>Diagnosis:</strong> {record.diagnosis}</div>
                                                        <div><strong>Treatment:</strong> {record.treatment}</div>
                                                        <div><strong>Medication:</strong> {record.medication}</div>
                                                        <div><strong>Treated By:</strong> {record.treatedBy}</div>
                                                        <div><strong>Treatment Date:</strong> {record.treatmentDate ? new Date(record.treatmentDate).toLocaleDateString() : 'N/A'}</div>
                                                        <div><strong>Recovery Date:</strong> {record.recoveryDate ? new Date(record.recoveryDate).toLocaleDateString() : 'N/A'}</div>
                                                        {record.notes && <div className="col-span-2"><strong>Notes:</strong> {record.notes}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No health records available</p>
                                    )}
                                </section>

                                {/* Treatment Records */}
                                <section className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                        <i className="fas fa-pills text-orange-500 mr-2"></i>
                                        Treatment Records ({reportData.treatmentRecords.total})
                                    </h4>
                                    {reportData.treatmentRecords.total > 0 ? (
                                        <div className="space-y-3">
                                            {reportData.treatmentRecords.records.map((record: any, index: number) => (
                                                <div key={index} className="bg-orange-50 p-4 rounded border border-orange-200">
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div><strong>Health Status:</strong> {record.healthStatus}</div>
                                                        <div><strong>Status:</strong> 
                                                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                                                record.status === 'treated' ? 'bg-green-100 text-green-800' :
                                                                record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                                {record.status}
                                                            </span>
                                                        </div>
                                                        <div><strong>Treatment:</strong> {record.treatmentGiven}</div>
                                                        <div><strong>Dosage:</strong> {record.dosage}</div>
                                                        <div><strong>Date:</strong> {record.treatmentDate ? new Date(record.treatmentDate).toLocaleDateString() : 'N/A'}</div>
                                                        <div><strong>Administered By:</strong> {record.administeredBy}</div>
                                                        {record.notes && <div className="col-span-2"><strong>Notes:</strong> {record.notes}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No treatment records available</p>
                                    )}
                                </section>

                                {/* Vaccination Records */}
                                <section className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                        <i className="fas fa-syringe text-blue-500 mr-2"></i>
                                        Vaccination Records ({reportData.vaccinationRecords.total})
                                    </h4>
                                    {reportData.vaccinationRecords.total > 0 ? (
                                        <div className="space-y-3">
                                            {reportData.vaccinationRecords.records.map((record: any, index: number) => (
                                                <div key={index} className="bg-blue-50 p-4 rounded border border-blue-200">
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div><strong>Vaccine:</strong> {record.vaccineName}</div>
                                                        <div><strong>Date:</strong> {record.vaccinationDate ? new Date(record.vaccinationDate).toLocaleDateString() : 'N/A'}</div>
                                                        <div><strong>Administered By:</strong> {record.administeredBy}</div>
                                                        <div><strong>Site:</strong> {record.administrationSite.join(', ') || 'N/A'}</div>
                                                        <div><strong>Side Effects:</strong> {record.sideEffects}</div>
                                                        {record.notes && <div className="col-span-2"><strong>Notes:</strong> {record.notes}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No vaccination records available</p>
                                    )}
                                </section>

                                {/* Production Records */}
                                <section className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                        <i className="fas fa-chart-line text-teal-500 mr-2"></i>
                                        Production History ({reportData.productionRecords.total} records)
                                    </h4>
                                    {reportData.productionRecords.total > 0 ? (
                                        <div>
                                            <div className="bg-teal-100 p-4 rounded mb-4 border border-teal-300">
                                                <div className="text-lg font-bold text-teal-800">
                                                    <i className="fas fa-tint mr-2"></i>
                                                    Total Milk Produced: {reportData.productionRecords.totalMilkProduced.toFixed(2)} liters
                                                </div>
                                            </div>
                                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                                {reportData.productionRecords.records.map((record: any, index: number) => (
                                                    <div key={index} className="bg-teal-50 p-3 rounded border border-teal-200">
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div><strong>Date:</strong> {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</div>
                                                            {record.milkYield && (
                                                                <>
                                                                    <div><strong>Milk Yield:</strong> {record.milkYield.amount} {record.milkYield.unit}</div>
                                                                    <div><strong>Time:</strong> {record.milkYield.timeOfDay}</div>
                                                                </>
                                                            )}
                                                            {record.feedConsumption && (
                                                                <div><strong>Feed Consumed:</strong> {record.feedConsumption.amount} {record.feedConsumption.unit}</div>
                                                            )}
                                                            {record.notes && <div className="col-span-2"><strong>Notes:</strong> {record.notes}</div>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No production records available</p>
                                    )}
                                </section>

                                {/* Financial Summary */}
                                <section className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                        <i className="fas fa-money-bill-wave text-green-600 mr-2"></i>
                                        Financial Summary
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Costs */}
                                        <div className="bg-red-50 p-4 rounded border border-red-200">
                                            <h5 className="font-semibold text-red-800 mb-3 flex items-center">
                                                <i className="fas fa-arrow-down mr-2"></i>
                                                Total Costs
                                            </h5>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Purchase Price:</span>
                                                    <span className="font-semibold">${reportData.financialSummary.costs.purchasePrice.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Feed Cost:</span>
                                                    <span className="font-semibold">${reportData.financialSummary.costs.feedCost.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Treatment Cost:</span>
                                                    <span className="font-semibold">${reportData.financialSummary.costs.treatmentCost.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Vaccination Cost:</span>
                                                    <span className="font-semibold">${reportData.financialSummary.costs.vaccinationCost.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between border-t pt-2 font-bold text-base">
                                                    <span>Total:</span>
                                                    <span className="text-red-700">${reportData.financialSummary.costs.totalCosts.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Revenue */}
                                        <div className="bg-green-50 p-4 rounded border border-green-200">
                                            <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                                                <i className="fas fa-arrow-up mr-2"></i>
                                                Total Revenue
                                            </h5>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Milk Sales:</span>
                                                    <span className="font-semibold">${reportData.financialSummary.revenue.milkRevenue.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between border-t pt-2 font-bold text-base">
                                                    <span>Total:</span>
                                                    <span className="text-green-700">${reportData.financialSummary.revenue.totalRevenue.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profit/Loss */}
                                    <div className={`mt-4 p-6 rounded-lg border-2 ${
                                        reportData.financialSummary.isProfitable 
                                            ? 'bg-green-100 border-green-500' 
                                            : 'bg-red-100 border-red-500'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <h5 className={`text-xl font-bold ${
                                                reportData.financialSummary.isProfitable 
                                                    ? 'text-green-800' 
                                                    : 'text-red-800'
                                            }`}>
                                                <i className={`fas ${
                                                    reportData.financialSummary.isProfitable 
                                                        ? 'fa-chart-line' 
                                                        : 'fa-exclamation-triangle'
                                                } mr-2`}></i>
                                                {reportData.financialSummary.isProfitable ? 'Profit' : 'Loss'}
                                            </h5>
                                            <span className={`text-3xl font-bold ${
                                                reportData.financialSummary.isProfitable 
                                                    ? 'text-green-700' 
                                                    : 'text-red-700'
                                            }`}>
                                                ${Math.abs(reportData.financialSummary.profitLoss).toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-sm mt-2 text-gray-700">
                                            <i className="fas fa-info-circle mr-1"></i>
                                            Note: Costs are calculated using estimated values for feed ($2/kg), treatments ($50 each), and vaccinations ($30 each). Revenue assumes $0.50 per liter of milk.
                                        </p>
                                    </div>
                                </section>

                                {/* Timeline */}
                                <section>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                                        <i className="fas fa-clock text-gray-500 mr-2"></i>
                                        Timeline
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><strong>Added:</strong> {reportData.addedAt ? new Date(reportData.addedAt).toLocaleString() : 'N/A'}</div>
                                        <div><strong>Last Updated:</strong> {reportData.updatedAt ? new Date(reportData.updatedAt).toLocaleString() : 'N/A'}</div>
                                    </div>
                                </section>
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-100 p-4 flex justify-end space-x-3">
                                <button
                                    onClick={() => window.print()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                    <i className="fas fa-print mr-2"></i>
                                    Print Report
                                </button>
                                <button
                                    onClick={closeReport}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnimalView;