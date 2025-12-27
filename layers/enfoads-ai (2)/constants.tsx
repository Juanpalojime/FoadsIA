
import { Campaign, Generation } from './types';

export const CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: "Nike Summer '24",
    assetsCount: 24,
    thumbnails: [
      'https://picsum.photos/seed/nike1/200',
      'https://picsum.photos/seed/nike2/200',
      'https://picsum.photos/seed/nike3/200'
    ]
  },
  {
    id: '2',
    name: "Adidas Promo",
    assetsCount: 8,
    thumbnails: [
      'https://picsum.photos/seed/adidas1/200'
    ]
  },
  {
    id: '3',
    name: "Puma Rebrand",
    assetsCount: 15,
    thumbnails: [
      'https://picsum.photos/seed/puma1/200'
    ]
  }
];

export const GENERATIONS: Generation[] = [
  {
    id: 'g1',
    title: 'Nike Vapor Max AI',
    timeAgo: '2 mins ago',
    status: 'Ready',
    imageUrl: 'https://picsum.photos/seed/gen1/400/500'
  },
  {
    id: 'g2',
    title: 'Adidas Ultra Boost v2',
    timeAgo: '15 mins ago',
    status: 'Ready',
    imageUrl: 'https://picsum.photos/seed/gen2/400/500'
  },
  {
    id: 'g3',
    title: 'Summer Vibes Video',
    timeAgo: 'Generating...',
    status: 'Processing'
  },
  {
    id: 'g4',
    title: 'Puma Classic Remake',
    timeAgo: '1 hour ago',
    status: 'Ready',
    imageUrl: 'https://picsum.photos/seed/gen4/400/500'
  },
  {
    id: 'g5',
    title: 'Urban Streetwear #4',
    timeAgo: '3 hours ago',
    status: 'Ready',
    imageUrl: 'https://picsum.photos/seed/gen5/400/500'
  }
];
