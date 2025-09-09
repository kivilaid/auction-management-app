# Japanese Auction Sheet AI Extraction System

This system provides automated extraction of Japanese car auction sheet data using OpenAI's GPT-5-mini model with structured outputs.

## Features

- 🤖 **AI-Powered Extraction**: Uses GPT-5-mini with structured JSON outputs to extract comprehensive auction data
- 📊 **Comprehensive Data Schema**: Supports all major auction sheet fields including vehicle specs, defects, pricing, and equipment
- 🖼️ **Image Storage**: Automatically downloads and stores auction images in Convex storage
- 📈 **Job Management**: Queue-based processing with retry mechanisms and status tracking
- 🔍 **Real-time Monitoring**: Dashboard for tracking extraction jobs and system health
- 🏛️ **Database Integration**: Seamlessly integrates with existing auction sheet database schema

## Architecture

### Core Components

1. **OpenAI Integration** (`convex/openai.ts`)
   - GPT-5-mini model with Responses API
   - Structured JSON schema validation using Zod
   - Comprehensive auction sheet data extraction

2. **Convex Actions** (`convex/auctionExtraction.ts`)
   - Authenticated web scraping from autoworldjapan.com
   - AI-powered data extraction
   - Image download and storage
   - Error handling and retry logic

3. **Database Schema** (`convex/schema.ts`)
   - Extended auction sheets table with 180+ fields
   - Extraction jobs tracking table
   - Image metadata storage table
   - Optimized indexes for performance

4. **Job Processing** (`convex/extractionJobProcessor.ts`)
   - Automated retry of failed extractions
   - Job queue management with priority handling
   - Cleanup of old completed jobs
   - System health monitoring

5. **Admin Interface** (`src/app/admin/extraction/page.tsx`)
   - User-friendly extraction scheduling
   - Real-time job status tracking
   - Retry failed extractions
   - Comprehensive job history

6. **Monitoring Dashboard** (`src/app/admin/monitoring/page.tsx`)
   - System performance metrics
   - Success/failure rate tracking
   - Data statistics visualization
   - Health alerts and notifications

## Setup Instructions

### 1. Environment Configuration

Add your OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=your-openai-api-key-here
NEXT_PUBLIC_CONVEX_URL=your-convex-deployment-url
```

### 2. Install Dependencies

```bash
npm install openai @radix-ui/react-progress --legacy-peer-deps
```

### 3. Deploy Convex Schema

```bash
npx convex dev
```

This will deploy the new database schema including:
- `extractionJobs` table for job tracking
- `auctionImages` table for image metadata
- Extended `auctionSheets` table with comprehensive fields

### 4. Configure Cron Jobs

The system includes automated cron jobs for:
- Retrying failed extractions (every 30 minutes)
- Cleaning up old jobs (daily)

These are automatically deployed with your Convex functions.

## Usage Guide

### Manual Extraction

1. Navigate to **AI Extraction** in the admin interface
2. Enter the autoworldjapan.com auction URL
3. Provide authentication credentials
4. Set priority (1=low, 5=normal, 10=high)
5. Click "Schedule Extraction"

### Monitoring System Health

1. Navigate to **Monitoring** in the admin interface
2. View real-time system statistics
3. Monitor job success/failure rates
4. Track data extraction progress
5. Respond to system alerts

### Programmatic Usage

You can also schedule extractions programmatically using Server Actions:

```typescript
import { scheduleAuctionExtraction } from "@/lib/auctionActions";

const result = await scheduleAuctionExtraction(formData);
if (result.success) {
  console.log(`Job scheduled: ${result.jobId}`);
}
```

## Data Flow

```
1. User submits auction URL
   ↓
2. Convex mutation creates extraction job
   ↓
3. Convex action fetches authenticated HTML content
   ↓
4. OpenAI GPT-5-mini extracts structured data
   ↓
5. Auction sheet record created in database
   ↓
6. Images downloaded and stored in Convex storage
   ↓
7. Job marked as completed with metadata
```

## Supported Auction Data

### Vehicle Information
- Make, model, year, registration details
- Engine specifications (displacement, fuel type, engine code)
- Transmission details (type, speeds)
- Body specifications (doors, color, steering position)

### Condition Assessment
- Overall grade (S, 6, 5, 4.5, 4, 3.5, 3, 2, 1, 0, R, RA, ***)
- Exterior/Interior grades (A, B, C, D, E, F)
- Mileage with authenticity verification
- Comprehensive defect mapping by vehicle area

### Equipment & Features
- Standard equipment (AC, PS, PW, ABS, airbag, etc.)
- Advanced features (navigation, radar cruise, BSM, etc.)
- Custom equipment tracking

### Pricing & Auction Details
- Starting/reserve/average/final prices
- Auction house information
- Sale status and bidding details
- Export eligibility and fees

### Defect Documentation
- Area-specific defect codes (A1-A4, U1-U4, B1-B4, etc.)
- Defect severity and type classification
- Damage location mapping
- Inspector comments and notes

## Error Handling & Recovery

### Automatic Retry Logic
- Failed jobs automatically retried up to 3 times
- 1-hour cooldown between retry attempts
- Exponential backoff for rate limiting

### Error Classification
- Authentication failures
- Network timeouts
- AI extraction errors
- Image download failures
- Database constraint violations

### Monitoring & Alerting
- Real-time job status updates
- Failed job notifications
- System health indicators
- Performance metrics tracking

## Performance Optimization

### Concurrent Processing
- Up to 5 jobs processed simultaneously
- Priority-based job queue management
- Resource usage monitoring

### Caching & Storage
- HTML content cached for debugging
- AI responses stored for analysis
- Optimized image storage with metadata

### Database Optimization
- Comprehensive indexing strategy
- Efficient query patterns
- Automatic cleanup processes

## Security Considerations

### Authentication
- Secure credential storage (production: use encrypted storage)
- Session management for long-running extractions
- User agent rotation and request throttling

### Data Protection
- Sensitive auction data properly secured
- Image access controls
- Audit logging for all operations

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify credentials are correct
   - Check if session has expired
   - Ensure proper user agent headers

2. **AI Extraction Errors**
   - Verify OpenAI API key is valid
   - Check model availability (GPT-5-mini)
   - Review HTML content quality

3. **Image Download Issues**
   - Verify image URLs are accessible
   - Check authentication for image resources
   - Monitor storage quota limits

### Debug Information

The system stores debug information for troubleshooting:
- Raw HTML content (truncated to 50KB)
- AI model responses
- Error messages and stack traces
- Request/response headers

## Future Enhancements

### Planned Features
- OCR integration for image-based auction sheets
- Batch processing capabilities
- Custom extraction templates
- Data validation and quality scoring
- Integration with external pricing APIs

### Scalability Improvements
- Distributed job processing
- Advanced caching strategies  
- Real-time websocket updates
- Enhanced monitoring and alerting

## Support

For technical support or feature requests:

1. Check the monitoring dashboard for system status
2. Review job logs for specific extraction issues  
3. Verify environment configuration
4. Contact system administrators for escalation

---

*This system is designed for Japanese car auction data extraction and requires proper authentication credentials for autoworldjapan.com*