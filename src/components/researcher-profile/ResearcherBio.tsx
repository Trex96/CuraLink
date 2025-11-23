'use client';

interface ResearcherBioProps {
  bio: string;
}

export function ResearcherBio({ bio }: ResearcherBioProps) {
  return (
    <div>
      <p className="text-muted-foreground">{bio}</p>
    </div>
  );
}