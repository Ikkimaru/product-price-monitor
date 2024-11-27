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
  productIds: any[] = [];
  isLoading: boolean = false;

  constructor(private takealotProductService: TakealotProductService) {}

  // Save the modified product data to a new file
  saveProductData(): void {
    this.takealotProductService.saveData();
  }

  // Fetch products using the IDs loaded from the JSON file
  fetchProducts(): void {
    this.isLoading = true;
    this.productIds = this.products.map(product => product.id); // Extract product IDs from the products array
    this.takealotProductService.getProducts(this.productIds).subscribe(
      (fetchedProducts) => {
        this.products = fetchedProducts;
      },
      (error) => {
        console.error('Error fetching product data', error);
      }
    );
    this.takealotProductService.mergeData(this.products);
    this.products = this.takealotProductService.getProductsFromMemory();
    this.isLoading = false;
  }

  // Handle file selection and parse the JSON data
  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      // Pass the file to the service method for processing
      this.takealotProductService.loadDataFromFile(file).then(products => {
        // Update the component's products array with the loaded data
        this.products = products;
        console.log("Products loaded into the component:", this.products);
      });
    }
  }

}
