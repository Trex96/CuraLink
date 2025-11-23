'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const templates = [
  {
    id: 1,
    title: "Request More Information",
    content: "Thank you for your question. To provide you with the most accurate information, could you please share more details about [specific aspect]?"
  },
  {
    id: 2,
    title: "Provide General Guidance",
    content: "Based on current research in this area, [general information]. However, it&apos;s important to consult with your healthcare provider for personalized advice."
  },
  {
    id: 3,
    title: "Reference Studies",
    content: "There have been several studies on this topic, including [study name] which found [key findings]. I recommend reviewing the full study for comprehensive information."
  },
  {
    id: 4,
    title: "Clarify Misconceptions",
    content: "I understand your concern about [topic], but current evidence suggests [correct information]. It&apos;s a common misconception that [misconception]."
  }
];

export function QuickResponseTemplates() {
  const handleUseTemplate = (content: string) => {
    // In a real implementation, this would insert the template into a comment form
    console.log('Using template:', content);
    // Copy to clipboard or insert into form
    navigator.clipboard.writeText(content);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Response Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">{template.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{template.content}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleUseTemplate(template.content)}
              >
                Use Template
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}