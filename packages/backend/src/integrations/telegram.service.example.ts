/**
 * Example usage of TelegramService
 *
 * This file demonstrates how to use the TelegramService in your application.
 * DO NOT import this file - it's just for documentation purposes.
 */

import { TelegramService } from './telegram.service';

async function exampleUsage() {
  const telegramService = new TelegramService();

  // 1. Validate a bot token
  const botToken = 'YOUR_BOT_TOKEN_HERE';
  const isValidToken = await telegramService.validateToken(botToken);
  console.log('Token is valid:', isValidToken);

  // 2. Send a simple message
  const channelId = '@your_channel_name'; // or numeric ID like '-1001234567890'
  await telegramService.sendMessage(
    botToken,
    channelId,
    'Hello from Truk!',
  );

  // 3. Send a message with buttons
  const customButtons = [
    [
      { text: 'View Details', url: 'https://example.com/details' },
      { text: 'Contact', url: 'https://example.com/contact' },
    ],
  ];
  await telegramService.sendMessage(
    botToken,
    channelId,
    'Check out this offer!',
    customButtons,
  );

  // 4. Get channel information
  const chatInfo = await telegramService.getChatInfo(botToken, channelId);
  console.log('Channel title:', chatInfo.title);

  // 5. Format and send a structured message
  const messageContent = {
    title: 'New Housing Offer',
    description: 'Beautiful 2-bedroom apartment available for rent in the city center.',
    price: 850,
    emoji: '🏠',
    hashtags: ['housing', 'rent', 'cityCenter'],
    customFields: {
      'Location': 'Madrid',
      'Bedrooms': '2',
      'Available': 'Immediately',
    },
  };

  const deepLink = 'https://truk.app/housing/123';
  await telegramService.sendFormattedMessage(
    botToken,
    channelId,
    messageContent,
    deepLink,
  );

  // 6. Test channel access
  const hasAccess = await telegramService.testChannelAccess(botToken, channelId);
  console.log('Bot has access to channel:', hasAccess);

  // 7. Format a message without sending (useful for previewing)
  const formattedMessage = telegramService.formatMessage(messageContent, deepLink);
  console.log('Formatted message:', formattedMessage);

  // 8. Create custom inline buttons
  const inlineButtons = telegramService.createInlineButtons(
    'View in App',
    'https://truk.app/offers/456',
  );
}

/**
 * Integration examples for different features:
 */

// Example 1: New Event Notification
async function notifyNewEvent(
  telegramService: TelegramService,
  botToken: string,
  channelId: string,
  event: any,
) {
  const messageContent = {
    title: event.title,
    description: event.description,
    emoji: '🎉',
    hashtags: ['event', event.category, event.communitySlug],
    customFields: {
      'Date': new Date(event.startDate).toLocaleDateString('es-ES'),
      'Location': event.location,
      'Organizer': event.organizerName,
    },
  };

  const deepLink = `https://truk.app/events/${event.id}`;
  await telegramService.sendFormattedMessage(botToken, channelId, messageContent, deepLink);
}

// Example 2: New Offer Notification
async function notifyNewOffer(
  telegramService: TelegramService,
  botToken: string,
  channelId: string,
  offer: any,
) {
  const messageContent = {
    title: offer.title,
    description: offer.description,
    price: offer.price,
    emoji: '💼',
    hashtags: ['offer', offer.category, offer.condition],
    customFields: {
      'Condition': offer.condition,
      'Category': offer.category,
      'Posted by': offer.userName,
    },
  };

  const deepLink = `https://truk.app/offers/${offer.id}`;
  await telegramService.sendFormattedMessage(botToken, channelId, messageContent, deepLink);
}

// Example 3: TimeBank Request Notification
async function notifyTimeBankRequest(
  telegramService: TelegramService,
  botToken: string,
  channelId: string,
  request: any,
) {
  const messageContent = {
    title: request.title,
    description: request.description,
    emoji: '⏰',
    hashtags: ['timebank', request.category, 'help'],
    customFields: {
      'Hours needed': `${request.hours}h`,
      'Category': request.category,
      'Requester': request.requesterName,
    },
  };

  const deepLink = `https://truk.app/timebank/requests/${request.id}`;
  await telegramService.sendFormattedMessage(botToken, channelId, messageContent, deepLink);
}

// Example 4: Group Buy Notification
async function notifyGroupBuy(
  telegramService: TelegramService,
  botToken: string,
  channelId: string,
  groupBuy: any,
) {
  const messageContent = {
    title: groupBuy.title,
    description: groupBuy.description,
    price: groupBuy.pricePerUnit,
    emoji: '🛒',
    hashtags: ['groupbuy', 'savings', groupBuy.category],
    customFields: {
      'Min participants': `${groupBuy.currentParticipants}/${groupBuy.minParticipants}`,
      'Deadline': new Date(groupBuy.deadline).toLocaleDateString('es-ES'),
      'Savings': `€${groupBuy.potentialSavings}`,
    },
  };

  const deepLink = `https://truk.app/groupbuys/${groupBuy.id}`;
  await telegramService.sendFormattedMessage(botToken, channelId, messageContent, deepLink);
}

// Example 5: Housing Notification
async function notifyHousing(
  telegramService: TelegramService,
  botToken: string,
  channelId: string,
  housing: any,
) {
  const messageContent = {
    title: housing.title,
    description: housing.description,
    price: housing.rent,
    emoji: '🏠',
    hashtags: ['housing', housing.type, housing.city],
    customFields: {
      'Type': housing.type,
      'Bedrooms': housing.bedrooms,
      'Location': `${housing.city}, ${housing.neighborhood}`,
      'Available': new Date(housing.availableFrom).toLocaleDateString('es-ES'),
    },
  };

  const deepLink = `https://truk.app/housing/${housing.id}`;
  await telegramService.sendFormattedMessage(botToken, channelId, messageContent, deepLink);
}

// Example 6: Error Handling
async function exampleWithErrorHandling(
  telegramService: TelegramService,
  botToken: string,
  channelId: string,
) {
  try {
    // Validate token first
    const isValid = await telegramService.validateToken(botToken);
    if (!isValid) {
      console.error('Invalid bot token');
      return;
    }

    // Test channel access
    const hasAccess = await telegramService.testChannelAccess(botToken, channelId);
    if (!hasAccess) {
      console.error('Bot does not have access to channel');
      return;
    }

    // Send message
    await telegramService.sendMessage(botToken, channelId, 'Test message');
    console.log('Message sent successfully');
  } catch (error) {
    if (error.message.includes('rate limit')) {
      console.error('Rate limit exceeded, retry later');
    } else if (error.message.includes('Invalid token')) {
      console.error('Token is invalid or expired');
    } else if (error.message.includes('access')) {
      console.error('Bot lacks necessary permissions');
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
}

export {
  exampleUsage,
  notifyNewEvent,
  notifyNewOffer,
  notifyTimeBankRequest,
  notifyGroupBuy,
  notifyHousing,
  exampleWithErrorHandling,
};
