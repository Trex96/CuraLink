'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Publication } from '@/types';
import { ExternalLink, Edit, Save, X, Calendar, Hash, Link, Download, FileText } from 'lucide-react';

interface PublicationCardProps {
  publication: Publication;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Publication>) => void;
}

export function PublicationCard({ publication, onDelete, onUpdate }: PublicationCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPublication, setEditedPublication] = useState(publication);

  const handleSave = () => {
    onUpdate(publication._id, editedPublication);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPublication(publication);
    setIsEditing(false);
  };

  const handleChange = (field: keyof Publication, value: string | number | Date | string[]) => {
    setEditedPublication(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editedPublication.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="font-bold text-lg"
            />
            <Textarea
              value={editedPublication.abstract}
              onChange={(e) => handleChange('abstract', e.target.value)}
              className="text-sm"
              rows={3}
            />
          </div>
        ) : (
          <>
            <CardTitle className="text-lg leading-tight">{publication.title}</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2">
              <span>{publication.authors.join(', ')}</span>
              <span>•</span>
              <span className="font-medium">{publication.journal}</span>
              <span>•</span>
              <span className="flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                {new Date(publication.publicationDate).toLocaleDateString()}
              </span>
            </CardDescription>
          </>
        )}
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="journal">Journal</Label>
                <Input
                  id="journal"
                  value={editedPublication.journal}
                  onChange={(e) => handleChange('journal', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicationDate">Publication Date</Label>
                <Input
                  id="publicationDate"
                  type="date"
                  value={new Date(editedPublication.publicationDate).toISOString().split('T')[0]}
                  onChange={(e) => handleChange('publicationDate', new Date(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doi">DOI</Label>
                <Input
                  id="doi"
                  value={editedPublication.doi || ''}
                  onChange={(e) => handleChange('doi', e.target.value)}
                  placeholder="DOI (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pmid">PMID</Label>
                <Input
                  id="pmid"
                  value={editedPublication.pmid || ''}
                  onChange={(e) => handleChange('pmid', e.target.value)}
                  placeholder="PMID (optional)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="citations">Citations</Label>
              <Input
                id="citations"
                type="number"
                value={editedPublication.citations || 0}
                onChange={(e) => handleChange('citations', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authors">Authors (comma separated)</Label>
              <Input
                id="authors"
                value={editedPublication.authors.join(', ')}
                onChange={(e) => handleChange('authors', e.target.value.split(',').map(a => a.trim()))}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {publication.abstract && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {publication.abstract}
              </p>
            )}

            {publication.description && (
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <p className="text-sm">{publication.description}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {publication.doi && (
                <Badge variant="secondary" className="flex items-center">
                  <Link className="mr-1 h-3 w-3" />
                  DOI
                </Badge>
              )}
              {publication.pmid && (
                <Badge variant="secondary" className="flex items-center">
                  <Hash className="mr-1 h-3 w-3" />
                  PMID
                </Badge>
              )}
              {publication.pdfFile && (
                <Badge variant="secondary" className="flex items-center">
                  <FileText className="mr-1 h-3 w-3" />
                  PDF Attached
                </Badge>
              )}
              <Badge variant="outline">
                {publication.citations || 0} citations
              </Badge>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          {publication.doi && (
            <Button variant="outline" size="sm" asChild>
              <a href={`https://doi.org/${publication.doi}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                DOI
              </a>
            </Button>
          )}
          {publication.pmid && (
            <Button variant="outline" size="sm" asChild>
              <a href={`https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                PubMed
              </a>
            </Button>
          )}
          {publication.pdfFile && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/publications/download/${publication._id}`} download>
                <Download className="mr-1 h-3 w-3" />
                PDF
              </a>
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="mr-1 h-3 w-3" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-1 h-3 w-3" />
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="mr-1 h-3 w-3" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(publication._id)}>
                Delete
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}