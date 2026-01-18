import {Routes, Route} from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Register from '../components/Forms/Register';
import Login from '../components/Forms/Login';
import Dashboard from '../pages/Dashboard';
import Navigation from '../components/Navigation';
import NotFound from '../components/NotFound';

// import ProtectedRoutes from './ProtectedRoutes';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoutes from './ProtectedRoutes';
import Farms from '../pages/Farms';
import { FarmProvider } from '../contexts/FarmContext';
import SelectFarm from '../components/Forms/SelectFarm';
import ChatbotButton from '../components/ChatbotButton';
import Profile from '../components/Profile';
import AddFarm from '../components/Forms/AddFarm';
import FarmDashboard from '../pages/Dashboards/FarmDashboard';
import AddTask from '../components/Forms/AddTask';
import FarmerDashboard from '../pages/Dashboards/FarmerDashboard';
import UpdateProfile from '../components/Forms/UpdateProfile';
import AddAnimal from '../components/Forms/AddAnimal';
import AnimalList from '../components/AnimalList';
import AnimalView from '../components/AnimalView';
import UpdateAnimal from '../components/Forms/UpdateAnimal';
import UpdateFarm from '../components/Forms/UpdateFarm';
import EmployWorker from '../components/Forms/EmployWorker';
import CreateWorker from '../components/Forms/CreateWorker';
import FarmWorkers from '../components/FarmWorkers';
import DismissWorker from '../components/Forms/DismissWorker';
import ChangePassword from '../components/Forms/ChangePassword';
import FarmTasks from '../components/FarmTasks';
import UpdateTask from '../components/Forms/UpdateTask';
import TaskView from '../components/TaskView';
import MyTasks from '../components/MyTasks';
import AssignedAnimals from '../components/AssignedAnimals';
import MilkProduction from '../components/Forms/MilkProduction';
import SickAnimals from '../components/SickAnimals';
import AssignVet from '../components/Forms/AssignVet';
import VetsList from '../pages/VetsList';
import ScheduleTreatment from '../components/Forms/ScheduleTreatment';
import TreatmentSchedules from '../components/TreatmentSchedules';
import TreatAnimal from '../components/Forms/TreatAnimal';
import NetworkHandler from '../components/NetworkHandler';
import Vaccinate from '../components/Forms/Vaccinate';
import VaccinationCases from '../components/VaccinationCases';
import NotificationList from '../pages/NotificationList';

// Financial Management
import FinancialOverview from '../pages/Financial/FinancialOverview';
import RevenueList from '../pages/Financial/RevenueList';
import RevenueForm from '../pages/Financial/RevenueForm';
import ExpenseList from '../pages/Financial/ExpenseList';
import ExpenseForm from '../pages/Financial/ExpenseForm';
import ROIAnalysis from '../pages/Financial/ROIAnalysis';
import LoanManagement from '../pages/Financial/LoanManagement';
import FinancialRecommendations from '../pages/Financial/FinancialRecommendations';

// Health Management
import HealthRecords from '../components/HealthRecords';
import DiseaseSurveillance from '../components/DiseaseSurveillance';

// Feeding Management
import FeedingSchedule from '../components/FeedingSchedule';
import FeedInventory from '../components/FeedInventory';
import NutritionCalculator from '../components/NutritionCalculator';
import FeedingCosts from '../components/FeedingCosts';

// Reports
import ReportAnalytics from '../pages/Reports/ReportAnalytics';
import ExportTools from '../pages/Reports/ExportTools';
import TrendAnalysis from '../pages/Reports/TrendAnalysis';
import ReportGenerator from '../pages/Reports/ReportGenerator';

// Livestock
import BreedingRecords from '../components/BreedingRecords';

