import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabase.config';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public client: SupabaseClient;

  constructor() {
    this.client = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  }

  // Storage helper to upload product images
  async uploadProductImage(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await this.client.storage
        .from('stockview-assets')
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.warn('Supabase storage bucket upload info:', error.message);
        // Fallback: return data URL for local preview if bucket is not created
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      }

      const { data: publicUrlData } = this.client.storage
        .from('stockview-assets')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Storage upload exception:', err);
      return null;
    }
  }
}
