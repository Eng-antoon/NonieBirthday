/**
 * Main Site Data Configuration
 * Contains all content and configuration for the birthday surprise website
 */

export const siteData = {
  // SiteContent configuration
  config: {
    personalName: "Marnona", // Marnona | Nono | Nonie
    heroMessage: "Welcome to a celebration of you, beautiful. Every moment we've shared has been a gift, and today we celebrate the amazing person you are.",
    colorTheme: {
      primary: "#F8BBD9",   // Blush pink
      secondary: "#FFF8E1", // Cream
      accent: "#E8B4CB"     // Rose gold
    }
  },

  // PhotoGallery collection
  photos: [
    {
      id: "birthday-photo-1",
      caption: "Our first adventure together - the beginning of something beautiful",
      order: 1,
      altText: "Tony and Marnona smiling together outdoors on their first date"
    },
    {
      id: "birthday-photo-2",
      caption: "That perfect sunset moment when everything felt right",
      order: 2,
      altText: "Couple watching sunset by the water, silhouetted against golden sky"
    },
    {
      id: "birthday-photo-3",
      caption: "Dancing in the kitchen like nobody's watching",
      order: 3,
      altText: "Tony and Marnona dancing together in the kitchen, laughing"
    },
    {
      id: "birthday-photo-4",
      caption: "Your smile lights up every room you enter",
      order: 4,
      altText: "Close-up of Marnona smiling brightly at camera"
    },
    {
      id: "birthday-photo-5",
      caption: "Making memories wherever we go",
      order: 5,
      altText: "Couple taking a selfie during a trip, both making funny faces"
    },
    {
      id: "birthday-photo-6",
      caption: "Quiet moments are just as precious as the big ones",
      order: 6,
      altText: "Tony and Marnona cuddling on couch watching a movie"
    }
  ],

  // VideoMessage configuration
  video: {
    title: "A Special Message Just For You",
    videoUrl: "https://firebasestorage.googleapis.com/v0/b/birthday-project/o/special-message.mp4?alt=media&token=placeholder-token",
    thumbnailId: "video-thumbnail-birthday",
    duration: 150 // 2.5 minutes
  },

  // MessageCards collection
  messages: [
    {
      id: "msg-1",
      messageText: "You are the light that brightens every single day. Your laugh is my favorite sound, and your smile is my favorite sight.",
      animationType: "fade",
      scrollTrigger: 75,
      backgroundColor: "#FFF8E1",
      order: 1
    },
    {
      id: "msg-2",
      messageText: "Every moment with you is a treasure I hold close to my heart. You make the ordinary feel extraordinary.",
      animationType: "flip",
      scrollTrigger: 80,
      backgroundColor: "#F8BBD9",
      order: 2
    },
    {
      id: "msg-3",
      messageText: "Your kindness touches everyone around you. You have this incredible way of making people feel seen and valued.",
      animationType: "slide",
      scrollTrigger: 85,
      backgroundColor: "#E8B4CB",
      order: 3
    },
    {
      id: "msg-4",
      messageText: "Thank you for being exactly who you are - beautiful, strong, compassionate, and uniquely wonderful.",
      animationType: "bounce",
      scrollTrigger: 90,
      backgroundColor: "#FFF8E1",
      order: 4
    },
    {
      id: "msg-5",
      messageText: "Today we celebrate you, but honestly, I celebrate you every single day. Happy Birthday, my amazing Marnona! 🎉💕",
      animationType: "fade",
      scrollTrigger: 95,
      backgroundColor: "#F8BBD9",
      order: 5
    }
  ]
};