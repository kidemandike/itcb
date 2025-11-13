// In Driving/DrivingApplicationForm.js
import React, { useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    MenuItem,
    Alert,
} from "@mui/material";

export const DrivingApplicationForm = ({ courses, onApply, loading, currentUser }) => {
    // Pre-populate form with user data
    const [applicationData, setApplicationData] = useState({
        course_id: '',
        student_full_name: currentUser?.full_name || 
                          `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 
                          '',
        phone_number: currentUser?.phone_number || currentUser?.phone || '',
        course_type: ''
    });

    const handleChange = (field) => (event) => {
        setApplicationData({
            ...applicationData,
            [field]: event.target.value
        });
    };

    const handleSubmit = () => {
        if (applicationData.course_id && applicationData.student_full_name && applicationData.phone_number) {
            onApply(applicationData);
            // Reset form but keep user data pre-filled
            setApplicationData({
                course_id: '',
                student_full_name: currentUser?.full_name || 
                                  `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 
                                  '',
                phone_number: currentUser?.phone_number || currentUser?.phone || '',
                course_type: ''
            });
        }
    };

    const selectedCourse = courses.find(course => course.id === applicationData.course_id);

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Apply for Driving Course
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                    Fill in your details to apply for a driving course. After application, the head of department will approve all applications for the quarter.
                </Alert>

                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            select
                            label="Select Course"
                            value={applicationData.course_id}
                            onChange={handleChange('course_id')}
                            fullWidth
                            required
                        >   
                            {courses.map(course => (
                                <MenuItem key={course.id} value={course.id}>
                                    {course.course_name} - {course.course_type} ({formatDate(course.start_date)} to {formatDate(course.end_date)})
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Full Name"
                            value={applicationData.student_full_name}
                            onChange={handleChange('student_full_name')}
                            fullWidth
                            required
                            helperText="Pre-filled from your profile"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Phone Number"
                            value={applicationData.phone_number}
                            onChange={handleChange('phone_number')}
                            fullWidth
                            required
                            helperText="Pre-filled from your profile"
                        />
                    </Grid>
                    {selectedCourse && (
                        <Grid item xs={12}>
                            <Alert severity="success">
                                Selected: {selectedCourse.course_name} - {selectedCourse.duration} - Tsh {selectedCourse.price?.toLocaleString()}
                            </Alert>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={loading || !applicationData.course_id || !applicationData.student_full_name || !applicationData.phone_number}
                            fullWidth
                            size="large"
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
};