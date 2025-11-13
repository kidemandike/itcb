// TeacherDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
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
} from "@mui/material";
import { Sidebar, Header, TeacherCourseCard } from "./UIComponents";
import api from "../api";
import BookConferenceRoom from "./BookConferenceRoom";

// ---------------- Course Creation Form ----------------
const CourseCreationForm = ({ user, accessToken, onCourseCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    course_id: "",
    course_name: "",
    course_price: "",
    course_duration: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.course_id.trim()) {
      newErrors.course_id = "Course ID is required";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.course_id)) {
      newErrors.course_id =
        "Course ID can only contain letters, numbers, hyphens, and underscores";
    }
    if (!formData.course_name.trim()) newErrors.course_name = "Course name is required";
    if (!formData.course_price) {
      newErrors.course_price = "Course price is required";
    } else if (isNaN(formData.course_price) || parseFloat(formData.course_price) <= 0) {
      newErrors.course_price = "Course price must be a positive number";
    }
    if (!formData.course_duration.trim())
      newErrors.course_duration = "Course duration is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const courseData = {
        course_id: formData.course_id.trim(),
        course_name: formData.course_name.trim(),
        course_price: parseFloat(formData.course_price),
        course_duration: formData.course_duration.trim(),
        instructor_id: user.id,
        instructor_name: user.full_name,
      };
      await api.createCourse(accessToken, courseData);
      alert("Course created successfully!");
      onCourseCreated();
    } catch (error) {
      console.error("Failed to create course:", error);
      alert("Error creating course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: "auto" }}>
      <CardContent>
        <Typography variant="h5" color="primary" gutterBottom>
          Create New Course
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Course ID"
            name="course_id"
            value={formData.course_id}
            onChange={handleInputChange}
            error={!!errors.course_id}
            helperText={errors.course_id}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Course Name"
            name="course_name"
            value={formData.course_name}
            onChange={handleInputChange}
            error={!!errors.course_name}
            helperText={errors.course_name}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Course Price (Tsh)"
            name="course_price"
            type="number"
            value={formData.course_price}
            onChange={handleInputChange}
            error={!!errors.course_price}
            helperText={errors.course_price}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Course Duration"
            name="course_duration"
            value={formData.course_duration}
            onChange={handleInputChange}
            error={!!errors.course_duration}
            helperText={errors.course_duration}
            fullWidth
            margin="normal"
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1">Instructor Information</Typography>
            <Typography variant="body2">Name: {user.full_name}</Typography>
            <Typography variant="body2">Email: {user.email}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : "Create Course"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={onCancel}
              disabled={loading}
              fullWidth
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// ---------------- Student Table ----------------
const TeacherStudentTable = ({ registrations }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  if (!registrations || registrations.length === 0) {
    return (
      <Box textAlign="center" py={5}>
        <Typography variant="h6" color="textSecondary">
          No students registered yet.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {[
              "Student Name",
              "Email",
              "Registration Date",
              "Schedule",
              "Level",
              "Payment Status",
            ].map((head) => (
              <TableCell key={head}>{head}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {registrations.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.user_name || "N/A"}</TableCell>
              <TableCell>{r.user_email || "N/A"}</TableCell>
              <TableCell>{formatDate(r.registration_date)}</TableCell>
              <TableCell>{r.selected_schedule}</TableCell>
              <TableCell>{r.selected_level}</TableCell>
              <TableCell>
                <Chip
                  label={r.payment_status}
                  color={
                    r.payment_status === "Paid"
                      ? "success"
                      : r.payment_status === "Pending"
                      ? "warning"
                      : "error"
                  }
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// ---------------- Teacher Dashboard ----------------
const TeacherDashboard = ({ user, accessToken, onLogout }) => {
  const [activeTab, setActiveTab] = useState("myCourses");
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.getTeacherCourses(accessToken);
        setCourses(Array.isArray(res) ? res : []);
      } catch {
        alert("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [accessToken]);

  const handleViewRegistrations = async (courseId) => {
    setLoadingRegistrations(true);
    try {
      const res = await api.getTeacherCourseRegistrations(accessToken, courseId);
      setRegistrations(Array.isArray(res) ? res : []);
      setSelectedCourse(courses.find((c) => c.id === courseId));
      setActiveTab("registrations");
    } catch {
      alert("Failed to load registrations");
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleCourseCreated = () => {
    setActiveTab("myCourses");
    setLoading(true);
    api.getTeacherCourses(accessToken).then((res) => {
      setCourses(Array.isArray(res) ? res : []);
      setLoading(false);
    });
  };

  const sidebarLinks = [
    { name: "My Courses", id: "myCourses" },
    { name: "Student Registrations", id: "registrations" },
    { name: "Book Conference Room", id: "conference-rooms" },
  ];

  const renderContent = () => {
    if (loading && activeTab !== "createCourse") {
      return <CircularProgress />;
    }
    switch (activeTab) {
      case "myCourses":
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h5">My Courses</Typography>
              <Button
                variant="contained"
                onClick={() => setActiveTab("createCourse")}
              >
                Create New Course
              </Button>
            </Box>
            <Grid container spacing={2}>
              {courses.length > 0 ? (
                courses.map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course.id}>
                    <TeacherCourseCard
                      course={course}
                      onViewRegistrations={() => handleViewRegistrations(course.id)}
                      showCourseName
                    />
                  </Grid>
                ))
              ) : (
                <Typography>No courses yet.</Typography>
              )}
            </Grid>
          </Box>
        );
      case "createCourse":
        return (
          <CourseCreationForm
            user={user}
            accessToken={accessToken}
            onCourseCreated={handleCourseCreated}
            onCancel={() => setActiveTab("myCourses")}
          />
        );
      case "registrations":
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6">
                Students for: {selectedCourse?.course_name}
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setActiveTab("myCourses")}
              >
                Back to Courses
              </Button>
            </Box>
            {loadingRegistrations ? (
              <CircularProgress />
            ) : (
              <TeacherStudentTable registrations={registrations} />
            )}
          </Box>
        );
      case "conference-rooms":
        return (
          <Box>
            <Typography variant="h5" gutterBottom>
              Conference Room Booking
            </Typography>
            <BookConferenceRoom accessToken={accessToken} />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box display="flex" minHeight="100vh" bgcolor="grey.100">
      <Sidebar
        links={sidebarLinks}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <Box flex={1} p={3}>
        <Header user={user} onLogout={onLogout} />
        <Divider sx={{ my: 2 }} />
        {renderContent()}
      </Box>
    </Box>
  );
};

export default TeacherDashboard;
