import { supabase } from './supabaseClient';

export interface EmailTemplate {
  id?: string;
  name: string;
  html: string;
  css: string;
  components: any;
  created_at?: string;
  updated_at?: string;
}

export const templateService = {
  async saveTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('templates')
      .insert([{ ...template, updated_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTemplate(id: string, template: Partial<EmailTemplate>) {
    const { data, error } = await supabase
      .from('templates')
      .update({ ...template, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTemplate(id: string) {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async listTemplates() {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async deleteTemplate(id: string) {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
