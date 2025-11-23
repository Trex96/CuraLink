'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getForumCategories } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  _id: string;
  name: string;
  description: string;
  diseaseCategory: string;
}

export default function ForumCategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    diseaseCategory: ''
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const fetchedCategories = await getForumCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateCategory = async () => {
    try {
      const response = await fetch('/api/forum/categories/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description,
          diseaseCategory: newCategory.diseaseCategory
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      
      setNewCategory({ name: '', description: '', diseaseCategory: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };
  
  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    try {
      const response = await fetch('/api/forum/categories/manage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingCategory._id,
          name: editingCategory.name,
          description: editingCategory.description,
          diseaseCategory: editingCategory.diseaseCategory
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };
  
  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/forum/categories/manage?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="container py-8">
        <PageHeader 
          title="Manage Forum Categories" 
          description="Create, edit, or delete forum categories."
        />
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <PageHeader 
        title="Manage Forum Categories" 
        description="Create, edit, or delete forum categories."
      />
      
      <div className="mb-8 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">
          {editingCategory ? 'Edit Category' : 'Create New Category'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={editingCategory ? editingCategory.name : newCategory.name}
              onChange={(e) => 
                editingCategory 
                  ? setEditingCategory({ ...editingCategory, name: e.target.value })
                  : setNewCategory({ ...newCategory, name: e.target.value })
              }
              placeholder="Enter category name"
            />
          </div>
          
          <div>
            <Label htmlFor="diseaseCategory">Disease Category</Label>
            <Input
              id="diseaseCategory"
              value={editingCategory ? editingCategory.diseaseCategory : newCategory.diseaseCategory}
              onChange={(e) => 
                editingCategory 
                  ? setEditingCategory({ ...editingCategory, diseaseCategory: e.target.value })
                  : setNewCategory({ ...newCategory, diseaseCategory: e.target.value })
              }
              placeholder="Enter disease category"
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editingCategory ? editingCategory.description : newCategory.description}
              onChange={(e) => 
                editingCategory 
                  ? setEditingCategory({ ...editingCategory, description: e.target.value })
                  : setNewCategory({ ...newCategory, description: e.target.value })
              }
              placeholder="Enter category description"
            />
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          {editingCategory ? (
            <>
              <Button onClick={handleUpdateCategory}>Update Category</Button>
              <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
            </>
          ) : (
            <Button onClick={handleCreateCategory}>Create Category</Button>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category._id} className="p-4 border rounded-lg">
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium">{category.name}</h4>
                <p className="text-sm text-muted-foreground">{category.diseaseCategory}</p>
                <p className="text-sm mt-1">{category.description}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingCategory(category)}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteCategory(category._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}