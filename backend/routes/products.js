const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

const productQueries = [
  { category: 'Rice', terms: 'basmati rice' },
  { category: 'Pulses', terms: 'lentils dal pulses' },
  { category: 'Vegetables', terms: 'organic vegetables' },
  { category: 'Fruits', terms: 'fresh fruits' },
  { category: 'Dairy', terms: 'milk yogurt cheese butter' },
  { category: 'Bakery', terms: 'bread cookies cake' },
  { category: 'Oils', terms: 'cooking oil olive oil' },
  { category: 'Spices', terms: 'spices masala herbs' },
  { category: 'Breakfast', terms: 'cereal oats muesli' },
  { category: 'Dry Fruits', terms: 'almonds nuts' },
  { category: 'Snacks', terms: 'chips biscuits snacks' },
  { category: 'Beverages', terms: 'juice tea coffee soda' },
  { category: 'Frozen Foods', terms: 'frozen pizza peas ice cream' },
  { category: 'Personal Care', terms: 'shampoo soap toothpaste' },
  { category: 'Household', terms: 'detergent cleaner tissues' },
  { category: 'Pet Care', terms: 'dog food cat food' },
];

let productCache = {
  expiresAt: 0,
  products: [],
};

const fallbackImages = {
  Rice: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=900',
  Pulses: 'https://images.pexels.com/photos/7421513/pexels-photo-7421513.jpeg?auto=compress&cs=tinysrgb&w=900',
  Vegetables: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=900',
  Fruits: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=900',
  Dairy: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=900',
  Bakery: 'https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=900',
  Oils: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900',
  Spices: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=900',
  Breakfast: 'https://images.pexels.com/photos/543730/pexels-photo-543730.jpeg?auto=compress&cs=tinysrgb&w=900',
  'Dry Fruits': 'https://images.pexels.com/photos/3997459/pexels-photo-3997459.jpeg?auto=compress&cs=tinysrgb&w=900',
  Snacks: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=900',
  Beverages: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=900',
};

const getPrice = (code, category) => {
  const base = String(code || category).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const ranges = {
    Rice: [75, 240],
    Pulses: [90, 210],
    Vegetables: [25, 120],
    Fruits: [45, 220],
    Dairy: [45, 180],
    Bakery: [35, 130],
    Oils: [140, 390],
    Spices: [35, 160],
    Breakfast: [80, 260],
    'Dry Fruits': [180, 520],
    Snacks: [35, 180],
    Beverages: [45, 220],
  };
  const [min, max] = ranges[category] || [40, 220];
  return min + (base % (max - min));
};

const normalizeProduct = (product, category, index) => {
  const name = product.product_name || product.generic_name || `${category} Product`;
  const code = product.code || `${category}-${index}`;
  const brand = product.brands?.split(',')[0]?.trim() || 'Open Food Facts';
  const unit = product.quantity || product.serving_size || '1 pack';
  const image = product.image_front_url || product.image_url || product.image_small_url || fallbackImages[category];
  const tags = [
    category.toLowerCase(),
    ...(product.categories_tags || []).slice(0, 4).map((tag) => tag.replace('en:', '').replaceAll('-', ' ')),
  ];

  return {
    externalId: `off-${code}`,
    source: 'openfoodfacts',
    name,
    description: product.generic_name || `${name} from ${brand}. Public grocery product details provided by Open Food Facts.`,
    price: getPrice(code, category),
    category,
    unit,
    brand,
    origin: product.origins || product.countries || 'Public food database',
    rating: Number((4.1 + (index % 8) / 10).toFixed(1)),
    discount: index % 3 === 0 ? 10 + (index % 8) : index % 4 === 0 ? 6 : 0,
    tags,
    image,
    stock: 40 + (index * 7) % 160,
  };
};

const fetchOpenFoodFactsProducts = async ({ category, terms }) => {
  const params = new URLSearchParams({
    search_terms: terms,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '20',
    fields: 'code,product_name,generic_name,brands,categories_tags,image_front_url,image_url,image_small_url,quantity,serving_size,origins,countries',
  });

  const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params.toString()}`, {
    headers: {
      'User-Agent': 'GreenBasket/1.0 (student MERN grocery project)',
    },
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts request failed for ${category}`);
  }

  const data = await response.json();
  return (data.products || [])
    .filter((product) => product.product_name || product.generic_name)
    .slice(0, 20)
    .map((product, index) => normalizeProduct(product, category, index));
};

const saveProducts = async (items) => {
  const categoryImages = {
    'Vegetables': 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=900',
    'Fruits': 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=900',
    'Dairy': 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=900',
    'Bakery': 'https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=900',
    'Rice': 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=900',
    'Pulses': 'https://images.pexels.com/photos/128402/pexels-photo-128402.jpeg?auto=compress&cs=tinysrgb&w=900',
    'Oils': 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900',
    'Beverages': 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=900',
    'Snacks': 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=900',
    'Household': 'https://images.pexels.com/photos/4049517/pexels-photo-4049517.jpeg?auto=compress&cs=tinysrgb&w=900',
    'Pet Care': 'https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&w=900',
    'Personal Care': 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900',
    'Frozen Foods': 'https://images.pexels.com/photos/255469/pexels-photo-255469.jpeg?auto=compress&cs=tinysrgb&w=900'
  };

  const processed = items.map(item => ({
    ...item,
    image: item.image || categoryImages[item.category] || 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=900'
  }));

  await Promise.all(processed.map((product) => Product.findOneAndUpdate(
    { externalId: product.externalId },
    product,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )));
  return Product.find({}).sort({ createdAt: -1 });
};

const getPublicProducts = async () => {
  if (Date.now() < productCache.expiresAt && productCache.products.length) {
    return productCache.products;
  }

  const savedProducts = await Product.find({}).sort({ createdAt: -1 });
  if (savedProducts.length) {
    productCache = {
      expiresAt: Date.now() + 15 * 60 * 1000,
      products: savedProducts,
    };
    return savedProducts;
  }

  try {
    const results = await Promise.allSettled(productQueries.map(fetchOpenFoodFactsProducts));
    const products = results
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => result.value);

    if (products.length) {
      const saved = await saveProducts(products);
      productCache = {
        expiresAt: Date.now() + 60 * 60 * 1000,
        products: saved,
      };
      return saved;
    }
  } catch (error) {
    console.log(error.message);
  }

  return [];
};

