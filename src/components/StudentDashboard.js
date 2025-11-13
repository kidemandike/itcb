import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Tabs,
    Tab,
    Grid,
    Alert,
} from '@mui/material';

// Assuming these imports are correctly set up in your project
import { Sidebar, Header } from './UIComponents';
import api from '../api'; 
import BookConferenceRoom from './BookConferenceRoom'; 
import CertificateRequestForm from './LanguageStudies/CertificateRequestForm'; 
import StudentCertificateProgress from './LanguageStudies/StudentCertificateProgress';
import { DrivingApplicationForm } from './Driving/DrivingApplicationForm'; // Import the driving application form

// --- Shared Components (Kept for completeness) ---

const CourseCard = ({ course, onAction, actionText, courseType = "regular" }) => (
    <Card sx={{ 
        boxShadow: 3, 
        borderRadius: 2, 
        '&:hover': { transform: 'scale(1.02)', transition: '0.3s' },
        border: courseType === "driving" ? '2px solid #8B0000' : 'none'
    }}>
        <CardContent>
            <Typography variant="h6" color={courseType === "driving" ? "error" : "primary"} gutterBottom>
                {course.course_name}
                {courseType === "driving" && (
                    <Chip label="Driving" color="error" size="small" sx={{ ml: 1 }} />
                )}
            </Typography>
            <Typography variant="body2" color="textSecondary">
                Instructor: {course.instructor_name || 'TBA'}
            </Typography>
            <Typography variant="body2">Duration: {course.course_duration}</Typography>
            <Typography variant="subtitle1" fontWeight="bold">
                Price: Tsh{course.course_price}
            </Typography>
            {courseType === "driving" && course.course_type && (
                <Typography variant="body2" color="textSecondary">
                    Type: {course.course_type}
                </Typography>
            )}
        </CardContent>
        <CardActions>
            <Button 
                fullWidth 
                variant="contained" 
                color={courseType === "driving" ? "error" : "primary"} 
                onClick={onAction}
            >
                {actionText}
            </Button>
        </CardActions>
    </Card>
);

