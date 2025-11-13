// components/Driving/CourseAnnouncementDialog.js
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';

const CourseAnnouncementDialog = ({ open, onClose, onAnnounce, loading }) => {
    const [courseData, setCourseData] = useState({
        course_name: '',
        course_type: 'Regular Vehicles',
        start_date: '',
        end_date: '',
        duration: '',
        price: '',
        quarter: '',
        year: new Date().getFullYear()
    });

    const courseTypes = [
        'Regular Vehicles',
        'Agricultural Machinery', 
        'Heavy Equipment'
    ];

    const quarters = [
        'Q1',
        'Q2',
        'Q3',
        'Q4'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

    const handleChange = (field) => (event) => {
        setCourseData({
            ...courseData,
            [field]: event.target.value
        });
    };

    const handleSubmit = () => {
    // Validate required fields
    if (!courseData.course_name || !courseData.start_date || !courseData.end_date || 
        !courseData.duration || !courseData.price || !courseData.quarter || !courseData.year) {
        alert('Please fill in all required fields');
        return;
    }

    // Convert dates to ISO format with time
    const startDate = new Date(courseData.start_date);
    const endDate = new Date(courseData.end_date);
    
    // Add time to the dates (set to beginning of day)
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const submitData = {
        ...courseData,
        price: parseInt(courseData.price),
        year: parseInt(courseData.year),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
    };

    console.log('Submitting course data:', submitData); // For debugging
    onAnnounce(submitData);
};

    const handleClose = () => {
        setCourseData({
            course_name: '',
            course_type: 'Regular Vehicles',
            start_date: '',
            end_date: '',
            duration: '',
            price: '',
            quarter: '',
            year: new Date().getFullYear()
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Announce New Driving Course</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Course Name"
                            value={courseData.course_name}
                            onChange={handleChange('course_name')}
                            required
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Course Type</InputLabel>
                            <Select
                                value={courseData.course_type}
                                onChange={handleChange('course_type')}
                                label="Course Type"
                            >
                                {courseTypes.map(type => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Duration (e.g., 3 months)"
                            value={courseData.duration}
                            onChange={handleChange('duration')}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            value={courseData.start_date}
                            onChange={handleChange('start_date')}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="End Date"
                            type="date"
                            value={courseData.end_date}
                            onChange={handleChange('end_date')}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Quarter</InputLabel>
                            <Select
                                value={courseData.quarter}
                                onChange={handleChange('quarter')}
                                label="Quarter"
                                required
                            >
                                {quarters.map(quarter => (
                                    <MenuItem key={quarter} value={quarter}>
                                        {quarter}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Year</InputLabel>
                            <Select
                                value={courseData.year}
                                onChange={handleChange('year')}
                                label="Year"
                                required
                            >
                                {years.map(year => (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Price (Tsh)"
                            type="number"
                            value={courseData.price}
                            onChange={handleChange('price')}
                            required
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    disabled={loading}
                >
                    {loading ? 'Announcing...' : 'Announce Course'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default CourseAnnouncementDialog;