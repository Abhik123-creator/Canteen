# 🛒 Canteen Expense Tracker

A modern, cloud-powered expense tracking application for managing canteen/grocery expenses among friends. Built with vanilla JavaScript and Firebase for real-time data synchronization.

## 🌐 **Live Demo**
**👉 Try it now: [https://abhik123-creator.github.io/Canteen/](https://abhik123-creator.github.io/Canteen/)**

## ✨ **Features**

- 💰 **Budget Management** - Track monthly fund and remaining balance
- 👥 **Multi-Friend Support** - Monitor individual spending for each friend
- 📝 **Detailed Expense Tracking** - Add items with quantities and prices
- 📊 **Expense History** - View all transactions with date and description
- 📱 **Mobile Responsive** - Works perfectly on all devices
- ☁️ **Cloud Storage** - Data stored securely in Firebase Firestore
- 🔄 **Real-time Sync** - Multiple users can access simultaneously
- 📤 **Export/Import** - Backup and restore data easily
- 🆕 **New Month Setup** - Reset budget and expenses for new month

## 🚀 **Technology Stack**

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: Firebase Firestore
- **Hosting**: GitHub Pages
- **Architecture**: Pure frontend (no server required)

## 🏃‍♂️ **Quick Start**

### Online Version (Recommended)
Simply visit: **[https://abhik123-creator.github.io/Canteen/](https://abhik123-creator.github.io/Canteen/)**

### Local Development
1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhik123-creator/Canteen.git
   cd Canteen
   ```

2. **Start local server**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js
   npx serve . -p 8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🔧 **Setup Your Own Instance**

1. **Fork this repository**
2. **Set up Firebase** (follow `STEP_BY_STEP_FIREBASE_SETUP.md`)
3. **Update Firebase config** in `index.html`
4. **Enable GitHub Pages** in repository settings
5. **Your app is live!**

## 📊 **Usage**

### Adding Expenses
1. Select the friend who spent money
2. Enter the total amount
3. Add individual items with quantities and prices
4. Add a description
5. Click "Add Expense"

### Managing Budget
- **Add Funds**: Use the "Add Funds" feature to increase monthly budget
- **New Month**: Reset budget and clear expenses for a fresh start
- **Export Data**: Download your data as JSON for backup

### Multi-User Setup
Share your app URL with friends - they can all add expenses to the same shared database!

## 📱 **Mobile App Experience**

Add to your phone's home screen for a native app experience:
- **iOS**: Safari → Share → Add to Home Screen
- **Android**: Chrome → Menu → Add to Home Screen

## 🔄 **Data Migration**

If you have existing data, use the migration tool:
**[https://abhik123-creator.github.io/Canteen/migrate-data.html](https://abhik123-creator.github.io/Canteen/migrate-data.html)**

## 📁 **Project Structure**

```
├── index.html                    # Main application
├── app.js                       # Application logic
├── style.css                    # Styling
├── migrate-data.html            # Data migration tool
├── STEP_BY_STEP_FIREBASE_SETUP.md  # Firebase setup guide
├── GITHUB_PAGES_DEPLOYMENT.md   # Deployment guide
└── GET_STARTED.md               # Quick start guide
```

## 🔒 **Security & Privacy**

- **Data Encryption**: All data transmitted over HTTPS
- **Firebase Security**: Protected by Firebase security rules
- **No Personal Info**: Only expense data is stored
- **Local Control**: You control your own Firebase instance

## 🆓 **Cost**

- **Hosting**: Free (GitHub Pages)
- **Database**: Free (Firebase generous free tier)
- **Total**: $0/month for typical usage

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is open source and available under the [MIT License](LICENSE).

## 🆘 **Support**

- **Setup Issues**: Check `STEP_BY_STEP_FIREBASE_SETUP.md`
- **Deployment Help**: See `GITHUB_PAGES_DEPLOYMENT.md`
- **Bug Reports**: Open an issue on GitHub
- **Feature Requests**: Open an issue with enhancement label

## 🎉 **Acknowledgments**

Built with ❤️ for managing shared expenses efficiently. Perfect for:
- 🏠 Roommate expense sharing
- 🍕 Group meal planning
- 🛒 Grocery shopping splits
- 🎉 Party expense tracking

---

**⭐ Star this repository if you find it useful!**

Made by [Abhik123-creator](https://github.com/Abhik123-creator)