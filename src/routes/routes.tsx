import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import NotFound from '../components/Shared/NotFound';
import DashboardPage from '../views/DashboardPage';
import ProfilePage from '../views/Patient/ProfilePage';
import DocumentsPage from '../views/Patient/DocumentsPage';
import AccessPage from '../views/Patient/AccessPage';
import RecordsPage from '../views/Shared/RecordsPage';
import PrescriptionsPage from '../views/Shared/PrescriptionsPage';
import LabPage from '../views/Shared/LabPage';
import AuditPage from '../views/Shared/AuditPage';
import NotificationsPage from '../views/Shared/NotificationsPage';
import AdminPage from '../views/Admin/AdminPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}> 
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="access" element={<AccessPage />} />
        <Route path="records" element={<RecordsPage />} />
        <Route path="prescriptions" element={<PrescriptionsPage />} />
        <Route path="lab" element={<LabPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
