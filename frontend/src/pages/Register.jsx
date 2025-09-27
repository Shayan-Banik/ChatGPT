import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  MessageSquare,
  Check,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // const validateForm = () => {
  //   const newErrors = {};

  //   if (!formData.firstName.trim()) {
  //     newErrors.firstName = 'First name is required';
  //   }

  //   if (!formData.lastName.trim()) {
  //     newErrors.lastName = 'Last name is required';
  //   }

  //   if (!formData.email) {
  //     newErrors.email = 'Email is required';
  //   } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
  //     newErrors.email = 'Please enter a valid email';
  //   }

  //   if (!formData.password) {
  //     newErrors.password = 'Password is required';
  //   } else if (formData.password.length < 8) {
  //     newErrors.password = 'Password must be at least 8 characters';
  //   } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
  //     newErrors.password = 'Password must contain uppercase, lowercase, and number';
  //   }

  //   if (!formData.confirmPassword) {
  //     newErrors.confirmPassword = 'Please confirm your password';
  //   } else if (formData.password !== formData.confirmPassword) {
  //     newErrors.confirmPassword = 'Passwords do not match';
  //   }

  //   if (!agreedToTerms) {
  //     newErrors.terms = 'You must agree to the terms and conditions';
  //   }

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  // const getPasswordStrength = () => {
  //   const password = formData.password;
  //   if (!password) return { strength: 0, text: '', color: '' };

  //   let score = 0;
  //   if (password.length >= 8) score++;
  //   if (/[a-z]/.test(password)) score++;
  //   if (/[A-Z]/.test(password)) score++;
  //   if (/\d/.test(password)) score++;
  //   if (/[^A-Za-z0-9]/.test(password)) score++;

  //   const strengths = [
  //     { strength: 0, text: 'Very Weak', color: 'bg-red-500' },
  //     { strength: 1, text: 'Weak', color: 'bg-red-400' },
  //     { strength: 2, text: 'Fair', color: 'bg-yellow-500' },
  //     { strength: 3, text: 'Good', color: 'bg-blue-500' },
  //     { strength: 4, text: 'Strong', color: 'bg-green-500' },
  //     { strength: 5, text: 'Very Strong', color: 'bg-green-600' }
  //   ];

  //   return strengths[score];
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!validateForm()) return;

    setIsLoading(true);
    navigate("/login");

    axios
      .post(
        "http://localhost:3000/api/auth/register",
        {
          email: formData.email,
          fullName: {
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        console.log(response.data);
        toast.success("Registration successful! Please log in.");
        navigate("/login");
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          const message = error.response.data.message;

          // Check if the user already exists
          if (message.toLowerCase().includes("already")) {
            toast.info("You already have an account. Please log in.");
            setErrors({ submit: "User already exists" });
          } else {
            toast.error(message || "Registration failed. Please try again.");
            setErrors({ submit: message });
          }
        } else {
          toast.error("Registration failed. Please try again!");
          setErrors({ submit: "Registration failed. Please try again!" });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <MessageSquare className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join ChatGPT Clone today</p>
        </div>

        {/* Registration Form */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
          <div className="space-y-6">
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.firstName
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    } text-white placeholder-gray-400`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.lastName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  } text-white placeholder-gray-400`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  } text-white placeholder-gray-400`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  } text-white placeholder-gray-400`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300`}
                        // className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        // style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                    {/* <span className="text-xs text-gray-400">{passwordStrength.text}</span> */}
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  } text-white placeholder-gray-400`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300">
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <Check
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 text-green-500"
                      size={16}
                    />
                  )}
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-1 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-300">
                  I agree to the{" "}
                  <button className="text-blue-400 hover:text-blue-300 underline">
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button className="text-blue-400 hover:text-blue-300 underline">
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-400">{errors.terms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.024-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.743.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-12.009C24.007 5.367 18.641.001 12.017.001z" />
                </svg>
                GitHub
              </button>
            </div>
          </div>
        </div>

        {/* Sign in link */}
        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
