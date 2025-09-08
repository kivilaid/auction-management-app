# Auction Management System

A modern Japanese car auction sheet management system built with Next.js 15, Convex, and shadcn/ui.

## Features

- **Dashboard**: Overview of recent auction sheets
- **Management**: Add new auction sheets with detailed information
- **Search**: Advanced filtering and search capabilities
- **Real-time Updates**: Live data synchronization via Convex
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript integration

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: Convex (real-time backend)
- **Authentication**: Convex Auth (planned)
- **Deployment**: Vercel (frontend) + Convex Cloud (backend)

## Schema Design

The application uses a single-table design optimized for Japanese auction sheet data:

### Main Fields
- **Basic Info**: Lot number, auction house, date, time
- **Vehicle Info**: Make, model, year, mileage, fuel type
- **Grading**: Overall grade (S, 6, 5, 4.5, etc.), exterior/interior grades
- **Equipment**: AC, navigation, power steering, etc. (boolean flags)
- **Defects**: Detailed damage tracking by vehicle area (front/rear/side)
- **Pricing**: Starting price, reserve price, final sale price
- **Comments**: Inspector comments, seller notes, condition reports

### Auction Grading System
- **S**: Excellent condition (like new)
- **6-5**: Very good condition
- **4.5-4**: Good condition (minor wear)
- **3.5-3**: Fair condition (noticeable wear)
- **2-1**: Poor condition (major damage)
- **R/RA**: Repair history

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Convex CLI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd auction-management-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Convex:
```bash
npx convex dev
```
Follow the prompts to create a new Convex project.

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Adding Sample Data

1. Navigate to the Management page (/manage)
2. Click "Add Sample Data" to populate the database with example auction sheets
3. Alternatively, manually add auction sheets using the form

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx         # Dashboard
│   ├── manage/          # Management interface
│   └── search/          # Search functionality
├── components/          # Reusable React components
│   ├── ui/              # shadcn/ui components
│   ├── AddAuctionSheetForm.tsx
│   └── Navigation.tsx
└── lib/                 # Utility functions

convex/
├── schema.ts            # Database schema
├── auctionSheets.ts     # CRUD operations
└── sampleData.ts        # Sample data seeder
```

## API Functions

### Queries
- `api.auctionSheets.list` - Get all auction sheets
- `api.auctionSheets.getByMakeModel` - Filter by make/model
- `api.auctionSheets.getByLotNumber` - Get specific auction sheet
- `api.auctionSheets.search` - Full-text search

### Mutations
- `api.auctionSheets.create` - Add new auction sheet
- `api.auctionSheets.update` - Update existing data
- `api.auctionSheets.remove` - Delete auction sheet
- `api.sampleData.seedSampleData` - Add sample data

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_CONVEX_URL`
3. Deploy automatically on push

### Backend (Convex Cloud)
1. Run `npx convex deploy` to deploy functions
2. Update environment variables with production URLs

## Development Notes

### Japanese Text Support
The application is designed to handle Japanese characters in:
- Vehicle makes and models (トヨタ, ホンダ, etc.)
- Inspector comments and notes
- Auction house names

### Grade System
Following standard Japanese auction grading:
- Numerical grades: 6, 5, 4.5, 4, 3.5, 3, 2, 1
- Special grades: S (Superior), R (Repaired), RA (Repaired with Accident)

### Defect Codes
Standard Japanese auction defect notation:
- **A**: Scratch (線傷)
- **U**: Dent (へこみ) 
- **B**: Dent with scratch (へこみ傷)
- **P**: Paint issue (塗装)
- **W**: Repair trace (修理跡)
- **S**: Rust (錆)
- **C**: Corrosion (腐食)
- **X**: Needs replacement (要交換)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.