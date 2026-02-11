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
import Chatbot from '../components/Chatbot';
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
import AllAnimals from '../pages/AllAnimals';
import Revenue from '../pages/Revenue';
import Expenses from '../pages/Expenses';
import FinancialOverview from '../pages/FinancialOverview';
import VaccinationCases from '../components/VaccinationCases';
import NotificationList from '../pages/NotificationList';
import Vaccinate from '../components/Forms/Vaccinate';
import ScheduleVaccination from '../components/Forms/ScheduleVaccination';
import FloatingChatbot from '../components/FloatingChatbot';
import CreateFeedSchedule from '../components/Forms/CreateFeedSchedule';
import FeedSchedules from '../pages/FeedSchedules';

// Loan Pages
import LoanApplications from '../pages/Loans/LoanApplications';
import ApprovedLoans from '../pages/Loans/ApprovedLoans';
import LoanReports from '../pages/Loans/LoanReports';

// User Management Pages
import AllUsers from '../pages/Users/AllUsers';
import AddUser from '../pages/Users/AddUser';
import RolesPermissions from '../pages/Users/RolesPermissions';

// Health Pages
import HealthRecords from '../pages/Health/HealthRecords';
import HealthRecordDetail from '../pages/Health/HealthRecordDetail';

// Farm Analytics
import FarmAnalytics from '../pages/Farms/FarmAnalytics';

// System Pages
import AuditLogs from '../pages/System/AuditLogs';
import BackupRestore from '../pages/System/BackupRestore';

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

                    <Route path="/:farmId/animals/sick" element={
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
            <Route path="/:farmId/vets" element={
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

            <Route path="/:farmId/tasks/add" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <AddTask />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/:farmId/tasks" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <FarmTasks />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/:farmId/tasks/:taskId" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <TaskView />
                    </FarmProvider>
                </ProtectedRoutes>
            } />

            <Route path="/:farmId/tasks/:taskId/edit" element={
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
                
                <Route path="/animals/all" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <AllAnimals />
                    </>
                </ProtectedRoutes>} />
                
                <Route path="/revenue" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <Revenue />
                    </>
                </ProtectedRoutes>} />
                
                <Route path="/expenses" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <Expenses />
                    </>
                </ProtectedRoutes>} />
                
                <Route path="/financial-overview" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <FinancialOverview />
                    </>
                </ProtectedRoutes>} />
                
                <Route path="/:animalId/milk-production" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <MilkProduction />
                    </>
                </ProtectedRoutes>} />
                
            <Route path="/chatbot" element={
                <ProtectedRoutes>
                    <>                       
                    <Navigation />
                   <Chatbot />
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
            <Route path='/:farmId/livestock/add' element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <AddAnimal />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path='/:farmId/livestock/:animalId' element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <AnimalView />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path='/:farmId/livestock/:animalId/edit' element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <UpdateAnimal />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path='/:farmId/livestock/:animalId/vaccinate' element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <Vaccinate />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path='/:farmId/livestock/:animalId/schedule-vaccination' element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <ScheduleVaccination />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path='/:farmId/livestock' element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <AnimalList />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path="/farms/:farmId/feed-schedules" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <FeedSchedules />
                    </FarmProvider>
                </ProtectedRoutes>
            } />
            <Route path="/farms/:farmId/feed-schedule/create" element={
                <ProtectedRoutes>
                    <FarmProvider>
                        <Navigation />
                        <CreateFeedSchedule />
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
            
            <Route path="/vaccinations" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <VaccinationCases />
                    </>
                </ProtectedRoutes>
            } />

            {/* User Management Routes */}
            <Route path="/users" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <AllUsers />
                    </>
                </ProtectedRoutes>
            } />
            <Route path="/users/add" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <AddUser />
                    </>
                </ProtectedRoutes>
            } />
            <Route path="/users/roles" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <RolesPermissions />
                    </>
                </ProtectedRoutes>
            } />

            {/* Health & Treatment Routes */}
            <Route path="/health" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <HealthRecords />
                    </>
                </ProtectedRoutes>
            } />
            <Route path="/health/:id" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <HealthRecordDetail />
                    </>
                </ProtectedRoutes>
            } />
            <Route path="/livestock/all" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <AllAnimals />
                    </>
                </ProtectedRoutes>
            } />

            {/* Farm Analytics Routes */}
            <Route path="/farms/analytics" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <FarmAnalytics />
                    </>
                </ProtectedRoutes>
            } />
            <Route path="/farms/:farmId/analytics" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <FarmAnalytics />
                    </>
                </ProtectedRoutes>
            } />

            {/* System Routes */}
            <Route path="/audit-logs" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <AuditLogs />
                    </>
                </ProtectedRoutes>
            } />

            {/* Loan Routes */}
            <Route path="/loan-applications" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <LoanApplications />
                    </>
                </ProtectedRoutes>
            } />
            <Route path="/approved-loans" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <ApprovedLoans />
                    </>
                </ProtectedRoutes>
            } />
            <Route path="/reports" element={
                <ProtectedRoutes>
                    <>
                        <Navigation />
                        <LoanReports />
                    </>
                </ProtectedRoutes>
            } />

            {/* Catch all invalid routes */}
            <Route path="*" element={<NotFound />} />
        </Routes>
        </NetworkHandler>
        </AuthProvider>
    );
};

export default AppRoutes;