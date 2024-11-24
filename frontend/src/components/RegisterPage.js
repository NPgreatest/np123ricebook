import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../styles/registerPage.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        accountName: '',
        displayName: '',
        email: '',
        phone: '',
        dob: '',
        zipcode: '',
        password: '',
        passwordConfirm: '',
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    
    const backLogin = () => {
        navigate('/');
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    
        // Create preview URL
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setImagePreview(null);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        const { accountName, email, phone, dob, password, passwordConfirm } = formData;
        let newErrors = {};
        const today = new Date();
        const dobDate = new Date(dob);
        const age = today.getFullYear() - dobDate.getFullYear();

        const accountNameRegex = /^[A-Za-z][A-Za-z0-9]*$/;
        if (!accountNameRegex.test(accountName)) {
            newErrors.accountName = 'Account name must start with a letter and only contain letters or numbers.';
        }

        if (age < 18 || (age === 18 && today < new Date(dobDate.setFullYear(dobDate.getFullYear() + 18)))) {
            newErrors.dob = 'You must be 18 years or older to register.';
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            newErrors.phone = 'Phone number must be 10 digits.';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        if (password !== passwordConfirm) {
            newErrors.passwordConfirm = 'Passwords do not match.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Fetch existing users to check for username uniqueness
            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            const users = await response.json();

            // Check if the username already exists
            console.log(users,formData);
            const userExists = users.some(user => user.username.toLowerCase() === formData.accountName.toLowerCase());

            if (userExists) {
                alert('Username already registered');
                setIsLoading(false);
                return;
            }

            // Proceed with the form validation
            if (validateForm()) {
                alert('Registration Successful');
                Cookies.set('userId', 'new');
                Cookies.set('username',formData.accountName);
                Cookies.set('email',formData.email);
                Cookies.set('phone',formData.phone);
                Cookies.set('zipcode',formData.zipcode);
                navigate('/main'); 
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            alert('There was an error during registration. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearForm = () => {
        setFormData({
            accountName: '',
            displayName: '',
            email: '',
            phone: '',
            dob: '',
            zipcode: '',
            password: '',
            passwordConfirm: '',
        });
        setErrors({});
    };

    return (
        <div className="register-container">
            <h1>Registration Page</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="accountName">Account Name:</label>
                <input
                    type="text"
                    id="accountName"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleInputChange}
                    required
                />
                {errors.accountName && <span className="error">{errors.accountName}</span>}
                <br />

                <label htmlFor="displayName">Display Name (Optional):</label>
                <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                />
                <br />

                <label htmlFor="email">Email Address:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                />
                {errors.email && <span className="error">{errors.email}</span>}
                <br />

                <label htmlFor="phone">Phone Number:</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
                <br />

                <label htmlFor="dob">Date of Birth:</label>
                <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                />
                {errors.dob && <span className="error">{errors.dob}</span>}
                <br />

                <label htmlFor="zipcode">Zipcode:</label>
                <input
                    type="text"
                    id="zipcode"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleInputChange}
                    required
                />
                <br />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                />
                <br />

                <label htmlFor="passwordConfirm">Confirm Password:</label>
                <input
                    type="password"
                    id="passwordConfirm"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleInputChange}
                    required
                />
                {errors.passwordConfirm && <span className="error">{errors.passwordConfirm}</span>}
                <br />

                <div className="form-actions">
                    <button type="button" onClick={clearForm}>
                        Clear
                    </button>
                    <button type="button" onClick={backLogin}>
                        Back to Login Page
                    </button>
                </div>
                <input type="submit" value="Submit" disabled={isLoading} />
            </form>
        </div>
    );
};

export default RegisterPage;
