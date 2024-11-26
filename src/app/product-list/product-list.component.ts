import {Component} from '@angular/core';
import { TakealotProductService } from '../services/takealot-product.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [NgFor,NgIf],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent{
  products: any[] = [];
  productIds: string[] = [];
  isLoading: boolean = false;

  constructor(private productService: TakealotProductService) {}

  // Save product IDs to a local file
  saveProductIds(): void {
    this.productService.saveProductIds(this.productIds);
  }

  // Fetch product data using the string IDs read from the file
  fetchProducts(ids: string[]): void {
    this.isLoading = true; // Set loading flag to true

    // Call service to get products
    this.productService.getProducts(ids).subscribe(
      (data) => {
        this.products = data; // Update products with fetched data
        this.isLoading = false; // Set loading flag to false once data is fetched
      },
      (error) => {
        console.error('Error fetching products:', error);
        this.isLoading = false; // Set loading flag to false on error
      }
    );
  }

  // Handles file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.productIds = JSON.parse(reader.result as string);
        console.log('Product IDs:', this.productIds);
        // Fetch products once the file is read
        this.fetchProducts(this.productIds);
      };
      reader.readAsText(file);
    }
  }
}
