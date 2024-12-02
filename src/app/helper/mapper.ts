import { Product } from '../models/product-model';
import { TakealotModel } from '../models/takealot-model';
import {SteamModel} from '../models/steam-model';

export function mapTakealotToProduct(apiProduct: TakealotModel, productId:string): Product {
  const originalUrl = apiProduct.gallery.images[0];
  const percentage = apiProduct.buybox.items[0].listing_price
    ? 100 - (apiProduct.buybox.items[0].price / apiProduct.buybox.items[0].listing_price) * 100
    : 0;

  const roundedPercentage = parseFloat((percentage * 100 / 100).toFixed(2));

  return {
    id: productId,
    baseId: apiProduct.core.id,
    title: apiProduct.title,
    image: originalUrl.replace('{size}', 'pdpxl'),
    url: apiProduct.seo.canonical,
    store: 'Takealot',
    price: apiProduct.buybox.items[0].price,
    salePercentage: roundedPercentage,
    priceHistory: [],
  };
}

export function mapSteamToProduct(apiProduct: SteamModel, productId: string): Product {
  // Access the dynamic property using the productId (appId)
  const productData = apiProduct[productId]?.data;

  if (!productData) {
    throw new Error('Invalid API response: Missing product data');
  }

  return {
    id: productId,
    baseId: Number(productData.steam_appid),
    title: productData.name,
    image: productData.capsule_image,
    url: `https://store.steampowered.com/app/${productId}`,
    store: 'Steam',
    price: productData.price_overview?.final/100 || 0,
    salePercentage: productData.price_overview?.discount_percent || 0,
    priceHistory: [],
  };
}