router.get('/', async (req, res) => {
  const products = await getPublicProducts();
  res.json(products);
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

const seedData = [
  // RICE & GRAINS (15)
  { externalId: 's-rice-1', name: 'Premium Basmati Rice', price: 180, category: 'Rice', unit: '1kg', brand: 'India Gate', image: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Long-grain aged basmati rice.' },
  { externalId: 's-rice-2', name: 'Organic Brown Rice', price: 120, category: 'Rice', unit: '1kg', brand: '24 Mantra', image: 'https://images.pexels.com/photos/4187620/pexels-photo-4187620.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Whole grain brown rice.' },
  { externalId: 's-rice-3', name: 'Jasmine Fragrant Rice', price: 150, category: 'Rice', unit: '1kg', brand: 'Royal', image: 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Aromatic jasmine rice.' },
  { externalId: 's-rice-4', name: 'Sona Masoori Rice', price: 90, category: 'Rice', unit: '5kg', brand: 'Daawat', image: 'https://images.pexels.com/photos/4110255/pexels-photo-4110255.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Lightweight and aromatic medium-grain rice.' },
  { externalId: 's-rice-5', name: 'Organic Quinoa', price: 350, category: 'Rice', unit: '500g', brand: 'Organic India', image: 'https://images.pexels.com/photos/6157052/pexels-photo-6157052.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Protein-rich superfood grain.' },
  { externalId: 's-rice-6', name: 'Black Forbidden Rice', price: 220, category: 'Rice', unit: '500g', brand: 'Lotus Foods', image: 'https://images.pexels.com/photos/4187620/pexels-photo-4187620.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Nutrient-dense heirloom rice.' },
  { externalId: 's-rice-7', name: 'Arborio Risotto Rice', price: 190, category: 'Rice', unit: '1kg', brand: 'Colavita', image: 'https://images.pexels.com/photos/4110226/pexels-photo-4110226.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'High-starch rice for creamy risotto.' },
  { externalId: 's-rice-8', name: 'Red Matta Rice', price: 110, category: 'Rice', unit: '1kg', brand: 'Nirapara', image: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Traditional Kerala red rice.' },
  { externalId: 's-rice-9', name: 'Wild Rice Mix', price: 280, category: 'Rice', unit: '500g', brand: 'Lundberg', image: 'https://images.pexels.com/photos/4110228/pexels-photo-4110228.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Blend of wild and long-grain rice.' },
  { externalId: 's-rice-10', name: 'Poha (Flattened Rice)', price: 55, category: 'Rice', unit: '1kg', brand: 'Fortune', image: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Thick beaten rice for breakfast.' },
  { externalId: 's-rice-11', name: 'Idli Rice', price: 75, category: 'Rice', unit: '1kg', brand: 'Aashirvaad', image: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Short-grain rice for idli batter.' },
  { externalId: 's-rice-12', name: 'Bulgur Wheat', price: 130, category: 'Rice', unit: '500g', brand: 'Bob Red Mill', image: 'https://images.pexels.com/photos/6157052/pexels-photo-6157052.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Cracked wheat for tabbouleh.' },
  { externalId: 's-rice-13', name: 'Couscous', price: 145, category: 'Rice', unit: '500g', brand: 'Near East', image: 'https://images.pexels.com/photos/6157044/pexels-photo-6157044.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Semolina pearls for Mediterranean dishes.' },
  { externalId: 's-rice-14', name: 'Pearl Millet (Bajra)', price: 65, category: 'Rice', unit: '1kg', brand: 'Organic Tattva', image: 'https://images.pexels.com/photos/6157052/pexels-photo-6157052.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Ancient grain rich in minerals.' },
  { externalId: 's-rice-15', name: 'Finger Millet (Ragi)', price: 70, category: 'Rice', unit: '1kg', brand: 'MTR', image: 'https://images.pexels.com/photos/6157052/pexels-photo-6157052.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Calcium-rich millet for porridge.' },

  // PULSES & LENTILS (15)
  { externalId: 's-pul-1', name: 'Yellow Moong Dal', price: 95, category: 'Pulses', unit: '500g', brand: 'Tata Sampann', image: 'https://images.pexels.com/photos/128402/pexels-photo-128402.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Unpolished yellow moong dal.' },
  { externalId: 's-pul-2', name: 'Red Masoor Dal', price: 85, category: 'Pulses', unit: '500g', brand: 'Organic Tattva', image: 'https://images.pexels.com/photos/128403/pexels-photo-128403.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Whole red lentils.' },
  { externalId: 's-pul-3', name: 'Chana Dal', price: 75, category: 'Pulses', unit: '500g', brand: 'Tata Sampann', image: 'https://images.pexels.com/photos/128402/pexels-photo-128402.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Split chickpeas.' },
  { externalId: 's-pul-4', name: 'Urad Dal White', price: 110, category: 'Pulses', unit: '500g', brand: 'Organic India', image: 'https://images.pexels.com/photos/128402/pexels-photo-128402.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Skinned white lentils.' },
  { externalId: 's-pul-5', name: 'Toor Dal Premium', price: 125, category: 'Pulses', unit: '1kg', brand: 'Tata Sampann', image: 'https://images.pexels.com/photos/128402/pexels-photo-128402.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Arhar dal for daily sample.' },
  { externalId: 's-pul-6', name: 'Black Urad Dal Whole', price: 95, category: 'Pulses', unit: '500g', brand: 'Organic Tattva', image: 'https://images.pexels.com/photos/128403/pexels-photo-128403.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Whole black gram for Dal Makhani.' },
  { externalId: 's-pul-7', name: 'Kabuli Chana (Chickpeas)', price: 140, category: 'Pulses', unit: '1kg', brand: 'Tata Sampann', image: 'https://images.pexels.com/photos/1393382/pexels-photo-1393382.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Large white chickpeas.' },
  { externalId: 's-pul-8', name: 'Rajma Chitra', price: 160, category: 'Pulses', unit: '1kg', brand: 'Organic India', image: 'https://images.pexels.com/photos/1393383/pexels-photo-1393383.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Spotted kidney beans.' },
  { externalId: 's-pul-9', name: 'Green Moong Whole', price: 105, category: 'Pulses', unit: '500g', brand: 'Tata Sampann', image: 'https://images.pexels.com/photos/128402/pexels-photo-128402.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Whole green moong beans.' },
  { externalId: 's-pul-10', name: 'Black Eyed Beans (Lobia)', price: 90, category: 'Pulses', unit: '500g', brand: 'Organic Tattva', image: 'https://images.pexels.com/photos/128403/pexels-photo-128403.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'High-protein black eyed peas.' },
  { externalId: 's-pul-11', name: 'Soyabean Chunks', price: 65, category: 'Pulses', unit: '200g', brand: 'Fortune', image: 'https://images.pexels.com/photos/128402/pexels-photo-128402.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Vegetarian protein chunks.' },
  { externalId: 's-pul-12', name: 'Moth Beans', price: 115, category: 'Pulses', unit: '500g', brand: 'Organic India', image: 'https://images.pexels.com/photos/128403/pexels-photo-128403.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Traditional Indian sprout beans.' },
  { externalId: 's-pul-13', name: 'Horse Gram (Kulthi)', price: 80, category: 'Pulses', unit: '500g', brand: 'Organic Tattva', image: 'https://images.pexels.com/photos/128403/pexels-photo-128403.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Superfood lentil for weight loss.' },
  { externalId: 's-pul-14', name: 'Green Peas Dry', price: 70, category: 'Pulses', unit: '500g', brand: 'Tata Sampann', image: 'https://images.pexels.com/photos/128402/pexels-photo-128402.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Dried whole green peas.' },
  { externalId: 's-pul-15', name: 'Val Dal (Field Beans)', price: 130, category: 'Pulses', unit: '500g', brand: 'Organic India', image: 'https://images.pexels.com/photos/128403/pexels-photo-128403.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Traditional broad beans.' },

  // VEGETABLES (15)
  { externalId: 's-veg-1', name: 'Fresh Roma Tomatoes', price: 40, category: 'Vegetables', unit: '1kg', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Firm Roma tomatoes.' },
  { externalId: 's-veg-2', name: 'Organic Red Onions', price: 35, category: 'Vegetables', unit: '1kg', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/533342/pexels-photo-533342.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Crisp red onions.' },
  { externalId: 's-veg-3', name: 'Fresh Baby Spinach', price: 30, category: 'Vegetables', unit: '250g', brand: 'GreenEarth', image: 'https://images.pexels.com/photos/1143754/pexels-photo-1143754.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Tender baby spinach.' },
  { externalId: 's-veg-4', name: 'English Cucumber', price: 45, category: 'Vegetables', unit: '1pc', brand: 'GreenEarth', image: 'https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Seedless crisp cucumber.' },
  { externalId: 's-veg-5', name: 'Bell Pepper Trio', price: 120, category: 'Vegetables', unit: '500g', brand: 'GreenEarth', image: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Red, yellow and green peppers.' },
  { externalId: 's-veg-6', name: 'Broccoli Florets', price: 90, category: 'Vegetables', unit: '250g', brand: 'GreenEarth', image: 'https://images.pexels.com/photos/1359326/pexels-photo-1359326.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Fresh nutrient-rich broccoli.' },
  { externalId: 's-veg-7', name: 'Sweet Corn Cobs', price: 50, category: 'Vegetables', unit: '2pcs', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Farm fresh sweet corn.' },
  { externalId: 's-veg-8', name: 'Purple Eggplant', price: 40, category: 'Vegetables', unit: '500g', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/768090/pexels-photo-768090.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Glossy fresh eggplants.' },
  { externalId: 's-veg-9', name: 'Ginger Root', price: 25, category: 'Vegetables', unit: '100g', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/1337660/pexels-photo-1337660.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Pungent fresh ginger.' },
  { externalId: 's-veg-10', name: 'Green Chilies', price: 15, category: 'Vegetables', unit: '100g', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/4198139/pexels-photo-4198139.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Spicy fresh chilies.' },
  { externalId: 's-veg-11', name: 'Cauliflower', price: 45, category: 'Vegetables', unit: '1pc', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/1390433/pexels-photo-1390433.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Compact white cauliflower.' },
  { externalId: 's-veg-12', name: 'Carrots Orange', price: 60, category: 'Vegetables', unit: '1kg', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Crunchy orange carrots.' },
  { externalId: 's-veg-13', name: 'Potato (New Crop)', price: 30, category: 'Vegetables', unit: '1kg', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/144248/pexels-photo-144248.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Fresh mud-free potatoes.' },
  { externalId: 's-veg-14', name: 'Garlic Bulbs', price: 50, category: 'Vegetables', unit: '250g', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/1390433/pexels-photo-1390433.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Strong aromatic garlic.' },
  { externalId: 's-veg-15', name: 'Mushrooms Button', price: 55, category: 'Vegetables', unit: '200g', brand: 'UrbanFarm', image: 'https://images.pexels.com/photos/144248/pexels-photo-144248.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Fresh white button mushrooms.' },

  // FRUITS (15)
  { externalId: 's-fru-1', name: 'Royal Gala Apples', price: 180, category: 'Fruits', unit: '1kg', brand: 'GlobalPick', image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Sweet crunchy Gala apples.' },
  { externalId: 's-fru-2', name: 'Fresh Cavendish Bananas', price: 60, category: 'Fruits', unit: '1 dozen', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Ripe yellow bananas.' },
  { externalId: 's-fru-3', name: 'Alphonso Mangoes', price: 850, category: 'Fruits', unit: '1 dozen', brand: 'Ratnagiri', image: 'https://images.pexels.com/photos/2294471/pexels-photo-2294471.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Premium king of mangoes.' },
  { externalId: 's-fru-4', name: 'Hass Avocados', price: 290, category: 'Fruits', unit: '2pcs', brand: 'GlobalPick', image: 'https://images.pexels.com/photos/556414/pexels-photo-556414.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Creamy ripe avocados.' },
  { externalId: 's-fru-5', name: 'Green Seedless Grapes', price: 140, category: 'Fruits', unit: '500g', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Sweet green grapes.' },
  { externalId: 's-fru-6', name: 'Pomegranate Premium', price: 190, category: 'Fruits', unit: '1kg', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/65254/pomegranate-fruit-red-seeds-65254.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Juicy red pomegranates.' },
  { externalId: 's-fru-7', name: 'Fresh Oranges', price: 110, category: 'Fruits', unit: '1kg', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/161559/orange-fruit-vitamins-citrus-161559.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Sweet and tangy oranges.' },
  { externalId: 's-fru-8', name: 'Kiwi Fruit', price: 130, category: 'Fruits', unit: '3pcs', brand: 'Zespri', image: 'https://images.pexels.com/photos/51312/kiwi-fruit-vitamins-healthy-eating-51312.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Nutrient dense kiwis.' },
  { externalId: 's-fru-9', name: 'Red Cherries', price: 450, category: 'Fruits', unit: '250g', brand: 'GlobalPick', image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Fresh sweet cherries.' },
  { externalId: 's-fru-10', name: 'Blueberries', price: 380, category: 'Fruits', unit: '125g', brand: 'GlobalPick', image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Fresh antioxidant berries.' },
  { externalId: 's-fru-11', name: 'Watermelon Whole', price: 90, category: 'Fruits', unit: '1pc', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/1313267/pexels-photo-1313267.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Juicy large watermelon.' },
  { externalId: 's-fru-12', name: 'Papaya Semi-Ripe', price: 70, category: 'Fruits', unit: '1pc', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/594606/pexels-photo-594606.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Sweet digestive fruit.' },
  { externalId: 's-fru-13', name: 'Pineapple Queen', price: 100, category: 'Fruits', unit: '1pc', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/915016/pexels-photo-915016.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Fresh thorny pineapple.' },
  { externalId: 's-fru-14', name: 'Plums Red', price: 160, category: 'Fruits', unit: '500g', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Sweet and tart plums.' },
  { externalId: 's-fru-15', name: 'Pears Nashpati', price: 140, category: 'Fruits', unit: '1kg', brand: 'FarmFresh', image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Crunchy local pears.' },

  // DAIRY (15)
  { externalId: 's-dai-1', name: 'Full Cream Fresh Milk', price: 65, category: 'Dairy', unit: '1L', brand: 'Amul', image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Pasteurized rich milk.' },
  { externalId: 's-dai-2', name: 'Greek Plain Yogurt', price: 45, category: 'Dairy', unit: '200g', brand: 'Epigamia', image: 'https://images.pexels.com/photos/4051607/pexels-photo-4051607.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Thick creamy yogurt.' },
  { externalId: 's-dai-3', name: 'Salted Farm Butter', price: 240, category: 'Dairy', unit: '500g', brand: 'Amul', image: 'https://images.pexels.com/photos/4109943/pexels-photo-4109943.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Delicious cream butter.' },
  { externalId: 's-dai-4', name: 'Paneer (Cottage Cheese)', price: 95, category: 'Dairy', unit: '200g', brand: 'Mother Dairy', image: 'https://images.pexels.com/photos/4109943/pexels-photo-4109943.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Fresh soft paneer blocks.' },
  { externalId: 's-dai-5', name: 'Cheddar Cheese Slices', price: 160, category: 'Dairy', unit: '200g', brand: 'Britannia', image: 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Smooth cheddar slices.' },
  { externalId: 's-dai-6', name: 'Fresh Mozzarella', price: 220, category: 'Dairy', unit: '200g', brand: 'MilkyMist', image: 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Soft cheese for pizza.' },
  { externalId: 's-dai-7', name: 'Low Fat Skimmed Milk', price: 60, category: 'Dairy', unit: '1L', brand: 'Nestle', image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Healthy low calorie milk.' },
  { externalId: 's-dai-8', name: 'Strawberry Milkshake', price: 35, category: 'Dairy', unit: '200ml', brand: 'Hersheys', image: 'https://images.pexels.com/photos/103566/pexels-photo-103566.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Sweet fruity milk drink.' },
  { externalId: 's-dai-9', name: 'Condensed Milk', price: 145, category: 'Dairy', unit: '400g', brand: 'MithaiMate', image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Sweet milk for desserts.' },
  { externalId: 's-dai-10', name: 'Fresh Whipping Cream', price: 180, category: 'Dairy', unit: '250ml', brand: 'Amul', image: 'https://images.pexels.com/photos/4051607/pexels-photo-4051607.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Cream for cakes and fruit.' },
  { externalId: 's-dai-11', name: 'Probiotic Curd', price: 50, category: 'Dairy', unit: '400g', brand: 'Mother Dairy', image: 'https://images.pexels.com/photos/4051607/pexels-photo-4051607.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Gut friendly fresh curd.' },
  { externalId: 's-dai-12', name: 'Clarified Butter (Ghee)', price: 650, category: 'Dairy', unit: '1L', brand: 'Aashirvaad', image: 'https://images.pexels.com/photos/4109943/pexels-photo-4109943.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Pure cow ghee.' },
  { externalId: 's-dai-13', name: 'Blue Cheese', price: 450, category: 'Dairy', unit: '100g', brand: 'Castello', image: 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Aromatic gourmet cheese.' },
  { externalId: 's-dai-14', name: 'Oat Milk (Dairy Free)', price: 290, category: 'Dairy', unit: '1L', brand: 'Oatley', image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Vegan milk alternative.' },
  { externalId: 's-dai-15', name: 'Flavored Greek Yogurt', price: 55, category: 'Dairy', unit: '100g', brand: 'Epigamia', image: 'https://images.pexels.com/photos/4051607/pexels-photo-4051607.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Blueberry greek yogurt.' },

  // BAKERY (15)
  { externalId: 's-bak-1', name: 'Whole Wheat Sourdough', price: 85, category: 'Bakery', unit: '400g', brand: 'TheBakeShop', image: 'https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Crusty sourdough bread.' },
  { externalId: 's-bak-2', name: 'Chocolate Chip Cookies', price: 120, category: 'Bakery', unit: '200g', brand: 'BakersChoice', image: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Chewy Belgian choc cookies.' },
  { externalId: 's-bak-3', name: 'Butter Croissants', price: 150, category: 'Bakery', unit: '2pcs', brand: 'TheBakeShop', image: 'https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Flaky French butter pastries.' },
  { externalId: 's-bak-4', name: 'Multigrain Brown Bread', price: 50, category: 'Bakery', unit: '400g', brand: 'Modern', image: 'https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Healthy high fiber bread.' },
  { externalId: 's-bak-5', name: 'Blueberry Muffins', price: 180, category: 'Bakery', unit: '2pcs', brand: 'BakersChoice', image: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Soft muffins with real berries.' },
  { externalId: 's-bak-6', name: 'Garlic Breadsticks', price: 75, category: 'Bakery', unit: '1pk', brand: 'TheBakeShop', image: 'https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Aromatic garlic buttery sticks.' },
  { externalId: 's-bak-7', name: 'Red Velvet Cake', price: 450, category: 'Bakery', unit: '500g', brand: 'BakersChoice', image: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Premium celebration cake.' },
  { externalId: 's-bak-8', name: 'Pita Bread Whole Wheat', price: 65, category: 'Bakery', unit: '3pcs', brand: 'TheBakeShop', image: 'https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Soft pita for hummus.' },
  { externalId: 's-bak-9', name: 'Oatmeal Raisin Cookies', price: 130, category: 'Bakery', unit: '200g', brand: 'BakersChoice', image: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Classic healthy cookies.' },
  { externalId: 's-bak-10', name: 'Bagel Plain', price: 90, category: 'Bakery', unit: '2pcs', brand: 'TheBakeShop', image: 'https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Dense chewy bagels.' },
  { externalId: 's-bak-11', name: 'Apple Pie Slice', price: 85, category: 'Bakery', unit: '1pc', brand: 'BakersChoice', image: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Sweet spiced apple tart.' },
  { externalId: 's-bak-12', name: 'Burger Buns Sesame', price: 40, category: 'Bakery', unit: '4pcs', brand: 'Modern', image: 'https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Soft buns for burgers.' },
  { externalId: 's-bak-13', name: 'Dinner Rolls', price: 35, category: 'Bakery', unit: '6pcs', brand: 'TheBakeShop', image: 'https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Soft rolls for meals.' },
  { externalId: 's-bak-14', name: 'Fruit Cake Bar', price: 110, category: 'Bakery', unit: '250g', brand: 'Britannia', image: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Cake with dried fruits.' },
  { externalId: 's-bak-15', name: 'Chocolate Donuts', price: 95, category: 'Bakery', unit: '2pcs', brand: 'Dunkin', image: 'https://images.pexels.com/photos/461060/pexels-photo-461060.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Glazed chocolate donuts.' },

  // OILS (15)
  { externalId: 's-oil-1', name: 'Extra Virgin Olive Oil', price: 850, category: 'Oils', unit: '1L', brand: 'Borges', image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900', description: 'Cold pressed olive oil.' },
  { externalId: 's-oil-2', name: 'Cold Pressed Mustard Oil', price: 190, category: 'Oils', unit: '1L', brand: 'Engine', image: 'https://images.pexels.com/photos/5946639/pexels-photo-5946639.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Traditional pungent oil.' },
  { externalId: 's-oil-3', name: 'Sunflower Refined Oil', price: 145, category: 'Oils', unit: '1L', brand: 'Fortune', image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900', description: 'Light cooking oil.' },
  { externalId: 's-oil-4', name: 'Groundnut Cold Pressed Oil', price: 280, category: 'Oils', unit: '1L', brand: '24 Mantra', image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900', description: 'Healthy peanut oil.' },
  { externalId: 's-oil-5', name: 'Rice Bran Oil', price: 165, category: 'Oils', unit: '1L', brand: 'Saffola', image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900', description: 'Heart healthy oil.' },
  { externalId: 's-oil-6', name: 'Coconut Cooking Oil', price: 210, category: 'Oils', unit: '500ml', brand: 'Parachute', image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900', description: 'Pure coconut edible oil.' },
  { externalId: 's-oil-7', name: 'Sesame Oil (Gingelly)', price: 320, category: 'Oils', unit: '1L', brand: 'Idhayam', image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900', description: 'Traditional sesame oil.' },
  { externalId: 's-oil-8', name: 'Avocado Oil', price: 1200, category: 'Oils', unit: '500ml', brand: 'GlobalPick', image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900', description: 'Premium high-smoke oil.' },
  { externalId: 's-oil-9', name: 'Canola Oil', price: 220, category: 'Oils', unit: '1L', brand: 'Hudson', image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900', description: 'Light multipurpose oil.' },
  { externalId: 's-oil-10', name: 'Castor Oil Pure', price: 95, category: 'Oils', unit: '100ml', brand: 'Organic India', image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900', description: 'Pure medicinal castor oil.' },
  { externalId: 's-oil-11', name: 'Grapeseed Oil', price: 980, category: 'Oils', unit: '500ml', brand: 'Colavita', image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900', description: 'Light neutral cooking oil.' },
  { externalId: 's-oil-12', name: 'Flaxseed Oil', price: 450, category: 'Oils', unit: '250ml', brand: 'Organic India', image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900', description: 'Omega-3 rich healthy oil.' },
  { externalId: 's-oil-13', name: 'Soybean Refined Oil', price: 135, category: 'Oils', unit: '1L', brand: 'Fortune', image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900', description: 'Daily cooking soya oil.' },
  { externalId: 's-oil-14', name: 'Corn Oil Premium', price: 180, category: 'Oils', unit: '1L', brand: 'Mazola', image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900', description: 'Pure corn germ oil.' },
  { externalId: 's-oil-15', name: 'Walnut Oil', price: 1500, category: 'Oils', unit: '250ml', brand: 'GlobalPick', image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=900', description: 'Nutty gourmet oil.' },

  // SPICES (15)
  { externalId: 's-spi-1', name: 'Organic Turmeric Powder', price: 45, category: 'Spices', unit: '100g', brand: 'Catch', image: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Pure turmeric powder.' },
  { externalId: 's-spi-2', name: 'Whole Black Peppercorns', price: 80, category: 'Spices', unit: '50g', brand: 'Everest', image: 'https://images.pexels.com/photos/4198024/pexels-photo-4198024.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Aromatic black pepper.' },
  { externalId: 's-spi-3', name: 'Red Chili Powder (Lal Mirch)', price: 65, category: 'Spices', unit: '200g', brand: 'MDH', image: 'https://images.pexels.com/photos/4198139/pexels-photo-4198139.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Spicy red chili powder.' },
  { externalId: 's-spi-4', name: 'Cumin Seeds (Jeera)', price: 90, category: 'Spices', unit: '100g', brand: 'Catch', image: 'https://images.pexels.com/photos/4198022/pexels-photo-4198022.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Aromatic cumin seeds.' },
  { externalId: 's-spi-5', name: 'Coriander Powder (Dhania)', price: 55, category: 'Spices', unit: '200g', brand: 'Everest', image: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Ground coriander seeds.' },
  { externalId: 's-spi-6', name: 'Green Cardamom (Elaichi)', price: 250, category: 'Spices', unit: '50g', brand: 'MDH', image: 'https://images.pexels.com/photos/4198024/pexels-photo-4198024.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Premium whole cardamom.' },
  { externalId: 's-spi-7', name: 'Cloves (Laung)', price: 120, category: 'Spices', unit: '50g', brand: 'Everest', image: 'https://images.pexels.com/photos/4198024/pexels-photo-4198024.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Strong whole cloves.' },
  { externalId: 's-spi-8', name: 'Cinnamon Sticks', price: 110, category: 'Spices', unit: '50g', brand: 'Catch', image: 'https://images.pexels.com/photos/4198024/pexels-photo-4198024.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Whole cinnamon quills.' },
  { externalId: 's-spi-9', name: 'Garam Masala', price: 95, category: 'Spices', unit: '100g', brand: 'MDH', image: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Traditional spice blend.' },
  { externalId: 's-spi-10', name: 'Saffron (Kesar)', price: 350, category: 'Spices', unit: '1g', brand: 'BabyBrand', image: 'https://images.pexels.com/photos/4198024/pexels-photo-4198024.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Pure Kashmiri saffron.' },
  { externalId: 's-spi-11', name: 'Star Anise', price: 75, category: 'Spices', unit: '25g', brand: 'Everest', image: 'https://images.pexels.com/photos/4198024/pexels-photo-4198024.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Whole star anise pods.' },
  { externalId: 's-spi-12', name: 'Bay Leaves (Tejpatta)', price: 30, category: 'Spices', unit: '20g', brand: 'Catch', image: 'https://images.pexels.com/photos/4198024/pexels-photo-4198024.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Dried aromatic leaves.' },
  { externalId: 's-spi-13', name: 'Nutmeg Whole', price: 60, category: 'Spices', unit: '2pcs', brand: 'MDH', image: 'https://images.pexels.com/photos/4198024/pexels-photo-4198024.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Whole nutmeg seeds.' },
  { externalId: 's-spi-14', name: 'Black Salt Powder', price: 40, category: 'Spices', unit: '100g', brand: 'Catch', image: 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Tangy black rock salt.' },
  { externalId: 's-spi-15', name: 'Fenugreek Seeds (Methi)', price: 50, category: 'Spices', unit: '100g', brand: 'Everest', image: 'https://images.pexels.com/photos/4198022/pexels-photo-4198022.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Bitter whole methi seeds.' },

  // BREAKFAST (15)
  { externalId: 's-bre-1', name: 'Rolled Oats', price: 160, category: 'Breakfast', unit: '1kg', brand: 'Quaker', image: 'https://images.pexels.com/photos/543730/pexels-photo-543730.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Whole grain rolled oats.' },
  { externalId: 's-bre-2', name: 'Honey Nut Muesli', price: 280, category: 'Breakfast', unit: '500g', brand: 'Kelloggs', image: 'https://images.pexels.com/photos/4137910/pexels-photo-4137910.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Crunchy fruit muesli.' },
  { externalId: 's-bre-3', name: 'Corn Flakes Original', price: 190, category: 'Breakfast', unit: '475g', brand: 'Kelloggs', image: 'https://images.pexels.com/photos/4137910/pexels-photo-4137910.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Classic toasted corn cereal.' },
  { externalId: 's-bre-4', name: 'Chocos Cereal', price: 210, category: 'Breakfast', unit: '375g', brand: 'Kelloggs', image: 'https://images.pexels.com/photos/4137910/pexels-photo-4137910.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Chocolatey wheat scoops.' },
  { externalId: 's-bre-5', name: 'Peanut Butter Creamy', price: 180, category: 'Breakfast', unit: '340g', brand: 'Sundrop', image: 'https://images.pexels.com/photos/3652898/pexels-photo-3652898.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Smooth peanut spread.' },
  { externalId: 's-bre-6', name: 'Fruit Jam Mixed', price: 140, category: 'Breakfast', unit: '500g', brand: 'Kissan', image: 'https://images.pexels.com/photos/3652898/pexels-photo-3652898.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Sweet fruit jam.' },
  { externalId: 's-bre-7', name: 'Instant Upma Mix', price: 65, category: 'Breakfast', unit: '200g', brand: 'MTR', image: 'https://images.pexels.com/photos/543730/pexels-photo-543730.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Easy cook breakfast mix.' },
  { externalId: 's-bre-8', name: 'Honey Pure Natural', price: 240, category: 'Breakfast', unit: '500g', brand: 'Dabur', image: 'https://images.pexels.com/photos/3652898/pexels-photo-3652898.jpeg?auto=compress&cs=tinysrgb&w=900', description: '100% pure honey.' },
  { externalId: 's-bre-9', name: 'Granola Bars Assorted', price: 150, category: 'Breakfast', unit: '6pcs', brand: 'YogaBar', image: 'https://images.pexels.com/photos/4137910/pexels-photo-4137910.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Healthy snacking bars.' },
  { externalId: 's-bre-10', name: 'Vermicelli Roasted', price: 45, category: 'Breakfast', unit: '450g', brand: 'Bambino', image: 'https://images.pexels.com/photos/543730/pexels-photo-543730.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Roasted wheat vermicelli.' },
  { externalId: 's-bre-11', name: 'Maple Syrup', price: 850, category: 'Breakfast', unit: '250ml', brand: 'GlobalPick', image: 'https://images.pexels.com/photos/3652898/pexels-photo-3652898.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Pure Canadian maple syrup.' },
  { externalId: 's-bre-12', name: 'Pancake Mix', price: 160, category: 'Breakfast', unit: '500g', brand: 'BettyCrocker', image: 'https://images.pexels.com/photos/543730/pexels-photo-543730.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Instant fluffy pancake mix.' },
  { externalId: 's-bre-13', name: 'Chia Seeds Organic', price: 320, category: 'Breakfast', unit: '200g', brand: 'Organic India', image: 'https://images.pexels.com/photos/4137910/pexels-photo-4137910.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Healthy superfood seeds.' },
  { externalId: 's-bre-14', name: 'Chocolate Hazelnut Spread', price: 380, category: 'Breakfast', unit: '350g', brand: 'Nutella', image: 'https://images.pexels.com/photos/3652898/pexels-photo-3652898.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Creamy hazelnut spread.' },
  { externalId: 's-bre-15', name: 'Idli Podi (Gunpowder)', price: 75, category: 'Breakfast', unit: '100g', brand: 'MTR', image: 'https://images.pexels.com/photos/543730/pexels-photo-543730.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Spicy lentil dip powder.' },

  // DRY FRUITS (15)
  { externalId: 's-dry-1', name: 'California Almonds', price: 450, category: 'Dry Fruits', unit: '500g', brand: 'Happilo', image: 'https://images.pexels.com/photos/3997459/pexels-photo-3997459.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Crunchy premium almonds.' },
  { externalId: 's-dry-2', name: 'Whole Cashew Nuts', price: 480, category: 'Dry Fruits', unit: '500g', brand: 'NuttyGritties', image: 'https://images.pexels.com/photos/3997458/pexels-photo-3997458.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Creamy large cashews.' },
  { externalId: 's-dry-3', name: 'Shelled Walnuts', price: 650, category: 'Dry Fruits', unit: '250g', brand: 'Happilo', image: 'https://images.pexels.com/photos/3997459/pexels-photo-3997459.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Brain boosting walnut halves.' },
  { externalId: 's-dry-4', name: 'Pistachios Roasted', price: 580, category: 'Dry Fruits', unit: '250g', brand: 'NuttyGritties', image: 'https://images.pexels.com/photos/3997458/pexels-photo-3997458.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Salted roasted pistachios.' },
  { externalId: 's-dry-5', name: 'Dried Raisins (Kishmish)', price: 150, category: 'Dry Fruits', unit: '250g', brand: 'Happilo', image: 'https://images.pexels.com/photos/3997459/pexels-photo-3997459.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Sweet green raisins.' },
  { externalId: 's-dry-6', name: 'Dried Dates (Khajoor)', price: 210, category: 'Dry Fruits', unit: '500g', brand: 'Lion', image: 'https://images.pexels.com/photos/3997458/pexels-photo-3997458.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Natural sweet seeded dates.' },
  { externalId: 's-dry-7', name: 'Anjeer (Dried Figs)', price: 850, category: 'Dry Fruits', unit: '250g', brand: 'NuttyGritties', image: 'https://images.pexels.com/photos/3997459/pexels-photo-3997459.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Soft premium dried figs.' },
  { externalId: 's-dry-8', name: 'Apricots Dried', price: 420, category: 'Dry Fruits', unit: '250g', brand: 'Happilo', image: 'https://images.pexels.com/photos/3997458/pexels-photo-3997458.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Tangy sweet dried apricots.' },
  { externalId: 's-dry-9', name: 'Dried Cranberries', price: 340, category: 'Dry Fruits', unit: '200g', brand: 'NuttyGritties', image: 'https://images.pexels.com/photos/3997459/pexels-photo-3997459.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Sweet tart cranberries.' },
  { externalId: 's-dry-10', name: 'Pecan Nuts', price: 1200, category: 'Dry Fruits', unit: '200g', brand: 'GlobalPick', image: 'https://images.pexels.com/photos/3997458/pexels-photo-3997458.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Buttery premium pecans.' },
  { externalId: 's-dry-11', name: 'Brazil Nuts', price: 1500, category: 'Dry Fruits', unit: '200g', brand: 'GlobalPick', image: 'https://images.pexels.com/photos/3997459/pexels-photo-3997459.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Large selenium rich nuts.' },
  { externalId: 's-dry-12', name: 'Hazelnut Shelled', price: 950, category: 'Dry Fruits', unit: '200g', brand: 'Happilo', image: 'https://images.pexels.com/photos/3997458/pexels-photo-3997458.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Aromatic raw hazelnuts.' },
  { externalId: 's-dry-13', name: 'Pine Nuts (Chilgoza)', price: 3500, category: 'Dry Fruits', unit: '100g', brand: 'NuttyGritties', image: 'https://images.pexels.com/photos/3997459/pexels-photo-3997459.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Exotic wild pine nuts.' },
  { externalId: 's-dry-14', name: 'Prunes Pitted', price: 460, category: 'Dry Fruits', unit: '250g', brand: 'Del Monte', image: 'https://images.pexels.com/photos/3997458/pexels-photo-3997458.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Soft sweet pitted prunes.' },
  { externalId: 's-dry-15', name: 'Makhana (Fox Nuts)', price: 180, category: 'Dry Fruits', unit: '100g', brand: 'Happilo', image: 'https://images.pexels.com/photos/3997459/pexels-photo-3997459.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Healthy roasted lotus seeds.' },

  // SNACKS (15)
  { externalId: 's-sna-1', name: 'Classic Potato Chips', price: 20, category: 'Snacks', unit: '50g', brand: 'Lays', image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Crispy salted chips.' },
  { externalId: 's-sna-2', name: 'Digestive Biscuits', price: 35, category: 'Snacks', unit: '150g', brand: 'Britannia', image: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Healthy multigrain biscuits.' },
  { externalId: 's-sna-3', name: 'Milk Chocolate Bar', price: 80, category: 'Snacks', unit: '100g', brand: 'Cadbury', image: 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Smooth dairy milk.' },
  { externalId: 's-sna-4', name: 'Roasted Peanuts', price: 50, category: 'Snacks', unit: '200g', brand: 'Haldirams', image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Salted crunchy peanuts.' },
  { externalId: 's-sna-5', name: 'Instant Noodles', price: 15, category: 'Snacks', unit: '70g', brand: 'Maggi', image: 'https://images.pexels.com/photos/2664216/pexels-photo-2664216.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Favorite 2-minute noodles.' },
  { externalId: 's-sna-6', name: 'Popcorn Kernels', price: 60, category: 'Snacks', unit: '500g', brand: 'ACT II', image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Yellow corn for popping.' },
  { externalId: 's-sna-7', name: 'Tortilla Chips', price: 95, category: 'Snacks', unit: '150g', brand: 'Doritos', image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Crunchy nacho cheese chips.' },
  { externalId: 's-sna-8', name: 'Pretzels Salted', price: 120, category: 'Snacks', unit: '200g', brand: 'GlobalPick', image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Crunchy twisted pretzels.' },
  { externalId: 's-sna-9', name: 'Dark Chocolate 70%', price: 250, category: 'Snacks', unit: '100g', brand: 'Amul', image: 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Rich bittersweet chocolate.' },
  { externalId: 's-sna-10', name: 'Gummy Bears', price: 60, category: 'Snacks', unit: '100g', brand: 'Haribo', image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Soft fruity chewy candy.' },
  { externalId: 's-sna-11', name: 'Rice Crackers', price: 85, category: 'Snacks', unit: '100g', brand: 'GlobalPick', image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Light crispy rice snacks.' },
  { externalId: 's-sna-12', name: 'Corn Puffs', price: 40, category: 'Snacks', unit: '75g', brand: 'Kurkure', image: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Spicy crunchy corn sticks.' },
  { externalId: 's-sna-13', name: 'Wafer Biscuits', price: 30, category: 'Snacks', unit: '75g', brand: 'Pickwick', image: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Thin crispy cream wafers.' },
  { externalId: 's-sna-14', name: 'Pistachio Biscuits', price: 45, category: 'Snacks', unit: '150g', brand: 'Parle', image: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Sweet biscuits with nuts.' },
  { externalId: 's-sna-15', name: 'Fruit & Nut Bar', price: 40, category: 'Snacks', unit: '40g', brand: 'Cadbury', image: 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Chocolate with fruit & nuts.' },

  // BEVERAGES (15)
  { externalId: 's-bev-1', name: 'Pure Orange Juice', price: 110, category: 'Beverages', unit: '1L', brand: 'Real', image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'No added sugar juice.' },
  { externalId: 's-bev-2', name: 'Assam Strong Tea', price: 140, category: 'Beverages', unit: '250g', brand: 'Tata Tea', image: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Rich black tea leaves.' },
  { externalId: 's-bev-3', name: 'Instant Coffee Powder', price: 320, category: 'Beverages', unit: '100g', brand: 'Nescafe', image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Rich roasted coffee.' },
  { externalId: 's-bev-4', name: 'Sparkling Water', price: 60, category: 'Beverages', unit: '500ml', brand: 'Perrier', image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Bubbly mineral water.' },
  { externalId: 's-bev-5', name: 'Cola Soft Drink', price: 40, category: 'Beverages', unit: '600ml', brand: 'Coca Cola', image: 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Classic fizzy drink.' },
  { externalId: 's-bev-6', name: 'Coconut Water', price: 50, category: 'Beverages', unit: '200ml', brand: 'PaperBoat', image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Pure tender coconut.' },
  { externalId: 's-bev-7', name: 'Green Tea Bags', price: 210, category: 'Beverages', unit: '25pcs', brand: 'Lipton', image: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Healthy green tea.' },
  { externalId: 's-bev-8', name: 'Apple Juice Tetra', price: 95, category: 'Beverages', unit: '1L', brand: 'BNatural', image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Sweet clear apple juice.' },
  { externalId: 's-bev-9', name: 'Energy Drink', price: 110, category: 'Beverages', unit: '250ml', brand: 'Red Bull', image: 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Energy boosting drink.' },
  { externalId: 's-bev-10', name: 'Tomato Juice', price: 120, category: 'Beverages', unit: '1L', brand: 'Real', image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Spicy savory juice.' },
  { externalId: 's-bev-11', name: 'Lemonade Can', price: 35, category: 'Beverages', unit: '300ml', brand: 'Sprite', image: 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Refreshing lemon drink.' },
  { externalId: 's-bev-12', name: 'Iced Coffee Latte', price: 65, category: 'Beverages', unit: '200ml', brand: 'Amul', image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Cold creamy coffee.' },
  { externalId: 's-bev-13', name: 'Aloe Vera Juice', price: 250, category: 'Beverages', unit: '1L', brand: 'Patanjali', image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Healthy detox drink.' },
  { externalId: 's-bev-14', name: 'Chamomile Tea', price: 340, category: 'Beverages', unit: '20pcs', brand: 'Twinings', image: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Calming herbal tea.' },
  { externalId: 's-bev-15', name: 'Drinking Water', price: 20, category: 'Beverages', unit: '1L', brand: 'Bisleri', image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Pure mineral water.' },

  // FROZEN FOODS (15)
  { externalId: 's-fro-1', name: 'Frozen Garden Peas', price: 90, category: 'Frozen Foods', unit: '500g', brand: 'Safal', image: 'https://images.pexels.com/photos/255469/pexels-photo-255469.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Sweet frozen peas.' },
  { externalId: 's-fro-2', name: 'Veggie Margherita Pizza', price: 220, category: 'Frozen Foods', unit: '350g', brand: 'McCain', image: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Classic cheesy pizza.' },
  { externalId: 's-fro-3', name: 'French Fries Classic', price: 140, category: 'Frozen Foods', unit: '750g', brand: 'McCain', image: 'https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Golden crispy fries.' },
  { externalId: 's-fro-4', name: 'Frozen Sweet Corn', price: 85, category: 'Frozen Foods', unit: '500g', brand: 'Safal', image: 'https://images.pexels.com/photos/255469/pexels-photo-255469.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Juicy golden corn.' },
  { externalId: 's-fro-5', name: 'Chicken Nuggets', price: 320, category: 'Frozen Foods', unit: '500g', brand: 'Venky', image: 'https://images.pexels.com/photos/255469/pexels-photo-255469.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Breaded chicken snacks.' },
  { externalId: 's-fro-6', name: 'Vegetable Spring Rolls', price: 180, category: 'Frozen Foods', unit: '10pcs', brand: 'Godrej', image: 'https://images.pexels.com/photos/255469/pexels-photo-255469.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Crispy veggie rolls.' },
  { externalId: 's-fro-7', name: 'Frozen Blueberries', price: 450, category: 'Frozen Foods', unit: '250g', brand: 'GlobalPick', image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Frozen antioxidant berries.' },
  { externalId: 's-fro-8', name: 'Paneer Tikka Frozen', price: 280, category: 'Frozen Foods', unit: '300g', brand: 'ITC', image: 'https://images.pexels.com/photos/255469/pexels-photo-255469.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Marinated paneer snacks.' },
  { externalId: 's-fro-9', name: 'Frozen Mixed Veg', price: 110, category: 'Frozen Foods', unit: '500g', brand: 'Safal', image: 'https://images.pexels.com/photos/255469/pexels-photo-255469.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Carrot, corn and peas.' },
  { externalId: 's-fro-10', name: 'Chicken Tikka Pizza', price: 290, category: 'Frozen Foods', unit: '400g', brand: 'Godrej', image: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Spicy chicken pizza.' },
  { externalId: 's-fro-11', name: 'Frozen Prawns', price: 580, category: 'Frozen Foods', unit: '500g', brand: 'ITC', image: 'https://images.pexels.com/photos/255469/pexels-photo-255469.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Cleaned frozen prawns.' },
  { externalId: 's-fro-12', name: 'Potato Wedges', price: 160, category: 'Frozen Foods', unit: '750g', brand: 'McCain', image: 'https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Spiced thick wedges.' },
  { externalId: 's-fro-13', name: 'Ice Cream Vanilla', price: 210, category: 'Frozen Foods', unit: '700ml', brand: 'Amul', image: 'https://images.pexels.com/photos/1352296/pexels-photo-1352296.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Classic creamy vanilla.' },
  { externalId: 's-fro-14', name: 'Falafel Mix Frozen', price: 195, category: 'Frozen Foods', unit: '300g', brand: 'GlobalPick', image: 'https://images.pexels.com/photos/255469/pexels-photo-255469.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Middle eastern snacks.' },
  { externalId: 's-fro-15', name: 'Frozen Strawberries', price: 340, category: 'Frozen Foods', unit: '250g', brand: 'GlobalPick', image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Flash frozen berries.' },

  // PERSONAL CARE (15)
  { externalId: 's-per-1', name: 'Herbal Aloe Shampoo', price: 180, category: 'Personal Care', unit: '200ml', brand: 'Himalaya', image: 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Soft hair shampoo.' },
  { externalId: 's-per-2', name: 'Charcoal Face Wash', price: 150, category: 'Personal Care', unit: '100ml', brand: 'Neutrogena', image: 'https://images.pexels.com/photos/3762871/pexels-photo-3762871.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Deep clean wash.' },
  { externalId: 's-per-3', name: 'Moisturizing Lotion', price: 240, category: 'Personal Care', unit: '200ml', brand: 'Nivea', image: 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Soft skin body lotion.' },
  { externalId: 's-per-4', name: 'Antiseptic Liquid', price: 110, category: 'Personal Care', unit: '500ml', brand: 'Dettol', image: 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Trusted protection liquid.' },
  { externalId: 's-per-5', name: 'Toothpaste Mint', price: 95, category: 'Personal Care', unit: '150g', brand: 'Colgate', image: 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Fresh breath paste.' },
  { externalId: 's-per-6', name: 'Bath Soap Rose', price: 40, category: 'Personal Care', unit: '125g', brand: 'Lux', image: 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Fragrant bath soap.' },
  { externalId: 's-per-7', name: 'Deodorant Spray', price: 190, category: 'Personal Care', unit: '150ml', brand: 'Axe', image: 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Long lasting fragrance.' },
  { externalId: 's-per-8', name: 'Sunscreen SPF 50', price: 450, category: 'Personal Care', unit: '50ml', brand: 'Lotus', image: 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'UVA/UVB protection.' },
  { externalId: 's-per-9', name: 'Hand Wash Refill', price: 120, category: 'Personal Care', unit: '750ml', brand: 'Dettol', image: 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Anti-germ hand wash.' },
  { externalId: 's-per-10', name: 'Shaving Foam', price: 210, category: 'Personal Care', unit: '200g', brand: 'Gillette', image: 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Smooth shave foam.' },
  { externalId: 's-per-11', name: 'Mouthwash Cool Mint', price: 160, category: 'Personal Care', unit: '250ml', brand: 'Listerine', image: 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Total mouth protection.' },
  { externalId: 's-per-12', name: 'Hair Oil Coconut', price: 90, category: 'Personal Care', unit: '200ml', brand: 'Parachute', image: 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Pure coconut hair oil.' },
  { externalId: 's-per-13', name: 'Body Wash Gel', price: 180, category: 'Personal Care', unit: '250ml', brand: 'Dove', image: 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Nourishing shower gel.' },
  { externalId: 's-per-14', name: 'Face Mask Sheet', price: 99, category: 'Personal Care', unit: '1pc', brand: 'Garnier', image: 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Instant glow mask.' },
  { externalId: 's-per-15', name: 'Hand Sanitizer', price: 50, category: 'Personal Care', unit: '50ml', brand: 'Lifebuoy', image: 'https://images.pexels.com/photos/3736399/pexels-photo-3736399.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Instant germ protection.' },

  // HOUSEHOLD (15)
  { externalId: 's-hou-1', name: 'Liquid Laundry Detergent', price: 340, category: 'Household', unit: '1L', brand: 'Surf Excel', image: 'https://images.pexels.com/photos/5217911/pexels-photo-5217911.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Clean fresh clothes.' },
  { externalId: 's-hou-2', name: 'Multi-Surface Cleaner', price: 95, category: 'Household', unit: '500ml', brand: 'Lizol', image: 'https://images.pexels.com/photos/4049517/pexels-photo-4049517.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Surface disinfectant.' },
  { externalId: 's-hou-3', name: 'Dishwash Liquid', price: 110, category: 'Household', unit: '500ml', brand: 'Vim', image: 'https://images.pexels.com/photos/4049517/pexels-photo-4049517.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Lemon fresh dish wash.' },
  { externalId: 's-hou-4', name: 'Kitchen Paper Towels', price: 80, category: 'Household', unit: '2ply', brand: 'Selpak', image: 'https://images.pexels.com/photos/4049517/pexels-photo-4049517.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Absorbent kitchen rolls.' },
  { externalId: 's-hou-5', name: 'Toilet Cleaner Blue', price: 85, category: 'Household', unit: '500ml', brand: 'Harpic', image: 'https://images.pexels.com/photos/4049517/pexels-photo-4049517.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Strong toilet disinfectant.' },
  { externalId: 's-hou-6', name: 'Floor Mop Set', price: 450, category: 'Household', unit: '1set', brand: 'Gala', image: 'https://images.pexels.com/photos/4049517/pexels-photo-4049517.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Microfiber easy mop.' },
  { externalId: 's-hou-7', name: 'Garbage Bags Large', price: 120, category: 'Household', unit: '30pcs', brand: 'KitchenHelper', image: 'https://images.pexels.com/photos/4049517/pexels-photo-4049517.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Heavy duty trash bags.' },
  { externalId: 's-hou-8', name: 'Aluminum Foil Roll', price: 140, category: 'Household', unit: '18m', brand: 'FreshWrap', image: 'https://images.pexels.com/photos/4049517/pexels-photo-4049517.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Food grade packing foil.' },
  { externalId: 's-hou-9', name: 'Air Freshener Spray', price: 160, category: 'Household', unit: '300ml', brand: 'AirWick', image: 'https://images.pexels.com/photos/4049517/pexels-photo-4049517.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Floral scent air spray.' },
  { externalId: 's-hou-10', name: 'Sponge Scrubber', price: 40, category: 'Household', unit: '3pcs', brand: 'ScotchBrite', image: 'https://images.pexels.com/photos/4049517/pexels-photo-4049517.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Durable dish scrubbers.' },
  { externalId: 's-hou-11', name: 'Fabric Conditioner', price: 210, category: 'Household', unit: '800ml', brand: 'Comfort', image: 'https://images.pexels.com/photos/5217911/pexels-photo-5217911.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Soft fragrant laundry.' },
  { externalId: 's-hou-12', name: 'Glass Cleaner', price: 75, category: 'Household', unit: '500ml', brand: 'Colin', image: 'https://images.pexels.com/photos/4049517/pexels-photo-4049517.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Shine for all glass.' },
  { externalId: 's-hou-13', name: 'Shoe Polish Black', price: 55, category: 'Household', unit: '40g', brand: 'Cherry', image: 'https://images.pexels.com/photos/4049517/pexels-photo-4049517.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Shine for leather shoes.' },
  { externalId: 's-hou-14', name: 'Mosquito Repellent', price: 90, category: 'Household', unit: '45ml', brand: 'AllOut', image: 'https://images.pexels.com/photos/4049517/pexels-photo-4049517.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Vaporizer for mosquitoes.' },
  { externalId: 's-hou-15', name: 'Matches Box', price: 15, category: 'Household', unit: '10pk', brand: 'Ship', image: 'https://images.pexels.com/photos/4049517/pexels-photo-4049517.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Safe matchsticks.' },

  // PET CARE (15)
  { externalId: 's-pet-1', name: 'Adult Dog Food - Chicken', price: 650, category: 'Pet Care', unit: '3kg', brand: 'Pedigree', image: 'https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Balanced nutrition dog food.' },
  { externalId: 's-pet-2', name: 'Crunchy Cat Treats', price: 140, category: 'Pet Care', unit: '100g', brand: 'Whiskas', image: 'https://images.pexels.com/photos/45201/kitty-cat-baby-akita-45201.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Soft center cat treats.' },
  { externalId: 's-pet-3', name: 'Puppy Dry Food', price: 420, category: 'Pet Care', unit: '1.2kg', brand: 'RoyalCanin', image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Growth food for puppies.' },
  { externalId: 's-pet-4', name: 'Cat Litter Fragrant', price: 380, category: 'Pet Care', unit: '5kg', brand: 'TidyCats', image: 'https://images.pexels.com/photos/45201/kitty-cat-baby-akita-45201.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Odor control cat litter.' },
  { externalId: 's-pet-5', name: 'Dog Chew Bones', price: 150, category: 'Pet Care', unit: '2pcs', brand: 'PetMunch', image: 'https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Long lasting dental chews.' },
  { externalId: 's-pet-6', name: 'Bird Seed Mix', price: 210, category: 'Pet Care', unit: '1kg', brand: 'FeatheredFriend', image: 'https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Nutritious mix for birds.' },
  { externalId: 's-pet-7', name: 'Pet Shampoo Gentle', price: 280, category: 'Pet Care', unit: '250ml', brand: 'HimalayaPets', image: 'https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Conditioning pet shampoo.' },
  { externalId: 's-pet-8', name: 'Kitten Wet Food', price: 45, category: 'Pet Care', unit: '85g', brand: 'Sheba', image: 'https://images.pexels.com/photos/45201/kitty-cat-baby-akita-45201.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Fine meat for kittens.' },
  { externalId: 's-pet-9', name: 'Dog Leash Durable', price: 350, category: 'Pet Care', unit: '1pc', brand: 'PetMate', image: 'https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Nylon leash for dogs.' },
  { externalId: 's-pet-10', name: 'Fish Flake Food', price: 120, category: 'Pet Care', unit: '50g', brand: 'Tetra', image: 'https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Complete food for fish.' },
  { externalId: 's-pet-11', name: 'Pet De-shedding Tool', price: 450, category: 'Pet Care', unit: '1pc', brand: 'Furminator', image: 'https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Professional grooming brush.' },
  { externalId: 's-pet-12', name: 'Guinea Pig Pellets', price: 290, category: 'Pet Care', unit: '800g', brand: 'Zupreem', image: 'https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Daily food for small pets.' },
  { externalId: 's-pet-13', name: 'Pet Odor Remover', price: 240, category: 'Pet Care', unit: '500ml', brand: 'NatureMiracle', image: 'https://images.pexels.com/photos/59523/pexels-photo-59523.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Enzymatic stain remover.' },
  { externalId: 's-pet-14', name: 'Dog Squeaky Toy', price: 180, category: 'Pet Care', unit: '1pc', brand: 'Kong', image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Durable play toy.' },
  { externalId: 's-pet-15', name: 'Catnip Spray', price: 160, category: 'Pet Care', unit: '30ml', brand: 'Kong', image: 'https://images.pexels.com/photos/45201/kitty-cat-baby-akita-45201.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Stimulating spray for cats.' },
];

router.post('/seed', async (req, res) => {
  try {
    await Product.deleteMany({});
    const products = await Product.insertMany(seedData.map(p => ({
      ...p,
      source: 'manual',
      stock: 100,
      rating: 4.5
    })));
    productCache = { expiresAt: 0, products: [] };
    res.json({ message: 'Database seeded successfully', count: products.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/refresh', async (req, res) => {
  productCache = {
    expiresAt: 0,
    products: [],
  };
  const results = await Promise.allSettled(productQueries.map(fetchOpenFoodFactsProducts));
  const importedProducts = results
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => result.value);
  const products = importedProducts.length ? await saveProducts(importedProducts) : await Product.find({}).sort({ createdAt: -1 });
  res.json({ count: products.length });
});

module.exports = router;
