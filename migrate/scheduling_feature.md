# 📅 Client Scheduling Feature - Detailed Specification

## 🎯 Overview

**The Problem**: Back-and-forth emails to schedule meetings waste everyone's time.

**The Solution**: Give each user a personalized booking link (like Calendly) built right into the CRM, where clients can see availability and book instantly.

---

## 🔗 How It Works

### For the CRM User (You)
1. Set your availability (e.g., Mon-Fri 9-5)
2. Create meeting types (15min call, 1hr consultation)
3. Share your link: `yourname.novacrm.app/book`
4. Meetings automatically appear in your calendar

### For Your Clients
1. Click your booking link
2. See available time slots
3. Pick a time that works
4. Add notes about what they need
5. Get instant confirmation

---

## 🛠️ Technical Implementation

### Database Schema

```prisma
// User availability settings
model AvailabilitySettings {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  // Working hours
  timezone        String   @default("America/New_York")
  workingDays     Json     // { mon: true, tue: true, ... }
  startTime       String   // "09:00"
  endTime         String   // "17:00"
  
  // Booking settings
  bufferTime      Int      @default(15) // minutes between meetings
  minNotice       Int      @default(24) // hours advance notice
  maxAdvance      Int      @default(30) // days can book ahead
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Meeting types (15min, 30min, etc)
model MeetingType {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  name            String   // "Quick Call"
  duration        Int      // 30 (minutes)
  description     String?  // "Let's discuss your project"
  color           String   @default("#3B82F6")
  
  // Booking page customization
  questions       Json?    // Custom intake questions
  confirmationMsg String?  // Custom confirmation message
  
  active          Boolean  @default(true)
  
  bookings        Booking[]
  
  @@index([userId])
}

// Actual bookings
model Booking {
  id              String       @id @default(cuid())
  meetingTypeId   String
  meetingType     MeetingType  @relation(fields: [meetingTypeId], references: [id])
  
  // Who's involved
  hostId          String       // CRM user
  host            User         @relation(fields: [hostId], references: [id])
  contactId       String?      // Existing contact
  contact         Contact?     @relation(fields: [contactId], references: [id])
  
  // Guest info (if not existing contact)
  guestName       String?
  guestEmail      String
  guestPhone      String?
  guestCompany    String?
  
  // Meeting details
  startTime       DateTime
  endTime         DateTime
  timezone        String
  meetingNotes    String?      // What they want to discuss
  
  // Status
  status          BookingStatus @default(CONFIRMED)
  cancelReason    String?
  
  // Integration
  calendarEventId String?      // Google/Outlook event ID
  meetingLink     String?      // Zoom/Teams link
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([hostId])
  @@index([startTime])
  @@index([status])
}

enum BookingStatus {
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}

// Blocked time slots
model BlockedTime {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  startTime       DateTime
  endTime         DateTime
  reason          String?  // "Vacation", "Personal", etc
  recurring       Boolean  @default(false)
  recurrenceRule  String?  // RFC 5545 RRULE
  
  @@index([userId])
  @@index([startTime])
}
```

### API Endpoints

```typescript
// Public endpoints (no auth required)
GET    /api/public/booking/:username              // Get user's booking page data
GET    /api/public/booking/:username/availability // Get available slots
POST   /api/public/booking/:username/book         // Create a booking

// Authenticated endpoints
GET    /api/availability                          // Get user's availability settings
PATCH  /api/availability                          // Update availability
GET    /api/meeting-types                         // List meeting types
POST   /api/meeting-types                         // Create meeting type
PATCH  /api/meeting-types/:id                     // Update meeting type
DELETE /api/meeting-types/:id                     // Delete meeting type
GET    /api/bookings                              // List bookings
PATCH  /api/bookings/:id                          // Update booking (cancel, reschedule)
POST   /api/blocked-time                          // Block time slots
```

### Frontend Components

```typescript
// Public booking page component
// app/book/[username]/page.tsx
export default function BookingPage({ params }) {
  const { username } = params;
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Step 1: Choose meeting type */}
      <MeetingTypeSelector 
        types={meetingTypes}
        selected={selectedType}
        onSelect={setSelectedType}
      />
      
      {/* Step 2: Pick a date */}
      {selectedType && (
        <CalendarPicker
          availability={availability}
          selected={selectedDate}
          onSelect={setSelectedDate}
        />
      )}
      
      {/* Step 3: Choose time slot */}
      {selectedDate && (
        <TimeSlotPicker
          date={selectedDate}
          duration={selectedType.duration}
          slots={availableSlots}
          selected={selectedTime}
          onSelect={setSelectedTime}
        />
      )}
      
      {/* Step 4: Enter details */}
      {selectedTime && (
        <BookingForm
          meetingType={selectedType}
          dateTime={selectedTime}
          onSubmit={handleBooking}
        />
      )}
    </div>
  );
}
```

### Availability Algorithm

```typescript
// lib/scheduling/availability.ts
export function getAvailableSlots(
  date: Date,
  settings: AvailabilitySettings,
  existingBookings: Booking[],
  blockedTimes: BlockedTime[],
  duration: number
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  // Check if date is a working day
  const dayOfWeek = format(date, 'eee').toLowerCase();
  if (!settings.workingDays[dayOfWeek]) {
    return slots;
  }
  
  // Generate all possible slots for the day
  const startTime = parse(settings.startTime, 'HH:mm', date);
  const endTime = parse(settings.endTime, 'HH:mm', date);
  
  let currentSlot = startTime;
  while (isBefore(currentSlot, endTime)) {
    const slotEnd = addMinutes(currentSlot, duration);
    
    // Check if slot fits within working hours
    if (isAfter(slotEnd, endTime)) break;
    
    // Check for conflicts
    const hasConflict = 
      hasBookingConflict(currentSlot, slotEnd, existingBookings) ||
      hasBlockedTimeConflict(currentSlot, slotEnd, blockedTimes);
    
    if (!hasConflict) {
      slots.push({
        start: currentSlot,
        end: slotEnd,
        available: true
      });
    }
    
    // Move to next slot (considering buffer time)
    currentSlot = addMinutes(slotEnd, settings.bufferTime);
  }
  
  return slots;
}
```

