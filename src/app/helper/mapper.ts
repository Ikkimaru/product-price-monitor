import { Product } from '../models/product-model';
import { TakealotModel } from '../models/takealot-model';

export function mapTakealotToProduct(apiProduct: TakealotModel, productId:string): Product {
  const originalUrl = apiProduct.gallery.images[0];
  const percentage = apiProduct.buybox.items[0].listing_price
    ? 100 - (apiProduct.buybox.items[0].price / apiProduct.buybox.items[0].listing_price) * 100
    : 0;

const roundedPercentage = parseFloat((percentage * 100 / 100).toFixed(2));

  return {
    id: productId, // Assuming unique ID
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
