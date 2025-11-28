# 🛡️ Muqawama Admin Panel

Super Admin dashboard for managing the Muqawama tournament system.

## 📁 Folder Structure

```
admin/
├── config/           # Configuration files
│   └── adminConfig.js
├── utils/            # Utility functions
│   └── authCheck.js
├── components/       # Reusable components
│   ├── AdminLayout.jsx
│   ├── AdminSidebar.jsx
│   ├── AdminHeader.jsx
│   └── ProtectedRoute.jsx
├── pages/            # Admin pages
│   ├── Dashboard.jsx
│   ├── Registrations/
│   ├── Players/
│   ├── Teams/
│   ├── Fixtures/
│   ├── Matches/
│   ├── Goals/
│   └── Settings/
└── styles/           # Admin-specific styles
    └── admin.css
```

## 🔐 Authentication

### Super Admin Access
- Email-based authentication
- Configured in `config/adminConfig.js`
- Default: `admin@sioafe.com`

### Adding More Admins
Edit `admin/config/adminConfig.js`:
```javascript
export const SUPER_ADMIN_EMAILS = [
  'admin@sioafe.com',
  'another-admin@sioafe.com'
];
```

## 🎯 Features

### ✅ Implemented
- [x] Admin authentication system
- [x] Protected routes
- [x] Dashboard with statistics
- [x] Sidebar navigation
- [x] User management header

### 🚧 To Implement
- [ ] Registrations management
- [ ] Players management
- [ ] Teams management
- [ ] Fixtures creator
- [ ] Match result recorder
- [ ] Goals & assists management
- [ ] Statistics viewer
- [ ] Settings panel

## 🚀 Usage

### Creating New Admin Pages

1. Create page component in `pages/` folder
2. Wrap with `ProtectedRoute` and `AdminLayout`:

```jsx
import React from 'react';
import AdminLayout from '../components/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';

export default function MyAdminPage() {
  return (
    <ProtectedRoute>
      <AdminLayout title="My Page">
        {/* Your content */}
      </AdminLayout>
    </ProtectedRoute>
  );
}
```

### Adding Navigation Items

Edit `components/AdminSidebar.jsx` to add new menu items.

## 🎨 Styling

Admin-specific styles are in `styles/admin.css`.

### Design System
- **Primary Color**: #3b82f6 (Blue)
- **Background**: #f3f4f6 (Light Gray)
- **Sidebar**: #1e293b (Dark Slate)
- **Text**: #1f2937 (Gray-900)

## 📝 Next Steps

1. Create Registrations management page
2. Create Players CRUD interface
3. Create Teams management
4. Build Fixtures creator
5. Build Match result recorder
6. Build Goals/Stats tracker

Each feature should be a separate modular component for easy maintenance!

