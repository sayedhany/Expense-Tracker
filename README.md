# 💰 Expense Tracker

A modern expense tracking application built with Angular 18, featuring real-time currency conversion, smart filtering, pagination, and local storage persistence.

## 📋 About This Project

This is a full-featured expense management application that helps users track their expenses with the following capabilities:

### ✨ Key Features

- **Dashboard with Financial Summary**: View total balance, income, and expenses in USD
- **User Profile**: Personalized greeting based on time of day with profile image
- **Smart Filtering**: Filter expenses by Last 7 Days, This Month, This Year, or All Time
- **Currency Conversion**: Supports 160+ currencies with real-time exchange rates
- **Receipt Upload**: Upload and preview receipt images for each expense
- **Pagination**: Infinite scroll and "Load More" button for efficient data loading
- **Offline Support**: Works offline with localStorage caching
- **Category Management**: Visual category selection with icons
- **Responsive Design**: Works seamlessly on all screen sizes

## 🚀 How to Start the Application

### Prerequisites

Make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **pnpm** package manager

### Installation & Running

Follow these steps to run the application:

#### 1. Install Dependencies

```bash
npm i -g pnpm 
then 
pnpm install
# or if you're using npm
npm install
```

#### 2. Start the Backend Server (JSON Server)

Open a terminal and run:

```bash
pnpm run json-server
# or
npm run json-server
```

This starts the mock backend API on **http://localhost:3001**

You should see a message like:

```
JSON Server started on PORT :3001
```

#### 3. Start the Angular Development Server

Open **another terminal** (keep the JSON server running) and run:

```bash
pnpm start
# or
npm start
```

This starts the Angular application on **http://localhost:4200**

The app will automatically open in your default browser.

### 🎯 Quick Access

- **Frontend App**: http://localhost:4200
- **Backend API**: http://localhost:3001
- **Expenses Endpoint**: http://localhost:3001/expenses
- **Categories Endpoint**: http://localhost:3001/categories

## 📁 Project Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── dashboard/          # Main dashboard with expense list
│   │   ├── add-expense/        # Add new expense form
│   │   └── login/              # Login page
│   └── shared/
│       ├── user.service.ts            # User profile management
│       ├── expenses.service.ts        # Expense CRUD & currency conversion
│       ├── categories.service.ts      # Category management
│       ├── offline.service.ts         # Offline sync
│       ├── loading.service.ts         # Global loading states
│       └── toast.service.ts           # Notifications
└── db.json                     # Mock database
```

## 🎨 Available Scripts

- `pnpm start` or `npm start` - Start development server
- `pnpm run json-server` or `npm run json-server` - Start mock backend
- `pnpm build` or `npm build` - Build for production
- `pnpm test` or `npm test` - Run unit tests

## 🔧 Troubleshooting

### Port Already in Use

If you see an error that port 4200 or 3001 is already in use:

**For Angular (port 4200):**

```bash
ng serve --port 4300
```

**For JSON Server (port 3001):**
Edit the script in `package.json` to use a different port:

```json
"json-server": "json-server --watch db.json --port 3002"
```

### Application Not Loading Data

1. Make sure JSON Server is running (check http://localhost:3001/expenses)
2. Check browser console for errors (F12 → Console tab)
3. Clear browser localStorage and refresh

## 💡 Usage Tips

1. **Add an Expense**: Click the blue "+" button in the bottom navigation
2. **Filter Expenses**: Use the dropdown in the top right corner of the dashboard
3. **Upload Receipt**: Click "Upload image" when adding an expense
4. **View Currency Conversion**: When adding an expense in a foreign currency, see the live USD conversion

## 🛠️ Technologies Used

- **Angular 18** - Frontend framework
- **TypeScript 5.5** - Programming language
- **TailwindCSS 4** - Styling
- **RxJS 7** - Reactive programming
- **JSON Server** - Mock REST API
- **Font Awesome** - Icons
- **ExchangeRate API** - Currency conversion

## 📝 Features Implemented

✅ Dashboard with user profile and financial summary  
✅ Period-based filtering (Last 7 Days, This Month, etc.)  
✅ Add expense form with validation  
✅ Currency conversion (160+ currencies)  
✅ Receipt upload with preview  
✅ Pagination (10 items per page)  
✅ Infinite scroll + Load More button  
✅ Local storage persistence  
✅ Offline support with sync  
✅ Loading, empty, and error states  
✅ Responsive design

## 📞 Support

For any issues or questions about running the application, please check:

1. That both servers (Angular and JSON Server) are running
2. Browser console for error messages
3. Network tab to verify API calls

---

**Built with ❤️ using Angular**