### Calendar Integration

```typescript
// lib/integrations/google-calendar.ts
export async function syncBookingToGoogleCalendar(
  booking: Booking,
  accessToken: string
) {
  const event = {
    summary: `Meeting with ${booking.guestName}`,
    description: booking.meetingNotes,
    start: {
      dateTime: booking.startTime.toISOString(),
      timeZone: booking.timezone,
    },
    end: {
      dateTime: booking.endTime.toISOString(),
      timeZone: booking.timezone,
    },
    attendees: [
      { email: booking.guestEmail }
    ],
  };
  
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );
  
  const created = await response.json();
  return created.id;
}
```

---

## 🎨 UI/UX Design

### Booking Page Flow

```
1. Meeting Type Selection
┌─────────────────────────────────┐
│  Schedule time with Jane Smith   │
│                                  │
│  ┌─────────┐ ┌─────────┐        │
│  │ 15 min  │ │ 30 min  │        │
│  │  Call   │ │Consulta-│        │
│  │         │ │  tion   │        │
│  └─────────┘ └─────────┘        │
└─────────────────────────────────┘

2. Calendar View
┌─────────────────────────────────┐
│     < November 2024 >            │
│ S  M  T  W  T  F  S             │
│          1  2  3  4             │
│ 5  6  7  8  9  10 11           │
│ 12 13 14 [15] 16 17 18         │
└─────────────────────────────────┘

3. Time Slots
┌─────────────────────────────────┐
│  Thursday, November 15           │
│                                  │
│  Morning      Afternoon          │
│  ● 9:00 AM    ● 2:00 PM        │
│  ● 9:30 AM    ○ 2:30 PM        │
│  ● 10:00 AM   ● 3:00 PM        │
└─────────────────────────────────┘

4. Details Form
┌─────────────────────────────────┐
│  Almost there!                   │
│                                  │
│  Name: [___________________]     │
│  Email: [__________________]     │
│  Company: [________________]     │
│                                  │
│  What would you like to discuss? │
│  [________________________]      │
│  [________________________]      │
│                                  │
│  [Book Meeting]                  │
└─────────────────────────────────┘
```

### Admin Dashboard

```typescript
// components/scheduling/AvailabilitySettings.tsx
export function AvailabilitySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Availability</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Working Hours */}
        <div className="space-y-4">
          <div>
            <Label>Working Hours</Label>
            <div className="grid grid-cols-2 gap-4">
              <TimeSelect 
                label="Start"
                value={startTime}
                onChange={setStartTime}
              />
              <TimeSelect
                label="End" 
                value={endTime}
                onChange={setEndTime}
              />
            </div>
          </div>
          
          {/* Working Days */}
          <div>
            <Label>Available Days</Label>
            <DayPicker
              selected={workingDays}
              onChange={setWorkingDays}
            />
          </div>
          
          {/* Buffer Time */}
          <div>
            <Label>Buffer Between Meetings</Label>
            <Select value={bufferTime} onChange={setBufferTime}>
              <option value="0">No buffer</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🔔 Notifications & Reminders

### Email Templates

```html
<!-- Booking Confirmation -->
<h2>Meeting Confirmed!</h2>
<p>Hi {guestName},</p>
<p>Your meeting with {hostName} is confirmed for:</p>
<div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
  <strong>{meetingType}</strong><br>
  {date} at {time} ({timezone})<br>
  Duration: {duration} minutes
</div>
<p>Need to make changes? <a href="{rescheduleLink}">Reschedule</a> or <a href="{cancelLink}">Cancel</a></p>

<!-- Reminder Email (24 hours before) -->
<h2>Reminder: Meeting Tomorrow</h2>
<p>Hi {guestName},</p>
<p>Just a reminder about your meeting tomorrow:</p>
<!-- ... meeting details ... -->
```

### SMS Reminders (Optional)

```typescript
// lib/notifications/sms.ts
export async function sendSMSReminder(booking: Booking) {
  if (!booking.guestPhone) return;
  
  const message = `Reminder: Meeting with ${booking.host.name} tomorrow at ${format(booking.startTime, 'h:mm a')}. Reply CANCEL to cancel.`;
  
  await twilioClient.messages.create({
    body: message,
    to: booking.guestPhone,
    from: process.env.TWILIO_PHONE_NUMBER
  });
}
```

---

## 🚀 Deployment Considerations

### Custom Domains
- Default: `username.novacrm.app/book`
- Custom: `book.yourdomain.com` (CNAME setup)

### Performance
- Cache availability calculations
- Pre-generate time slots
- Optimize for mobile devices
- Fast loading booking pages

### Security
- Rate limiting on public endpoints
- CAPTCHA for booking form
- Validate all time slots server-side
- Sanitize user inputs

---

## 📈 Analytics & Insights

### Track Key Metrics
- Booking conversion rate
- Most popular meeting types
- Average lead time
- No-show rate
- Peak booking times

### Reports Dashboard
```typescript
// Booking Analytics Widget
<StatsCard
  title="This Week's Bookings"
  value={12}
  change={+20}
  trend="up"
/>

<ChartCard title="Bookings by Day">
  <BarChart data={bookingsByDay} />
</ChartCard>
```

---

**This scheduling system becomes your 24/7 booking assistant, saving hours of back-and-forth emails while giving clients a professional booking experience.**