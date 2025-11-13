// components/UIComponents.js - Main export file
export { Sidebar, MobileSidebar } from './Layout/Sidebar';
export { Header } from './Layout/Header';
export { MainLayout } from './Layout/MainLayout';
export { InputField } from './Forms/InputField';
export { SelectField } from './Forms/SelectField';
export { CertificateApplicationCard } from './Forms/CertificateApplicationCard';
export { CourseCard } from './cards/CourseCard';
export { TeacherCourseCard } from './cards/TeacherCourseCard';
export { StudentStatusCard } from './cards/StudentStatusCard';
export { UserCard } from './cards/UserCard';
export { UserTable } from './tables/UserTable';
export { StudentTable } from './tables/StudentTable';
export { CertificateManagementTable } from './tables/CertificateManagementTable';
export { LoadingSpinner } from './utils/LoadingSpinner';
export { EmptyState } from './utils/EmptyState';
export { StatusBadge } from './utils/StatusBadge';

// Default export for backward compatibility
import { Sidebar, MobileSidebar } from './Layout/Sidebar';
import { Header } from './Layout/Header';
import { MainLayout } from './Layout/MainLayout';
import { InputField } from './Forms/InputField';
import { SelectField } from './Forms/SelectField';
import { CertificateApplicationCard } from './Forms/CertificateApplicationCard';
import { CourseCard } from './cards/CourseCard';
import { TeacherCourseCard } from './cards/TeacherCourseCard';
import { StudentStatusCard } from './cards/StudentStatusCard';
import { UserCard } from './cards/UserCard';
import { UserTable } from './tables/UserTable';
import { StudentTable } from './tables/StudentTable';
import { CertificateManagementTable } from './tables/CertificateManagementTable';
import { LoadingSpinner } from './utils/LoadingSpinner';
import { EmptyState } from "./utils/EmptyState";
import { StatusBadge } from "./utils/StatusBadge";

export default {
  Sidebar,
  MobileSidebar,
  Header,
  MainLayout,
  InputField,
  SelectField,
  CourseCard,
  TeacherCourseCard,
  StudentStatusCard,
  UserCard,
  UserTable,
  StudentTable,
  LoadingSpinner,
  EmptyState,
  StatusBadge,
  CertificateApplicationCard,
  CertificateManagementTable
};