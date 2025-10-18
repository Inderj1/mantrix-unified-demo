import React from 'react';
import {
  WbSunny as WeatherIcon,
  TrendingUp as EconomicIcon,
  LocalShipping as TradeIcon,
  BusinessCenter as CompetitorIcon,
  ThumbUp as SocialIcon,
  Newspaper as NewsIcon,
  Campaign as MarketingIcon,
  Inventory as SupplyChainIcon,
  Gavel as RegulatoryIcon,
  Lightbulb as TechnologyIcon,
  Bolt as EnergyIcon,
  People as LaborIcon,
  Public as GeopoliticalIcon,
  HealthAndSafety as HealthIcon,
  Business as RealEstateIcon,
} from '@mui/icons-material';

/**
 * Market Signal Categories Configuration
 * Defines all 15 market intelligence categories with icons, colors, and metadata
 */

export const MARKET_CATEGORIES = {
  weather: {
    id: 'weather',
    name: 'Weather & Climate',
    icon: WeatherIcon,
    emoji: '🌤️',
    color: '#2196F3',
    description: 'Hurricanes, droughts, temperature anomalies, natural disasters',
    subcategories: ['Hurricanes', 'Droughts', 'Temperature Anomalies', 'Natural Disasters', 'Agricultural Impact']
  },
  economic: {
    id: 'economic',
    name: 'Economic Indicators',
    icon: EconomicIcon,
    emoji: '📊',
    color: '#4CAF50',
    description: 'GDP, inflation, interest rates, currency exchange, commodity prices',
    subcategories: ['GDP & Inflation', 'Interest Rates', 'Currency Exchange', 'Commodity Prices', 'Stock Indices']
  },
  tariffs: {
    id: 'tariffs',
    name: 'Tariffs & Trade',
    icon: TradeIcon,
    emoji: '🚢',
    color: '#00BCD4',
    description: 'Import/export tariffs, trade agreements, customs, sanctions',
    subcategories: ['Import Tariffs', 'Export Tariffs', 'Trade Agreements', 'Customs Regulations', 'Shipping Costs']
  },
  competitors: {
    id: 'competitors',
    name: 'Competitor Intelligence',
    icon: CompetitorIcon,
    emoji: '🎯',
    color: '#FF5722',
    description: 'Product launches, pricing, market share, M&A activity',
    subcategories: ['Product Launches', 'Pricing Changes', 'Market Share', 'M&A Activity', 'Customer Reviews']
  },
  social: {
    id: 'social',
    name: 'Social Media & Trends',
    icon: SocialIcon,
    emoji: '📱',
    color: '#E91E63',
    description: 'Brand sentiment, viral trends, influencers, demographics',
    subcategories: ['Brand Sentiment', 'Viral Trends', 'Influencer Campaigns', 'Trending Products', 'Demographics']
  },
  news: {
    id: 'news',
    name: 'News & Media',
    icon: NewsIcon,
    emoji: '📰',
    color: '#9C27B0',
    description: 'Industry news, regulatory announcements, corporate news, crises',
    subcategories: ['Industry News', 'Regulatory News', 'Corporate News', 'Crisis Events', 'Tech Disruption']
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing & Advertising',
    icon: MarketingIcon,
    emoji: '📢',
    color: '#FF9800',
    description: 'Ad spend, campaign ROI, search trends, digital marketing',
    subcategories: ['Ad Spend', 'Campaign ROI', 'Search Trends', 'Email Marketing', 'Digital Performance']
  },
  supplyChain: {
    id: 'supplyChain',
    name: 'Supply Chain & Logistics',
    icon: SupplyChainIcon,
    emoji: '📦',
    color: '#795548',
    description: 'Port congestion, supplier health, transportation costs, inventory',
    subcategories: ['Port Congestion', 'Supplier Health', 'Transportation Costs', 'Inventory Levels', 'Lead Times']
  },
  regulatory: {
    id: 'regulatory',
    name: 'Regulatory & Legal',
    icon: RegulatoryIcon,
    emoji: '⚖️',
    color: '#607D8B',
    description: 'New regulations, environmental mandates, labor laws, tax policy',
    subcategories: ['New Regulations', 'Environmental', 'Labor Laws', 'Tax Policy', 'Data Privacy']
  },
  technology: {
    id: 'technology',
    name: 'Technology & Innovation',
    icon: TechnologyIcon,
    emoji: '💡',
    color: '#FFC107',
    description: 'Emerging tech, patents, R&D spending, automation trends',
    subcategories: ['Emerging Tech', 'Patent Activity', 'R&D Spending', 'Disruptive Tech', 'Automation']
  },
  energy: {
    id: 'energy',
    name: 'Energy & Sustainability',
    icon: EnergyIcon,
    emoji: '⚡',
    color: '#8BC34A',
    description: 'Energy prices, renewable adoption, carbon pricing, ESG',
    subcategories: ['Energy Prices', 'Renewable Energy', 'Carbon Pricing', 'ESG Requirements', 'Green Regulations']
  },
  labor: {
    id: 'labor',
    name: 'Labor & Workforce',
    icon: LaborIcon,
    emoji: '👥',
    color: '#3F51B5',
    description: 'Labor shortages, wage inflation, remote work, strikes',
    subcategories: ['Labor Shortages', 'Wage Inflation', 'Remote Work', 'Labor Strikes', 'Talent Competition']
  },
  geopolitical: {
    id: 'geopolitical',
    name: 'Geopolitical Events',
    icon: GeopoliticalIcon,
    emoji: '🌍',
    color: '#009688',
    description: 'Political stability, conflicts, diplomatic relations, security',
    subcategories: ['Political Stability', 'Conflicts', 'Diplomatic Relations', 'Migration', 'Security Threats']
  },
  health: {
    id: 'health',
    name: 'Health & Pandemic',
    icon: HealthIcon,
    emoji: '🏥',
    color: '#F44336',
    description: 'Disease outbreaks, healthcare costs, public health policies',
    subcategories: ['Disease Outbreaks', 'Healthcare Costs', 'Public Health Policies', 'Workplace Safety']
  },
  realEstate: {
    id: 'realEstate',
    name: 'Real Estate & Facilities',
    icon: RealEstateIcon,
    emoji: '🏢',
    color: '#673AB7',
    description: 'Commercial rates, property values, construction costs, zoning',
    subcategories: ['Commercial Rates', 'Property Values', 'Construction Costs', 'Zoning Changes']
  },
};

/**
 * Severity levels for market signals
 */
export const SEVERITY_LEVELS = {
  CRITICAL: {
    label: 'CRITICAL',
    color: '#f44336',
    bgColor: '#ffebee',
    icon: '🔴',
    threshold: 80,
  },
  HIGH: {
    label: 'HIGH',
    color: '#ff9800',
    bgColor: '#fff3e0',
    icon: '🟠',
    threshold: 60,
  },
  MEDIUM: {
    label: 'MEDIUM',
    color: '#ffc107',
    bgColor: '#fffde7',
    icon: '🟡',
    threshold: 40,
  },
  LOW: {
    label: 'LOW',
    color: '#4caf50',
    bgColor: '#e8f5e9',
    icon: '🟢',
    threshold: 0,
  },
};

/**
 * Get severity level based on numeric score
 */
export const getSeverityLevel = (score) => {
  if (score >= 80) return SEVERITY_LEVELS.CRITICAL;
  if (score >= 60) return SEVERITY_LEVELS.HIGH;
  if (score >= 40) return SEVERITY_LEVELS.MEDIUM;
  return SEVERITY_LEVELS.LOW;
};

/**
 * Get all categories as an array
 */
export const getCategoriesArray = () => {
  return Object.values(MARKET_CATEGORIES);
};

/**
 * Get category by ID
 */
export const getCategoryById = (id) => {
  return MARKET_CATEGORIES[id];
};

export default MARKET_CATEGORIES;
