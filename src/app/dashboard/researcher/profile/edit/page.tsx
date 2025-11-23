'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { researcherProfileSchema } from '@/lib/validation/researcher';
import Image from 'next/image';

const profileSchema = researcherProfileSchema;

type ProfileFormValues = import('zod').infer<typeof profileSchema>;

export default function EditProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      institution: '',
      bio: '',
      expertise: '',
      orcidId: '',
      openForCollaboration: false,
    },
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      // Note: We would need to fetch full researcher data from API
      // This is a simplified version
      setValue('firstName', user.name?.split(' ')[0] || '');
      setValue('lastName', user.name?.split(' ')[1] || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/researchers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          expertise: data.expertise.split(',').map((item: string) => item.trim()).filter((item: string) => item),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await response.json();

      toast.success('Profile updated', {
        description: 'Your profile has been successfully updated.',
      });

      router.push('/dashboard/researcher');
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to update profile',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file.',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Please upload an image smaller than 5MB.',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/researchers/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const { imageUrl } = await response.json();
      setProfilePicture(imageUrl);

      toast.success('Image uploaded', {
        description: 'Your profile picture has been updated.',
      });
    } catch (error) {
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Failed to upload image',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You need to be logged in as a researcher to edit your profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/auth/signin')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your researcher profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Picture */}
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {profilePicture ? (
                      <Image 
                        src={profilePicture} 
                        alt="Profile" 
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-full w-16 h-16 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                      id="profile-picture-upload"
                    />
                    <label htmlFor="profile-picture-upload">
                      <Button 
                        type="button" 
                        variant="outline" 
                        asChild
                        disabled={isUploading}
                      >
                        <span>{isUploading ? 'Uploading...' : 'Upload New'}</span>
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, or GIF (max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    placeholder="First name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    placeholder="Last name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Institution */}
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  {...register('institution')}
                  placeholder="Your institution"
                />
                {errors.institution && (
                  <p className="text-sm text-red-500">{errors.institution.message}</p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  placeholder="Tell us about your research interests and background"
                  rows={4}
                />
                {errors.bio && (
                  <p className="text-sm text-red-500">{errors.bio.message}</p>
                )}
              </div>

              {/* Expertise */}
              <div className="space-y-2">
                <Label htmlFor="expertise">Expertise</Label>
                <Input
                  id="expertise"
                  {...register('expertise')}
                  placeholder="e.g., Cancer Research, Immunology, Neuroscience (comma separated)"
                />
                {errors.expertise && (
                  <p className="text-sm text-red-500">{errors.expertise.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Enter your areas of expertise separated by commas
                </p>
              </div>

              {/* ORCID */}
              <div className="space-y-2">
                <Label htmlFor="orcidId">ORCID ID</Label>
                <Input
                  id="orcidId"
                  {...register('orcidId')}
                  placeholder="e.g., 0000-0002-1825-0097"
                />
                {errors.orcidId && (
                  <p className="text-sm text-red-500">{errors.orcidId.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Connect your ORCID to automatically import publications
                </p>
              </div>

              {/* Open for Collaboration */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="openForCollaboration">Open for Collaboration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow other researchers to request collaborations with you
                  </p>
                </div>
                <Switch
                  id="openForCollaboration"
                  {...register('openForCollaboration')}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/researcher')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}