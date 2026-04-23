/**
 * Pre-written message templates for quick guest communication
 */

export interface MessageTemplate {
  id: string;
  category: string;
  title: string;
  content: string;
  variables?: string[];
}

export const messageTemplates: MessageTemplate[] = [
  // Pre-Arrival
  {
    id: 'pre-arrival-welcome',
    category: 'Pre-Arrival',
    title: 'Welcome Message',
    content: `Hi {guestName}! 👋

We're excited to host you at {propertyName}! Your reservation is confirmed for {checkInDate} - {checkOutDate}.

I'll send you check-in details 24 hours before your arrival. In the meantime, feel free to reach out if you have any questions!`,
    variables: ['guestName', 'propertyName', 'checkInDate', 'checkOutDate'],
  },
  {
    id: 'check-in-instructions',
    category: 'Pre-Arrival',
    title: 'Check-in Instructions',
    content: `Hi {guestName}!

Your check-in is tomorrow at {checkInTime}. Here are the details:

📍 Address: {propertyAddress}
🔑 Entry Code: 1234 (keypad on front door)
🅿️ Parking: 2-car garage (code 5678)
📶 WiFi: NetworkName / Password123

The house will be ready by {checkInTime}. Let me know when you arrive!`,
    variables: ['guestName', 'checkInTime', 'propertyAddress'],
  },
  {
    id: 'early-checkin-approved',
    category: 'Pre-Arrival',
    title: 'Early Check-in Approved',
    content: `Good news! Early check-in is available. The property will be ready by {earlyTime}. Same entry code applies.`,
    variables: ['earlyTime'],
  },
  {
    id: 'early-checkin-declined',
    category: 'Pre-Arrival',
    title: 'Early Check-in Not Available',
    content: `Unfortunately, we have a same-day checkout and cleaning scheduled, so early check-in won't be possible. Check-in time is {checkInTime}. You're welcome to leave luggage if needed while you explore Austin!`,
    variables: ['checkInTime'],
  },

  // During Stay
  {
    id: 'checkin-followup',
    category: 'During Stay',
    title: 'Check-in Follow-up',
    content: `Hi {guestName}! Just checking in - did you arrive okay? Everything working well? Let me know if you need anything!`,
    variables: ['guestName'],
  },
  {
    id: 'wifi-info',
    category: 'During Stay',
    title: 'WiFi Information',
    content: `WiFi details:
Network: {wifiNetwork}
Password: {wifiPassword}

The router is in the living room. Let me know if you have any connectivity issues!`,
    variables: ['wifiNetwork', 'wifiPassword'],
  },
  {
    id: 'maintenance-notification',
    category: 'During Stay',
    title: 'Maintenance Notification',
    content: `Hi {guestName}, we need to address a maintenance issue. A technician will arrive {maintenanceTime}. They'll be in and out quickly. Apologies for the inconvenience!`,
    variables: ['guestName', 'maintenanceTime'],
  },
  {
    id: 'noise-complaint-response',
    category: 'During Stay',
    title: 'Noise Complaint Response',
    content: `Hi {guestName}, we received a noise complaint from neighbors. Please keep noise levels down, especially after 10 PM. We want to keep good relationships with the community. Thank you for understanding!`,
    variables: ['guestName'],
  },

  // Checkout
  {
    id: 'checkout-reminder',
    category: 'Checkout',
    title: 'Checkout Reminder',
    content: `Hi {guestName}! Your checkout is tomorrow at {checkOutTime}.

Please:
✓ Lock all doors
✓ Turn off AC/heat
✓ Leave keys on kitchen counter
✓ Start dishwasher if you used dishes

No need to strip beds or take out trash. Safe travels!`,
    variables: ['guestName', 'checkOutTime'],
  },
  {
    id: 'late-checkout-approved',
    category: 'Checkout',
    title: 'Late Checkout Approved',
    content: `Late checkout approved! You can stay until {lateCheckoutTime}. Enjoy the extra time!`,
    variables: ['lateCheckoutTime'],
  },
  {
    id: 'late-checkout-declined',
    category: 'Checkout',
    title: 'Late Checkout Not Available',
    content: `Unfortunately, we have a same-day check-in, so late checkout isn't available. Standard checkout is {checkOutTime}. You're welcome to leave luggage if you need to explore before your flight!`,
    variables: ['checkOutTime'],
  },

  // Post-Stay
  {
    id: 'thank-you',
    category: 'Post-Stay',
    title: 'Thank You & Review Request',
    content: `Thanks for staying at {propertyName}, {guestName}! 🙏

We hope you enjoyed Austin. If you have a moment, we'd love a review on {platform}. Great reviews help us keep our rates competitive!

Hope to host you again soon!`,
    variables: ['propertyName', 'guestName', 'platform'],
  },
  {
    id: 'left-items',
    category: 'Post-Stay',
    title: 'Left Items Found',
    content: `Hi {guestName}, we found some items you left behind: {itemsList}. We can mail them to you (shipping at cost) or hold them for 30 days. Let me know!`,
    variables: ['guestName', 'itemsList'],
  },

  // Issues & Support
  {
    id: 'issue-acknowledged',
    category: 'Support',
    title: 'Issue Acknowledged',
    content: `Thanks for letting us know about {issue}. We're looking into it and will have it resolved ASAP. I'll update you within the hour.`,
    variables: ['issue'],
  },
  {
    id: 'issue-resolved',
    category: 'Support',
    title: 'Issue Resolved',
    content: `Good news - {issue} has been fixed! Let me know if you're still experiencing any problems.`,
    variables: ['issue'],
  },

  // Local Recommendations
  {
    id: 'local-recs',
    category: 'Local Tips',
    title: 'Austin Recommendations',
    content: `Here are some Austin favorites near the house:

🍔 Food: Franklin BBQ, Matt's El Rancho, Hopdoddy
☕ Coffee: Epoch Coffee, Houndstooth
🎵 Live Music: Continental Club, Antone's
🌮 Tacos: Veracruz All Natural, Torchy's

Enjoy exploring Austin!`,
    variables: [],
  },
];

export function getTemplatesByCategory() {
  const categories = [...new Set(messageTemplates.map(t => t.category))];
  return categories.map(cat => ({
    category: cat,
    templates: messageTemplates.filter(t => t.category === cat),
  }));
}

export function replaceTemplateVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  return result;
}
