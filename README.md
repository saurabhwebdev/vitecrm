# 🏥 Modern Clinic Management System

A modern, full-featured clinic management system built with React, Vite, and Firebase. Designed to help healthcare providers manage their practice efficiently with a beautiful, user-friendly interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-brightgreen)
![Firebase](https://img.shields.io/badge/Firebase-10-orange)

## ✨ Features

### 👥 Patient Management
- Comprehensive patient profiles
- Medical history tracking
- Document management
- Search and filter capabilities

### 📅 Appointment Scheduling
- Real-time appointment booking
- Calendar integration
- Automated reminders
- Conflict prevention

### 💊 Prescription Management
- Digital prescription creation
- Medication tracking
- Dosage and frequency management
- Prescription history

### 💰 Billing & Invoicing
- Automated invoice generation
- Payment tracking
- Financial reporting
- Multiple payment methods

### 📦 Inventory Management
- Stock tracking
- Low stock alerts
- Usage analytics
- Supplier management

### ⚙️ Settings & Configuration
- Clinic profile management
- Staff management
- Working hours setup
- Customizable preferences

## 🚀 Tech Stack

- **Frontend Framework:** React 18 with Vite
- **Styling:** Tailwind CSS with ShadCN UI
- **State Management:** React Query & Zustand
- **Backend & Auth:** Firebase
- **Icons:** Phosphor Icons
- **Forms:** React Hook Form
- **Animations:** Tailwind CSS transitions

## 📋 Prerequisites

- Node.js 16.x or later
- npm or yarn
- Firebase account
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/saurabhwebdev/vitecrm.git
   cd vitecrm
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase configuration details in the `.env` file:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   # ... other Firebase variables
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 📁 Project Structure

```
src/
 ├── modules/        # Feature-based modules
 │   ├── auth/       # Authentication
 │   ├── patients/   # Patient management
 │   ├── appointments/
 │   ├── prescriptions/
 │   ├── invoices/
 │   ├── settings/
 │   ├── inventory/
 │   └── shared/     # Shared components
 ├── lib/           # Firebase & utilities
 ├── utils/         # Helper functions
 ├── assets/        # Static assets
 ├── styles/        # Global styles
 └── App.tsx        # Main app component
```

## 🔒 Security

- All sensitive data is stored in Firebase
- Environment variables for configuration
- Firebase security rules for data protection
- Authentication and authorization
- Input sanitization and validation

## 🎨 UI Components

The system uses a consistent design system with:
- Modern, clean interface
- Responsive design
- Accessible components
- Interactive feedback
- Loading states
- Error handling
- Toast notifications

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop layouts
- Print-friendly views

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Saurabh**
- GitHub: [@saurabhwebdev](https://github.com/saurabhwebdev)

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.com/)
- [Phosphor Icons](https://phosphoricons.com/)

## 📞 Support

For support, email [your-email@example.com](mailto:your-email@example.com) or create an issue in the repository.
