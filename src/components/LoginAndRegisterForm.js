import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  Paper,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";

// MUI Modal (Dialog) to replace browser alerts
const Modal = ({ message, onClose, severity = "info" }) => {
  const displayMessage = typeof message === 'string' ? message : 
                        message?.message || 
                        message?.msg || 
                        'An error occurred';
  
  return (
    <Dialog open={!!message} onClose={onClose}>
      <DialogTitle>Notification</DialogTitle>
      <DialogContent>
        <Alert severity={severity} sx={{ mb: 2 }}>
          {displayMessage}
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Forgot Password Modal Component
const ForgotPasswordModal = ({ open, onClose, onResetPassword }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error state
    setError("");
    
    // Validate email
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    
    try {
      await onResetPassword(email);
      setEmail("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reset Password</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter your email address and we'll send you a link to reset your password.
        </DialogContentText>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          autoFocus
          margin="dense"
          label="Email Address"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          error={!!error}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || !email.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Password Reset Service (you can move this to a separate service file)
const passwordResetService = {
  // Simulate API call to send reset email
  async sendResetEmail(email) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate different scenarios
        const random = Math.random();
        
        if (random > 0.8) {
          // 20% chance of "network error"
          reject(new Error("Network error. Please try again."));
        } else if (random > 0.6) {
          // 20% chance of "user not found"
          reject(new Error("No account found with this email address."));
        } else {
          // 60% chance of success
          resolve({ 
            success: true, 
            message: "Reset link sent successfully" 
          });
        }
      }, 2000); // Simulate network delay
    });
  },

  // Validate reset token (for when user clicks the link)
  async validateResetToken(token) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (token && token.length > 10) {
          resolve({ valid: true });
        } else {
          reject(new Error("Invalid or expired reset token"));
        }
      }, 1000);
    });
  },

  // Reset password with token
  async resetPassword(token, newPassword) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (token && newPassword && newPassword.length >= 6) {
          resolve({ success: true, message: "Password reset successfully" });
        } else {
          reject(new Error("Invalid token or password too short"));
        }
      }, 1500);
    });
  }
};

// Login and Registration Form component
const LoginAndRegisterForm = ({
  isRegistering,
  setIsRegistering,
  handleLogin,
  handleRegister,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [modalMessage, setModalMessage] = useState("");
  const [modalSeverity, setModalSeverity] = useState("info");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showModal = (message, severity = "info") => {
    setModalMessage(message);
    setModalSeverity(severity);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    handleLogin(formData.email, formData.password);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showModal("Passwords do not match.", "error");
      return;
    }
    const userToRegister = {
      ...formData,
      full_name: `${formData.firstName} ${formData.lastName}`.trim(),
    };
    delete userToRegister.confirmPassword;
    handleRegister(userToRegister);
    showModal("Registration successful! Please log in.", "success");
    setIsRegistering(false);
  };

  // Enhanced password reset handler
  const handleResetPassword = async (email) => {
    try {
      const result = await passwordResetService.sendResetEmail(email);
      showModal(
        `Password reset link has been sent to ${email}. Please check your inbox and spam folder.`,
        "success"
      );
      
      // Optional: Log for debugging
      console.log("Password reset successful:", result);
      
    } catch (error) {
      showModal(error.message, "error");
      console.error("Password reset failed:", error);
    }
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setForgotPasswordOpen(true);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        backgroundImage: `url('/admin-logo.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <Modal 
        message={modalMessage} 
        onClose={() => setModalMessage("")} 
        severity={modalSeverity}
      />
      
      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        onResetPassword={handleResetPassword}
      />

      <Paper
        elevation={6}
        sx={{
          p: 4,
          maxWidth: 400,
          width: "100%",
          borderTop: "6px solid #003366",
          borderRadius: 3,
          backdropFilter: "blur(4px)",
          bgcolor: "rgba(255,255,255,0.95)",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          fontWeight="bold"
          color="#003366"
          gutterBottom
        >
          {isRegistering ? "Create Your Account" : "Welcome Back"}
        </Typography>

        {isRegistering ? (
          <Box component="form" onSubmit={handleRegisterSubmit} noValidate>
            <TextField
              fullWidth
              margin="normal"
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, bgcolor: "#003366", "&:hover": { bgcolor: "#002244" } }}
            >
              Register
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleLoginSubmit} noValidate>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Box textAlign="right" mt={1}>
              <Link
                component="button"
                variant="body2"
                color="primary"
                onClick={handleForgotPasswordClick}
                type="button"
              >
                Forgot Password?
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="success"
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          </Box>
        )}

        <Box textAlign="center" mt={3}>
          <Link
            component="button"
            variant="body2"
            onClick={() => setIsRegistering(!isRegistering)}
            sx={{ fontWeight: "medium", color: "#003366" }}
            type="button"
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Need an account? Register"}
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginAndRegisterForm;