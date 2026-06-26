import 'package:flutter/material.dart';

class TrainingCategory {
  final String id;
  final String title;
  final String duration;
  final String level;
  final String description;
  final List<String> learningPoints;
  final IconData icon;
  final Color color;
  final String imagePath;

  const TrainingCategory({
    required this.id,
    required this.title,
    required this.duration,
    required this.level,
    required this.description,
    required this.learningPoints,
    required this.icon,
    required this.color,
    required this.imagePath,
  });
}

final List<TrainingCategory> mockTrainingCategories = [
  const TrainingCategory(
    id: 'polyhouse',
    title: 'Polyhouse Training',
    duration: '5 DAYS',
    level: 'All Levels',
    description: 'Complete training on polyhouse construction, operation, and crop management. Master industrial-grade setup, climate control, and commercial profitability.',
    learningPoints: [
      'Structure Design & Installation',
      'Climate Control Systems',
      'Crop Selection & Management',
      'Fertigation & Drip Irrigation',
      'Business Planning & ROI',
    ],
    icon: Icons.house_siding_rounded,
    color: Color(0xFF10B981),
    imagePath: 'assets/categories/Polyhouse Training.jpeg',
  ),
  const TrainingCategory(
    id: 'hydroponics',
    title: 'Hydroponics Training',
    duration: '5 DAYS',
    level: 'Beginner to Advanced',
    description: 'Hands-on training in soilless farming techniques and commercial NFT/DWC system setup. Learn to grow high-value crops year-round without soil.',
    learningPoints: [
      'NFT & DWC System Setup',
      'Nutrient Solution Management',
      'pH & EC Balancing',
      'Commercial Crop Scheduling',
      'Market & Sales Strategy',
    ],
    icon: Icons.water_drop_rounded,
    color: Color(0xFF0EA5E9),
    imagePath: 'assets/categories/Hydroponics Training.jpeg',
  ),
  const TrainingCategory(
    id: 'vertical_farming',
    title: 'Vertical Farming Training',
    duration: '3 DAYS',
    level: 'Intermediate',
    description: 'Mastering light physics and modular layer design for high-density urban agriculture — grow 10× more in the same footprint.',
    learningPoints: [
      'Multi-Layer Farm Design',
      'LED Lighting Systems',
      'Climate Automation',
      'Space Optimization',
      'Cost-Benefit Analysis',
    ],
    icon: Icons.layers_rounded,
    color: Color(0xFF6366F1),
    imagePath: 'assets/categories/Vertical Farming Training.jpeg',
  ),
  const TrainingCategory(
    id: 'mushroom_cultivation',
    title: 'Mushroom Cultivation',
    duration: '3 DAYS',
    level: 'Beginner Friendly',
    description: 'Learn the complete lifecycle of commercial mushroom cultivation including spawn making, substrate preparation, and climate control.',
    learningPoints: [
      'Substrate Preparation & Sterilization',
      'Spawn Run & Incubation',
      'Fruiting & Climate Control',
      'Harvesting & Packaging',
      'Disease & Pest Management',
    ],
    icon: Icons.grass_rounded,
    color: Color(0xFFF59E0B),
    imagePath: 'assets/categories/Mushroom Cultivation.jpg',
  ),
  const TrainingCategory(
    id: 'aquaculture',
    title: 'Aquaculture & Fish Farming',
    duration: '5 DAYS',
    level: 'All Levels',
    description: 'Comprehensive training on modern fish farming techniques, water quality management, and high-yield aquaculture practices.',
    learningPoints: [
      'Pond & Tank Preparation',
      'Water Quality Management',
      'Fish Nutrition & Feeding',
      'Disease Control',
      'Harvesting & Marketing',
    ],
    icon: Icons.phishing_rounded,
    color: Color(0xFF3B82F6),
    imagePath: 'assets/categories/Aquaculture & Fish Farming.jpeg',
  ),
  const TrainingCategory(
    id: 'biofloc',
    title: 'Biofloc Technology Training',
    duration: '3 DAYS',
    level: 'Intermediate',
    description: 'Master the innovative biofloc system to maximize fish production in limited space with zero water exchange.',
    learningPoints: [
      'Biofloc System Setup',
      'C/N Ratio Management',
      'Probiotics Application',
      'Aeration & Water Dynamics',
      'Floc Volume Monitoring',
    ],
    icon: Icons.bubble_chart_rounded,
    color: Color(0xFF8B5CF6),
    imagePath: 'assets/categories/Biofloc Technology Training.jpeg',
  ),
  const TrainingCategory(
    id: 'goat_livestock',
    title: 'Goat & Livestock Farming',
    duration: '4 DAYS',
    level: 'All Levels',
    description: 'Learn scientific management, breeding, and health care practices for profitable commercial goat and livestock farming.',
    learningPoints: [
      'Breed Selection & Housing',
      'Feed & Fodder Management',
      'Breeding Strategies',
      'Vaccination & Healthcare',
      'Farm Economics',
    ],
    icon: Icons.pets_rounded,
    color: Color(0xFFEF4444),
    imagePath: 'assets/categories/Goat & Livestock Farming.jpeg',
  ),
  const TrainingCategory(
    id: 'microgreens',
    title: 'Microgreens Production',
    duration: '2 DAYS',
    level: 'Beginner Friendly',
    description: 'Start your own urban farm by mastering the quick-turnaround, high-value production of nutritious microgreens.',
    learningPoints: [
      'Seed Selection & Sowing',
      'Growing Mediums',
      'Lighting & Climate Requirements',
      'Harvesting & Packaging',
      'B2B Sales Strategies',
    ],
    icon: Icons.eco_rounded,
    color: Color(0xFF14B8A6),
    imagePath: 'assets/categories/Microgreens Production.jpeg',
  ),
  const TrainingCategory(
    id: 'drip_irrigation',
    title: 'Drip Irrigation & Farm Eng.',
    duration: '3 DAYS',
    level: 'Intermediate',
    description: 'Detailed training on installing, operating, and maintaining modern drip irrigation systems to optimize water and fertilizer use.',
    learningPoints: [
      'System Design & Layout',
      'Pump & Filter Selection',
      'Fertigation Equipment',
      'Maintenance & Troubleshooting',
      'Water Efficiency Tracking',
    ],
    icon: Icons.water_rounded,
    color: Color(0xFF06B6D4),
    imagePath: 'assets/categories/Drip Irrigation & Farm Engineering.jpeg',
  ),
  const TrainingCategory(
    id: 'agri_entrepreneur',
    title: 'Agri Entrepreneur Masterclass',
    duration: '5 DAYS',
    level: 'Advanced',
    description: 'Transform your farming skills into a scalable business. Learn business planning, funding, branding, and modern agri-marketing.',
    learningPoints: [
      'Business Plan Development',
      'Government Subsidies & Funding',
      'Supply Chain Management',
      'Branding & D2C Marketing',
      'Legal & Compliance',
    ],
    icon: Icons.business_rounded,
    color: Color(0xFFF43F5E),
    imagePath: 'assets/categories/Agri Entrepreneur Masterclass.png',
  ),
];
