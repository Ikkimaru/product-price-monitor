import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { saveAs } from 'file-saver';

interface Product {
  id: string;
  baseId: number;
  title: string;
  gallery: string;
  store: string;
  price: number;
  salePercentage: number;
  priceHistory: PriceHistory[];
}

interface PriceHistory {
  price: number;
  salePercentage: number;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class TakealotProductService {
  private localFileName = 'product-ids.json'; // Name of the local JSON file
  private apiUrl = 'https://api.takealot.com/rest/v-1-13-0/product-details/PLID';

  private productsInMemory: Product[] = []; // Store products in memory

  constructor(private http: HttpClient) {}

  // Fetch product information by product string IDs and modify image URLs
  getProducts(ids: string[]): Observable<any[]> {
    const requests = ids.map(id => this.http.get(`${this.apiUrl}${id}`));

    return forkJoin(requests).pipe(
      map((products: any[]) => {
        const modifiedProducts = this.modifyImageUrls(ids, products);

        // Call addHistory to update the history with new data in memory
        this.addHistory(modifiedProducts);

        return modifiedProducts;
      })
    );
  }

  mergeData(apiProducts: Product[]): void {
    const fileData = this.productsInMemory; // productsInMemory contains previously loaded data

    // Iterate over the API products and merge them with the existing data
    apiProducts.forEach(apiProduct => {
      const existingProduct = fileData.find(fileProduct => fileProduct.id === apiProduct.id);

      if (existingProduct) {
        // Append new history entries while ensuring no duplicate dates
        apiProduct.priceHistory.forEach(newHistory => {
          // Check if the history already contains this entry by comparing dates
          const isDuplicate = existingProduct.priceHistory.some(history => history.date === newHistory.date);

          if (!isDuplicate) {
            // If it's not a duplicate, add the new history
            existingProduct.priceHistory.push(newHistory);
          }
        });
      } else {
        // If product does not exist, simply add it with its history
        fileData.push(apiProduct);
      }
    });
  }

  private mergePriceHistory(existingHistory: PriceHistory[], newHistory: PriceHistory[]): PriceHistory[] {
    const historyMap = new Map<string, PriceHistory>();

    // Add existing history to the map
    existingHistory.forEach(history => {
      historyMap.set(history.date, history);
    });

    // Add new history entries (avoid duplicates by checking the date)
    newHistory.forEach(history => {
      if (!historyMap.has(history.date)) {
        historyMap.set(history.date, history);
      }
    });

    // Convert the map back to an array and return
    return Array.from(historyMap.values());
  }

  // Modify the gallery image URL by replacing `{size}` with `pdpxl` and capture price, sale percentage, and date of fetch
  modifyImageUrls(ids: string[], products: any[]): any[] {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date (YYYY-MM-DD)

    return products.map((product, index) => {
      if (product.gallery && Array.isArray(product.gallery.images) && product.gallery.images.length > 0) {
        product.gallery.images[0] = product.gallery.images[0].replace('{size}', 'pdpxl');
      }

      const price = product.buybox.items[0].price || 0;
      const listingPrice = product.buybox.items[0].listing_price || 0;
      let salePercentage = 0;
      if (listingPrice !== 0) {
        salePercentage = parseFloat(((price / listingPrice) * 100).toFixed(2));
      }

      // Initialize priceHistory only if it's undefined or empty
      let priceHistory = product.priceHistory || [];

      // If the priceHistory is empty or undefined, initialize it with the current price, sale percentage, and date
      if (!priceHistory.length) {
        priceHistory.push({
          price: price,
          salePercentage: salePercentage,
          date: currentDate
        });
      }

      return {
        id: ids[index],
        baseId: product.core?.id,
        title: product.core?.title,
        gallery: product.gallery?.images?.[0],
        store: 'Takealot',
        price: price,
        salePercentage: salePercentage,
        priceHistory: priceHistory // Ensure priceHistory persists
      };
    });
  }

  // Add new history to the existing product history and ensure duplicates aren't added
  private addHistory(products: Product[]): void {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date (YYYY-MM-DD)

    // Update history for each product in memory
    products.forEach(product => {
      const existingProduct = this.productsInMemory.find(existing => existing.id === product.id);

      if (existingProduct) {

        // Check if the history already contains an entry for the same date
        const isDuplicate = existingProduct.priceHistory.some((history: PriceHistory) =>
          history.date === currentDate
        );

        // If it's not a duplicate (based only on the date), add the new history entry
        if (!isDuplicate) {
          existingProduct.priceHistory.push({
            price: product.price,
            salePercentage: product.salePercentage,
            date: currentDate
          });
        } else {
          console.log('No new history entry added for', product.id, 'on', currentDate);
        }
      } else {
        // If the product does not exist, add it with its priceHistory
        this.productsInMemory.push({
          ...product,
          priceHistory: [{
            price: product.price,
            salePercentage: product.salePercentage,
            date: currentDate
          }]
        });
      }
    });
  }

  // Load existing data from the file (simulate file load)
  loadDataFromFile(file: File): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = JSON.parse(e.target.result);

          // Resolve the promise with the loaded products
          resolve(data.products);
        } catch (error) {
          console.error("Error parsing the file:", error);
          reject(error);
        }
      };

      // Handle file read errors
      reader.onerror = (error) => {
        console.error("File read error:", error);
        reject(error);
      };

      // Read the file as text
      reader.readAsText(file);
    });
  }

  getProductsFromMemory(): Product[]{
    return this.productsInMemory;
  }


  // Save the updated product data to a file (to trigger a download)
  saveData(): void {
    const dataToSave = { products: this.productsInMemory };

    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
    saveAs(blob, this.localFileName); // This triggers a download of the file
  }
}
