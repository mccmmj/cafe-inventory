# Cafe Inventory System

A Next.js application for managing cafe inventory with real-time data from Google Sheets via SheetDB API.

## Features

- 🔐 **Authentication** - Google OAuth integration
- 📊 **Real-time Dashboard** - Live inventory statistics and analytics
- 🔍 **Product Search** - Search inventory items with autocomplete
- 📈 **Usage Analytics** - Track product usage patterns
- ⚠️ **Low Stock Alerts** - Automatic notifications for items below minimum levels
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with Google Provider
- **Data**: Google Sheets via SheetDB API
- **State Management**: TanStack Query (React Query)
- **Icons**: Lucide React

## Prerequisites

1. **Google Sheets Setup**
   - Create a Google Sheets document with a `Master_Inventory` sheet
   - Set up SheetDB integration at [sheetdb.io](https://sheetdb.io)
   - Get your API ID and API Key

2. **Google OAuth Setup**
   - Create a Google Cloud Project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Get Client ID and Client Secret

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cafe-inventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here

   # SheetDB API
   NEXT_PUBLIC_SHEETDB_API_ID=your_sheetdb_api_id_here
   SHEETDB_API_KEY=your_sheetdb_api_key_here

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Google Sheets Structure

Your `Master_Inventory` sheet should have the following columns:

| Column | Description | Type |
|--------|-------------|------|
| Product_ID | Unique product identifier | Text |
| Category | Product category | Text |
| Product_Name | Product name | Text |
| Unit_Size | Unit size/measurement | Text |
| Current_Stock | Current inventory level | Number |
| Min_Level | Minimum stock level | Number |
| Max_Level | Maximum stock level | Number |
| Storage_Location | Where item is stored | Text |
| Primary_Vendor | Supplier name | Text |
| Cost_Per_Unit | Cost per unit | Text |
| Last_Updated | Last update timestamp | Text |
| Status | Stock status | Text |

## Usage

1. **Authentication**: Sign in with your Google account
2. **Dashboard**: View inventory statistics and alerts
3. **Search**: Use the search bar to find specific products
4. **Analytics**: Monitor usage patterns and trends

## Development

- **File Structure**: Follows Next.js 13+ app directory structure
- **Components**: Reusable UI components in `/components`
- **Hooks**: Custom React hooks in `/hooks`
- **Types**: TypeScript definitions in `/types`
- **API**: SheetDB integration in `/lib/sheetdb.ts`

## Deployment

The app can be deployed to Vercel, Netlify, or any other Next.js-compatible platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