// Course Registration Modal
const CourseRegistrationModal = ({ course, user, onClose, onRegister, isLoading }) => {
    const [formData, setFormData] = useState({ selected_schedule: '', selected_level: 'Beginner' });

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.selected_schedule.trim() || !formData.selected_level.trim()) {
            alert('Please select schedule and level');
            return;
        }
        
        onRegister({
            course_id: course.id.toString(), 
            course_name: course.course_name,
            course_price: course.course_price.toString(), 
            course_duration: course.course_duration,
            instructor_name: course.instructor_name,
            selected_schedule: formData.selected_schedule,
            selected_level: formData.selected_level,
        });
    };

    const scheduleOptions = [
        'Monday & Wednesday 6-8 PM',
        'Tuesday & Thursday 7-9 PM',
        'Saturday 10 AM - 12 PM',
        'Sunday 2-4 PM',
        'Monday to Friday 5-6 PM',
        'Weekend Intensive',
    ];

    const levelOptions = ['Beginner', 'Intermediate', 'Advanced'];

    return (
        <Dialog open={!!course} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Register for Course</DialogTitle>
            <DialogContent dividers>
                <Typography variant="h6">{course.course_name}</Typography>
                <Typography variant="body2" color="textSecondary">
                    Instructor: {course.instructor_name || 'TBA'}
                </Typography>
                <Typography variant="body2">Duration: {course.course_duration}</Typography>
                <Typography variant="body2" gutterBottom>
                    Price: Tsh{course.course_price}
                </Typography>

                <Box component="form" onSubmit={handleSubmit} mt={2}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Preferred Schedule</InputLabel>
                        <Select
                            name="selected_schedule"
                            value={formData.selected_schedule}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                        >
                            {scheduleOptions.map((schedule) => (
                                <MenuItem key={schedule} value={schedule}>
                                    {schedule}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Your Level</InputLabel>
                        <Select
                            name="selected_level"
                            value={formData.selected_level}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                        >
                            {levelOptions.map((level) => (
                                <MenuItem key={level} value={level}>
                                    {level}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box mt={2} p={2} bgcolor="grey.100" borderRadius={2}>
                        <Typography variant="subtitle2">Your Information</Typography>
                        <Typography variant="body2">Name: {user.full_name}</Typography>
                        <Typography variant="body2">Email: {user.email}</Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit" disabled={isLoading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                >
                    {isLoading ? <CircularProgress size={24} /> : 'Register Now'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Certificate Type Selection Component
const CertificateTypeSelector = ({ onCertificateTypeChange }) => {
    const [certificateType, setCertificateType] = useState('');

    const handleChange = (event) => {
        const type = event.target.value;
        setCertificateType(type);
        onCertificateTypeChange(type);
    };

    return (
        <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Certificate Type</InputLabel>
            <Select
                value={certificateType}
                onChange={handleChange}
                label="Select Certificate Type"
            >
                <MenuItem value="">
                    <em>Select certificate type</em>
                </MenuItem>
                <MenuItem value="language">English Language Proficiency Certificate</MenuItem>
                <MenuItem value="driving">Driving Course Completion Certificate</MenuItem>
            </Select>
        </FormControl>
    );
};

// --- Main Student Dashboard Component ---
const StudentDashboard = ({ user, accessToken, onLogout }) => {
    const [activeTab, setActiveTab] = useState('allCourses');
    const [courses, setCourses] = useState([]);
    const [drivingCourses, setDrivingCourses] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [myDrivingApplications, setMyDrivingApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingDrivingCourses, setLoadingDrivingCourses] = useState(false);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);
    const [selectedCourseForRegistration, setSelectedCourseForRegistration] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isSubmittingCert, setIsSubmittingCert] = useState(false);
    const [certificateType, setCertificateType] = useState('');
    const [courseTab, setCourseTab] = useState(0); // 0 for regular, 1 for driving

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const result = await api.getAllCourses(accessToken);
            setCourses(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDrivingCourses = async () => {
        setLoadingDrivingCourses(true);
        try {
            const result = await api.getAvailableDrivingCourses(accessToken);
            setDrivingCourses(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error("Error fetching driving courses:", err);
        } finally {
            setLoadingDrivingCourses(false);
        }
    };

    const fetchMyRegistrations = async () => {
        if (!user?.id) return;
        setLoadingRegistrations(true);
        try {
            const result = await api.getMyRegistrations(accessToken, user.id);
            setMyRegistrations(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingRegistrations(false);
        }
    };

    const fetchMyDrivingApplications = async () => {
        try {
            const result = await api.getMyDrivingApplications(accessToken);
            setMyDrivingApplications(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error("Error fetching driving applications:", err);
        }
    };

    useEffect(() => {
        if (user && accessToken) {
            fetchCourses();
            fetchDrivingCourses();
            fetchMyRegistrations();
            fetchMyDrivingApplications();
        }
    }, [user, accessToken]);

    const handleRegisterForCourse = async (registrationData) => {
        setIsRegistering(true);
        try {
            const result = await api.registerForCourse(accessToken, registrationData);
            if (result?.id) {
                fetchMyRegistrations();
                setSelectedCourseForRegistration(null);
                alert('Course registration submitted successfully!');
            } else if (result?.message) {
                alert(result.message);
            }
        } catch (err) {
            alert(`Registration Failed: ${err.message || 'Check console for details.'}`);
            console.error("Register for Course API Error:", err);
        } finally {
            setIsRegistering(false);
        }
    };

    const handleApplyForDrivingCourse = async (applicationData) => {
        setIsRegistering(true);
        try {
            const result = await api.applyForDrivingCourse(accessToken, applicationData);
            if (result?.id) {
                fetchMyDrivingApplications();
                alert('Driving course application submitted successfully!');
            } else {
                alert('Application submitted, but received an unexpected response.');
            }
        } catch (err) {
            alert(`Application Failed: ${err.message || 'Check console for details.'}`);
            console.error("Driving Course Application Error:", err);
        } finally {
            setIsRegistering(false);
        }
    };

    // Handler function for Certificate Request Submission
    const handleSubmitCertificateRequest = async (formData, resetForm) => {
        if (!certificateType) {
            alert('Please select a certificate type first.');
            return;
        }

        setIsSubmittingCert(true);
        try {
            if (certificateType === 'language') {
                // Language certificate application
                const applicationData = {
                    ...formData,
                    user_id: user.id.toString(),
                    user_email: user.email,
                    user_full_name: user.full_name,
                };

                const result = await api.submitCertificateApplication(accessToken, applicationData);

                if (result?.id) {
                    alert("Language certificate application submitted successfully! Check the 'Certificate Progress' tab for updates.");
                    if (resetForm) resetForm();
                    setCertificateType('');
                } else {
                    alert('Application submitted, but received an unexpected response.');
                }
            } else if (certificateType === 'driving') {
                // Driving certificate request
                // Find the completed driving application
                const completedApplication = myDrivingApplications.find(app => 
                    app.course_status === 'Completed' && !app.certificate_requested
                );

                if (!completedApplication) {
                    alert('No completed driving course found or certificate already requested.');
                    return;
                }

                const result = await api.requestDrivingCertificate(accessToken, completedApplication.id);
                
                if (result?.id) {
                    alert("Driving certificate request submitted successfully! Check the 'Certificate Progress' tab for updates.");
                    fetchMyDrivingApplications();
                    if (resetForm) resetForm();
                    setCertificateType('');
                } else {
                    alert('Certificate request submitted, but received an unexpected response.');
                }
            }
        } catch (err) {
            alert(`Application Submission Failed: ${err.message || 'Network error or server issue.'}`);
            console.error("Certificate Application API Error:", err);
        } finally {
            setIsSubmittingCert(false);
        }
    };

    const handleCertificateTypeChange = (type) => {
        setCertificateType(type);
    };

    return (
        <Box display="flex" minHeight="100vh" bgcolor="grey.100">
            <Sidebar
                links={[
                    { name: 'Available Courses', id: 'allCourses' },
                    { name: 'My Registrations', id: 'myRegistrations' },
                    { name: 'Request Certificate', id: 'certificateRequest' },
                    { name: 'Certificate Progress', id: 'certificateProgress' },
                    { name: 'Book Conference Room', id: 'conference-rooms' },
                ]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <Box flex={1} p={3}>
                <Header user={user} onLogout={onLogout}/>

                {activeTab === 'allCourses' && (
                    <Box>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            All Available Courses
                        </Typography>
                        
                        {/* Tabs for Regular vs Driving Courses */}
                        <Tabs value={courseTab} onChange={(e, newValue) => setCourseTab(newValue)} sx={{ mb: 3 }}>
                            <Tab label="Regular Courses" />
                            <Tab label="Driving Courses" />
                        </Tabs>

                        {courseTab === 0 && (
                            <>
                                {loading ? (
                                    <CircularProgress />
                                ) : courses.length > 0 ? (
                                    <Grid container spacing={2}>
                                        {courses.map((c) => (
                                            <Grid item xs={12} sm={6} md={4} key={c.course_id}>
                                                <CourseCard
                                                    course={c}
                                                    onAction={() => setSelectedCourseForRegistration(c)}
                                                    actionText="Register"
                                                    courseType="regular"
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Typography>No regular courses available.</Typography>
                                )}
                            </>
                        )}

                        {courseTab === 1 && (
                            <>
                                {loadingDrivingCourses ? (
                                    <CircularProgress />
                                ) : drivingCourses.length > 0 ? (
                                    <Box>
                                        <Alert severity="info" sx={{ mb: 2 }}>
                                            Apply for driving courses offered by the Engineering Department. 
                                            Applications are approved quarterly by the Head of Department.
                                        </Alert>
                                        <Grid container spacing={2}>
                                            {drivingCourses.map((course) => (
                                                <Grid item xs={12} sm={6} md={4} key={course.id}>
                                                    <CourseCard
                                                        course={course}
                                                        onAction={() => {
                                                            // For driving courses, show the driving application form
                                                            setSelectedCourseForRegistration(course);
                                                        }}
                                                        actionText="Apply Now"
                                                        courseType="driving"
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                ) : (
                                    <Typography>No driving courses available at the moment.</Typography>
                                )}
                            </>
                        )}
                    </Box>
                )}

                {activeTab === 'myRegistrations' && (
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" color="primary" gutterBottom>
                            My Course Registrations & Applications
                        </Typography>
                        
                        <Tabs value={courseTab} onChange={(e, newValue) => setCourseTab(newValue)} sx={{ mb: 3 }}>
                            <Tab label="Regular Courses" />
                            <Tab label="Driving Applications" />
                        </Tabs>

                        {courseTab === 0 && (
                            <>
                                {loadingRegistrations ? (
                                    <CircularProgress />
                                ) : myRegistrations.length > 0 ? (
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Course Name</TableCell>
                                                    <TableCell>Instructor</TableCell>
                                                    <TableCell>Schedule</TableCell>
                                                    <TableCell>Level</TableCell>
                                                    <TableCell>Price</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Control No.</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {myRegistrations.map((reg) => (
                                                    <TableRow key={reg.id}>
                                                        <TableCell>{reg.course_name}</TableCell>
                                                        <TableCell>{reg.instructor_name}</TableCell>
                                                        <TableCell>{reg.selected_schedule}</TableCell>
                                                        <TableCell>{reg.selected_level}</TableCell>
                                                        <TableCell>Tsh{reg.course_price}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={reg.payment_status}
                                                                color={
                                                                    reg.payment_status === 'Paid'
                                                                        ? 'success'
                                                                        : reg.payment_status === 'Pending'
                                                                        ? 'warning'
                                                                        : 'error'
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell>{reg.control_no || 'N/A'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography>No regular course registrations yet.</Typography>
                                )}
                            </>
                        )}

                        {courseTab === 1 && (
                            <>
                                {myDrivingApplications.length > 0 ? (
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Course Name</TableCell>
                                                    <TableCell>Course Type</TableCell>
                                                    <TableCell>Application Date</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Control No.</TableCell>
                                                    <TableCell>Certificate Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {myDrivingApplications.map((app) => (
                                                    <TableRow key={app.id}>
                                                        <TableCell>{app.course_name}</TableCell>
                                                        <TableCell>{app.course_type}</TableCell>
                                                        <TableCell>{new Date(app.application_date).toLocaleDateString()}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={app.course_status || 'Pending'}
                                                                color={
                                                                    app.course_status === 'Approved'
                                                                        ? 'success'
                                                                        : app.course_status === 'Completed'
                                                                        ? 'primary'
                                                                        : app.course_status === 'In Progress'
                                                                        ? 'info'
                                                                        : 'warning'
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell>{app.control_number || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            {app.certificate_issued ? (
                                                                <Chip label="Issued" color="success" size="small" />
                                                            ) : app.certificate_requested ? (
                                                                <Chip label="Pending" color="warning" size="small" />
                                                            ) : (
                                                                <Chip label="Not Requested" color="default" size="small" />
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography>No driving course applications yet.</Typography>
                                )}
                            </>
                        )}
                    </Paper>
                )}

                {activeTab === 'conference-rooms' && (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Conference Room Booking
                        </Typography>
                        <BookConferenceRoom accessToken={accessToken} />
                    </Box>
                )}
                
                {activeTab === 'certificateRequest' && (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Request Certificate
                        </Typography>
                        
                        <CertificateTypeSelector onCertificateTypeChange={handleCertificateTypeChange} />
                        
                        {certificateType === 'language' && (
                            <CertificateRequestForm 
                                user={user} 
                                accessToken={accessToken} 
                                onSubmit={handleSubmitCertificateRequest} 
                                isSubmitting={isSubmittingCert} 
                            />
                        )}
                        
                        {certificateType === 'driving' && (
                            <Box>
                                <Alert severity="info" sx={{ mb: 3 }}>
                                    <Typography variant="body1" fontWeight="bold">
                                        Driving Course Certificate Request
                                    </Typography>
                                    <Typography variant="body2">
                                        You can request a driving certificate only after completing a driving course. 
                                        The certificate costs Tsh 20,000 and requires administrative approval.
                                    </Typography>
                                </Alert>
                                
                                {myDrivingApplications.filter(app => app.course_status === 'Completed').length > 0 ? (
                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            Completed Driving Courses
                                        </Typography>
                                        <TableContainer component={Paper} sx={{ mb: 3 }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Course</TableCell>
                                                        <TableCell>Type</TableCell>
                                                        <TableCell>Completion Date</TableCell>
                                                        <TableCell>Certificate Status</TableCell>
                                                        <TableCell>Action</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {myDrivingApplications
                                                        .filter(app => app.course_status === 'Completed')
                                                        .map((app) => (
                                                            <TableRow key={app.id}>
                                                                <TableCell>{app.course_name}</TableCell>
                                                                <TableCell>{app.course_type}</TableCell>
                                                                <TableCell>
                                                                    {app.completion_date ? 
                                                                        new Date(app.completion_date).toLocaleDateString() : 
                                                                        'N/A'
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {app.certificate_issued ? (
                                                                        <Chip label="Issued" color="success" />
                                                                    ) : app.certificate_requested ? (
                                                                        <Chip label="Pending Approval" color="warning" />
                                                                    ) : (
                                                                        <Chip label="Not Requested" color="default" />
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {!app.certificate_requested && !app.certificate_issued && (
                                                                        <Button
                                                                            variant="contained"
                                                                            color="primary"
                                                                            onClick={() => handleSubmitCertificateRequest({}, null)}
                                                                            disabled={isSubmittingCert}
                                                                        >
                                                                            {isSubmittingCert ? 'Requesting...' : 'Request Certificate'}
                                                                        </Button>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                ) : (
                                    <Alert severity="warning">
                                        You don't have any completed driving courses yet. Complete a driving course first to request a certificate.
                                    </Alert>
                                )}
                            </Box>
                        )}
                        
                        {!certificateType && (
                            <Alert severity="info">
                                Please select a certificate type from the dropdown above to proceed.
                            </Alert>
                        )}
                    </Box>
                )}

                {activeTab === 'certificateProgress' && (
                    <StudentCertificateProgress 
                        accessToken={accessToken} 
                        user={user} 
                    />
                )}
            </Box>

            {/* Regular Course Registration Modal */}
            {selectedCourseForRegistration && courseTab === 0 && (
                <CourseRegistrationModal
                    course={selectedCourseForRegistration}
                    user={user}
                    onClose={() => setSelectedCourseForRegistration(null)}
                    onRegister={handleRegisterForCourse}
                    isLoading={isRegistering}
                />
            )}

            {/* Driving Course Application Modal */}
            {selectedCourseForRegistration && courseTab === 1 && (
                <Dialog open={!!selectedCourseForRegistration} onClose={() => setSelectedCourseForRegistration(null)} maxWidth="md" fullWidth>
                    <DialogTitle>Apply for Driving Course</DialogTitle>
                    <DialogContent>
                        <DrivingApplicationForm 
                            courses={[selectedCourseForRegistration]}
                            onApply={(applicationData) => {
                                handleApplyForDrivingCourse(applicationData);
                                setSelectedCourseForRegistration(null);
                            }}
                            loading={isRegistering}
                            currentUser={user}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </Box>
    );
};

export default StudentDashboard;