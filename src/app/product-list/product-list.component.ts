import {Component} from '@angular/core';
import { TakealotProductService } from '../services/takealot-product.service';
import {DatePipe, NgFor, NgIf} from '@angular/common';
import { Product, PriceHistory } from '../models/product-model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent{
  products: Product[] = [];
  errorMessage: string | null = null;

  constructor(private TakealotProductService: TakealotProductService) {}

  // Handle user file input
  onFileUpload(event: any): void {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          this.products = JSON.parse(e.target?.result as string);
          this.errorMessage = null;
        } catch (error) {
          this.errorMessage = 'Invalid JSON file.';
        }
      };
      reader.readAsText(file);
    }
  }

  // Update product details and prices
  updateProductDetails(): void {
    this.products.forEach((product) => {
      this.TakealotProductService.getProductById(product.id).subscribe({
        next: (apiProduct) => {
          const today = new Date().toISOString().split('T')[0]; // Extract date only

          // Update product details
          product.baseId = apiProduct.core.id;
          product.title = apiProduct.title;
          const originalUrl = apiProduct.gallery.images[0];
          const updatedUrl = originalUrl.replace('{size}', 'pdpxl');
          product.image = updatedUrl;
          product.store = "Takealot";
          product.price = apiProduct.buybox.items[0].price;
          const percentage = apiProduct.buybox.items[0].listing_price;
          if(percentage > 0){
            product.salePercentage = 100 - (apiProduct.buybox.items[0].price / apiProduct.buybox.items[0].listing_price) * 100;
          }
          else{
            product.salePercentage = 0;
          }

          // Add to price history
          const newHistory: PriceHistory = {
            price: product.price,
            salePercentage: product.salePercentage,
            date: today,
          };
          product.priceHistory.push(newHistory);
        },
        error: () => {
          console.error(`Failed to fetch data for product ID: ${product.id}`);
        },
      });
    });
  }

  // Download updated products as JSON file
  downloadUpdatedFile(): void {
    const blob = new Blob([JSON.stringify(this.products, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'updated-products.json';
    link.click();
    window.URL.revokeObjectURL(url);
  }

}