const AppRoutes = () => {
    return (
        <AuthProvider>
            <NetworkHandler>
                <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                <Route path="/dashboard" element={
                    <ProtectedRoutes>
                        <>
                            <Navigation />
                            <Dashboard />
                        </>
                    </ProtectedRoutes>} />
                <Route path="/notifications" element={
                    <ProtectedRoutes>
                        <>
                            <Navigation />
                            <NotificationList />
                        </>
                    </ProtectedRoutes>} />
                <Route path="/dashboard/farmer" element={
                    <ProtectedRoutes>
                        <>
                            <Navigation />
                            <FarmerDashboard />
                        </>
                    </ProtectedRoutes>} />
                <Route path="/select/farm" element={
                    <ProtectedRoutes>
                        <>
                            <Navigation />
                            <FarmProvider>
                                <SelectFarm />
                            </FarmProvider>
                        </>
                    </ProtectedRoutes>} />
                    <Route path="/farms/:farmId/livestock/:animalId/treatment/schedule" element={
                    <ProtectedRoutes>
                        <FarmProvider>
                            <Navigation />
                            <ScheduleTreatment />   
                        </FarmProvider>
                    </ProtectedRoutes>
                } />

                    <Route path="/farms/:farmId/animals/sick" element={
                    <ProtectedRoutes>
                        <>
                            <Navigation />
                            <SickAnimals/>
                        </>
                        </ProtectedRoutes>
                } />
                <Route path="/farms" element={
                    <ProtectedRoutes>
                        <>                        
                            <Navigation />
                            <Farms />
                        </>
                    </ProtectedRoutes>} />
            <Route path="/farms/add" element={
                <ProtectedRoutes>
                    <>                        
                    <Navigation />
                    <AddFarm />
                    </>
                </ProtectedRoutes>} />

            <Route path="/farms/:farmId/dashboard" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <FarmProvider>
                            <FarmDashboard />
                        </FarmProvider>
                    </>
                </ProtectedRoutes>} />

            <Route path="/farms/:farmId/update" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <UpdateFarm />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path="/farms/:farmId/vets" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <VetsList />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/assign-vet" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <AssignVet />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/tasks/add" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <AddTask />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/tasks" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <FarmTasks />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/tasks/:taskId" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <TaskView />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/tasks/:taskId/edit" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <UpdateTask/>
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/tasks" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                            <MyTasks />
                    </>
                </ProtectedRoutes>} />

                <Route path="/assigned-animals" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                            <AssignedAnimals />
                    </>
                </ProtectedRoutes>} />
                <Route path="/farms/:farmId/animals/:animalId/milk-production" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <MilkProduction />
                    </>
                </ProtectedRoutes>} />
                
            <Route path="/change-password" element={
                <ProtectedRoutes><AuthProvider>
                    <Navigation />
                    <ChangePassword />
                    </AuthProvider></ProtectedRoutes>
            } />      
            <Route path='/profile' element={
                <ProtectedRoutes><AuthProvider>
                    <Navigation />
                    <Profile />
                    </AuthProvider></ProtectedRoutes>
            } />
            <Route path='/profile/edit' element={
                <ProtectedRoutes><AuthProvider><UpdateProfile /></AuthProvider></ProtectedRoutes>
            } />
            <Route path='/farms/:farmId/livestock/add' element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <AddAnimal />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path='/farms/:farmId/livestock/breeding' element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <BreedingRecords />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path='/farms/:farmId/livestock/:animalId/edit' element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <UpdateAnimal />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path='/farms/:farmId/livestock/:animalId/vaccinate' element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <Vaccinate/>
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path='/farms/:farmId/livestock/:animalId' element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <AnimalView />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path='/farms/:farmId/livestock' element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <AnimalList />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path="/farms/:farmId/workers/employ" element={
                <ProtectedRoutes>
                    <FarmProvider>                   
                        <Navigation />
                        <EmployWorker />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path="/farms/:farmId/workers/create" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <CreateWorker />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path="/farms/:farmId/workers" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <FarmWorkers />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path="/farms/:farmId/workers/dismiss" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <DismissWorker />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path='/vaccinations' element={
                <ProtectedRoutes>
                    <>
                    <Navigation/>
                    <VaccinationCases/>
                    </>
                </ProtectedRoutes>
            }/>
            
            {/* Health Routes */}
            <Route path="/farms/:farmId/health/records" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <HealthRecords />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path="/farms/:farmId/health/surveillance" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <DiseaseSurveillance />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            {/* Feeding Routes */}
            <Route path="/farms/:farmId/feeding/schedule" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <FeedingSchedule />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path="/farms/:farmId/feeding/inventory" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <FeedInventory />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path="/farms/:farmId/feeding/calculator" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <NutritionCalculator />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path="/farms/:farmId/feeding/costs" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <FeedingCosts />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/treatment-schedules" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                            <TreatmentSchedules />
                    </>
                </ProtectedRoutes>
            } />
            <Route path="/treatment-schedules/treat/:scheduleId" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <TreatAnimal />
                    </>
                </ProtectedRoutes>
            } />

            {/*
            <Route path="/profile" element={<ProtectedRoutes><Profile /></ProtectedRoutes>} />
            <Route path="/settings" element={<ProtectedRoutes><Settings /></ProtectedRoutes>} /> */}

            {/* Financial Management Routes */}
            <Route path="/farms/:farmId/financial" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <FinancialOverview />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/revenues" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <RevenueList />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/revenues/new" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <RevenueForm />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/revenues/:revenueId/edit" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <RevenueForm isEdit={true} />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/expenses" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <ExpenseList />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/expenses/new" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <ExpenseForm />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/expenses/:expenseId/edit" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <ExpenseForm isEdit={true} />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/financial/roi" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <ROIAnalysis />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/financial/loans" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <LoanManagement />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/financial/recommendations" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <FinancialRecommendations />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            {/* Reports Routes */}
            <Route path="/farms/:farmId/reports/analytics" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <ReportAnalytics />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/reports/export" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <ExportTools />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/reports/trends" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <TrendAnalysis />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/farms/:farmId/reports/generator" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <ReportGenerator />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            {/* Catch all invalid routes */}
            <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatbotButton />
        </NetworkHandler>
        </AuthProvider>
    );
};

export default AppRoutes;