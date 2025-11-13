import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Grid,
  Divider,
  Alert,
} from "@mui/material";
import { Sidebar, Header } from '../UIComponents';
import api from '../../api';

// ---------------- Participants Table ----------------
const ICEParticipantsTable = ({ participants, onIssueCertificate, loading }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  if (!participants || participants.length === 0) {
    return (
      <Box textAlign="center" py={5}>
        <Typography variant="h6" color="textSecondary">
          No participants found for short courses.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Participant Name</TableCell>
            <TableCell>Course</TableCell>
            <TableCell>Enrollment Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Certificate</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {participants.map((participant) => (
            <TableRow key={participant.id}>
              <TableCell>
                {participant.student_name || `${participant.first_name} ${participant.last_name}`}
              </TableCell>
              <TableCell>{participant.course_name || participant.course_title}</TableCell>
              <TableCell>{formatDate(participant.registration_date || participant.created_at)}</TableCell>
              <TableCell>
                <Chip
                  label={participant.status}
                  color={
                    participant.status === "completed"
                      ? "success"
                      : participant.status === "in_progress"
                      ? "primary"
                      : "warning"
                  }
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={participant.certificate_issued ? "Issued" : "Not Issued"}
                  color={participant.certificate_issued ? "success" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {participant.status === "completed" && !participant.certificate_issued && (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => onIssueCertificate(participant.id)}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : "Issue Certificate"}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ---------------- ICE Dashboard ----------------
const ICEDashboard = ({ 
  user, 
  accessToken, 
  onLogout, 
  activeTab, 
  setActiveTab,
  showSnackbar,
  dashboardTitle,
  userRole,
  courses,
  enrollments,
  conferenceRooms,
  roomBookings
}) => {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [shortCourses, setShortCourses] = useState([]);
  const [iceRegistrations, setIceRegistrations] = useState([]);

  const sidebarLinks = [
    { name: "Dashboard", id: "dashboard" },
    { name: "Short Courses", id: "short-courses" },
    { name: "Participants", id: "participants" },
    { name: "Certificates", id: "certificates" },
    { name: "Reports", id: "reports" },
  ];

  useEffect(() => {
    // Filter short courses from all courses
    const shortCoursesList = courses.filter(course => 
      course.department === 'ICE' || 
      course.type === 'short_course' ||
      course.title?.includes('Short Course') ||
      course.course_name?.includes('Short Course')
    );
    setShortCourses(shortCoursesList);

    // Filter ICE department registrations
    const iceEnrollments = enrollments.filter(enrollment =>
      enrollment.course_department === 'ICE' ||
      enrollment.department === 'ICE'
    );
    setIceRegistrations(iceEnrollments);
  }, [courses, enrollments]);

  const handleIssueCertificate = async (registrationId) => {
    setActionLoading(true);
    try {
      await api.issueCertificate(accessToken, registrationId);
      showSnackbar('Certificate issued successfully!', 'success');
      window.location.reload();
    } catch (error) {
      console.error('Failed to issue certificate:', error);
      showSnackbar('Failed to issue certificate', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              ICE Department Overview
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={3}>
                <Card sx={{ bgcolor: 'secondary.light', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h4" component="div">
                      {shortCourses.length}
                    </Typography>
                    <Typography variant="h6">
                      Active Short Courses
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h4" component="div">
                      {iceRegistrations.length}
                    </Typography>
                    <Typography variant="h6">
                      Total Participants
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h4" component="div">
                      {iceRegistrations.filter(r => r.certificate_issued).length}
                    </Typography>
                    <Typography variant="h6">
                      Certificates Issued
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h4" component="div">
                      {iceRegistrations.filter(r => !r.certificate_issued && r.status === 'completed').length}
                    </Typography>
                    <Typography variant="h6">
                      Pending Certificates
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Course Completions
                </Typography>
                {iceRegistrations.filter(r => r.status === 'completed').length === 0 ? (
                  <EmptyState 
                    title="No Completed Courses"
                    description="Course completions will appear here when participants finish their courses."
                  />
                ) : (
                  <ICEParticipantsTable
                    participants={iceRegistrations.filter(r => r.status === 'completed').slice(0, 5)}
                    onIssueCertificate={handleIssueCertificate}
                    loading={actionLoading}
                  />
                )}
              </CardContent>
            </Card>
          </Box>
        );

      case "short-courses":
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Short Courses Management</Typography>
              <Button variant="contained" color="primary">
                Create New Course
              </Button>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : shortCourses.length === 0 ? (
              <EmptyState 
                title="No Short Courses"
                description="No short courses are currently available."
                action={
                  <Button variant="contained" color="primary">
                    Create New Course
                  </Button>
                }
              />
            ) : (
              <Grid container spacing={3}>
                {shortCourses.map(course => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <DepartmentCourseCard
                      course={course}
                      userRole={userRole}
                      onAction={() => showSnackbar(`Managing ${course.title}`, 'info')}
                      actionText="Manage Course"
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case "participants":
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Course Participants
            </Typography>
            
            {iceRegistrations.length === 0 ? (
              <EmptyState 
                title="No Participants"
                description="No participants found for short courses."
              />
            ) : (
              <ICEParticipantsTable
                participants={iceRegistrations}
                onIssueCertificate={handleIssueCertificate}
                loading={actionLoading}
              />
            )}
          </Box>
        );

      case "certificates":
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Certificate Management
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Certificate Statistics
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography>
                        Total Certificates Issued: <strong>
                          {iceRegistrations.filter(r => r.certificate_issued).length}
                        </strong>
                      </Typography>
                      <Typography>
                        Pending Issuance: <strong>
                          {iceRegistrations.filter(r => !r.certificate_issued && r.status === 'completed').length}
                        </strong>
                      </Typography>
                      <Typography>
                        Certificate Rate: <strong>
                          {iceRegistrations.length > 0 ? 
                            Math.round((iceRegistrations.filter(r => r.certificate_issued).length / iceRegistrations.length) * 100) : 0
                          }%
                        </strong>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button variant="contained" color="secondary">
                        Generate Certificate Batch
                      </Button>
                      <Button variant="contained" color="success">
                        Export Certificate Data
                      </Button>
                      <Button variant="contained" color="warning">
                        View Certificate Analytics
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case "reports":
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              ICE Department Reports
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Course Analytics
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography>Most Popular Course: <strong>Professional Development</strong></Typography>
                      <Typography>Average Completion Time: <strong>3 weeks</strong></Typography>
                      <Typography>Student Satisfaction: <strong>94%</strong></Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Financial Overview
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography>Total Revenue: <strong>Tsh 12,500,000</strong></Typography>
                      <Typography>Courses This Month: <strong>8</strong></Typography>
                      <Typography>Projected Growth: <strong>+15%</strong></Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return (
          <Alert severity="info">
            Please select a section from the sidebar.
          </Alert>
        );
    }
  };

  return (
    <Box display="flex" minHeight="100vh" bgcolor="grey.100">
      <Sidebar
        links={sidebarLinks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
      />
      <Box flex={1} p={3}>
        <Header 
          user={user} 
          onLogout={onLogout} 
          title={dashboardTitle}
          userRole={userRole}
        />
        <Divider sx={{ my: 2 }} />
        {renderContent()}
      </Box>
    </Box>
  );
};

export default ICEDashboard;